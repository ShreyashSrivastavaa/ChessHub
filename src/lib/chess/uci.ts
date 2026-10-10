import { Chess } from "chess.js";

export interface EngineLine {
  id: number; // MultiPV index 1, 2, 3...
  depth: number;
  seldepth?: number;
  scoreCp?: number; // In centipawns (from White's perspective)
  mate?: number; // In moves (positive = White mates, negative = Black mates)
  rawCp?: number; // From side to move perspective
  rawMate?: number;
  scoreText: string; // "+1.25", "-0.80", "M3", "-M2", "0.00"
  pvUci: string[]; // ["e2e4", "e7e5", ...]
  pvSan: string[]; // ["e4", "e5", "Nf3", ...]
  bestMoveUci: string;
  bestMoveSan: string;
  nodes?: number;
  nps?: number;
}

export interface EngineEval {
  scoreCp?: number; // Centipawns White's perspective
  mate?: number; // Mate in N moves White's perspective
  scoreText: string;
  winChance: number; // 0 to 100 percentage for White
}

/**
 * Parses UCI `info` output line from Stockfish.
 * Converts scores to White's perspective based on sideToMove ('w' | 'b').
 */
export function parseUciInfoLine(line: string, fen: string): EngineLine | null {
  if (!line.startsWith("info ") || !line.includes(" score ")) {
    return null;
  }

  const tokens = line.trim().split(/\s+/);

  let depth = 0;
  let seldepth = 0;
  let multipv = 1;
  let scoreCp: number | undefined;
  let mate: number | undefined;
  let nodes = 0;
  let nps = 0;
  let pvUci: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "depth" && i + 1 < tokens.length) {
      depth = parseInt(tokens[i + 1], 10);
      i++;
    } else if (token === "seldepth" && i + 1 < tokens.length) {
      seldepth = parseInt(tokens[i + 1], 10);
      i++;
    } else if (token === "multipv" && i + 1 < tokens.length) {
      multipv = parseInt(tokens[i + 1], 10);
      i++;
    } else if (token === "score" && i + 2 < tokens.length) {
      const type = tokens[i + 1];
      const val = parseInt(tokens[i + 2], 10);
      if (type === "cp") {
        scoreCp = val;
      } else if (type === "mate") {
        mate = val;
      }
      i += 2;
    } else if (token === "nodes" && i + 1 < tokens.length) {
      nodes = parseInt(tokens[i + 1], 10);
      i++;
    } else if (token === "nps" && i + 1 < tokens.length) {
      nps = parseInt(tokens[i + 1], 10);
      i++;
    } else if (token === "pv") {
      pvUci = tokens.slice(i + 1);
      break;
    }
  }

  if (pvUci.length === 0 && scoreCp === undefined && mate === undefined) {
    return null;
  }

  // Determine side to move from FEN
  const fenParts = fen.trim().split(" ");
  const turn = fenParts[1] === "b" ? "b" : "w";

  // Stockfish scores are from side-to-move perspective.
  // Normalize to White's perspective:
  const rawCp = scoreCp;
  const rawMate = mate;

  const whiteCp = scoreCp !== undefined ? (turn === "w" ? scoreCp : -scoreCp) : undefined;
  const whiteMate = mate !== undefined ? (turn === "w" ? mate : -mate) : undefined;

  let scoreText = "0.00";
  if (whiteMate !== undefined) {
    scoreText = whiteMate > 0 ? `M${whiteMate}` : `-M${Math.abs(whiteMate)}`;
  } else if (whiteCp !== undefined) {
    const pawns = whiteCp / 100;
    const sign = pawns > 0 ? "+" : "";
    scoreText = `${sign}${pawns.toFixed(2)}`;
  }

  // Convert PV UCI moves to SAN using chess.js
  const pvSan: string[] = [];
  let bestMoveSan = pvUci[0] || "";
  try {
    const tempChess = new Chess(fen);
    for (let j = 0; j < pvUci.length; j++) {
      const uci = pvUci[j];
      const from = uci.substring(0, 2);
      const to = uci.substring(2, 4);
      const promotion = uci.length > 4 ? uci.substring(4, 5) : undefined;
      const res = tempChess.move({ from, to, promotion });
      if (res) {
        pvSan.push(res.san);
        if (j === 0) {
          bestMoveSan = res.san;
        }
      } else {
        pvSan.push(uci);
      }
    }
  } catch {
    // If FEN is weird, use UCI moves
    for (const u of pvUci) {
      pvSan.push(u);
    }
  }

  return {
    id: multipv,
    depth,
    seldepth,
    scoreCp: whiteCp,
    mate: whiteMate,
    rawCp,
    rawMate,
    scoreText,
    pvUci,
    pvSan,
    bestMoveUci: pvUci[0] || "",
    bestMoveSan,
    nodes,
    nps,
  };
}

/**
 * Calculates win chance percentage (0% to 100% for White) from centipawn / mate eval.
 */
export function calculateWinChance(scoreCp?: number, mate?: number): number {
  if (mate !== undefined) {
    return mate > 0 ? 100 : 0;
  }
  if (scoreCp === undefined) {
    return 50;
  }
  // Standard sigmoid eval curve: 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
  const win = 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * scoreCp)) - 1);
  return Math.max(0, Math.min(100, win));
}

/**
 * Categorizes a move based on centipawn loss from the moving player's perspective:
 * - Best: <= 10 cp loss
 * - Good: <= 30 cp loss
 * - Inaccuracy: 31 - 90 cp loss
 * - Mistake: 91 - 250 cp loss
 * - Blunder: > 250 cp loss
 */
export type MoveQuality = "best" | "good" | "inaccuracy" | "mistake" | "blunder";

export function getMoveQuality(
  evalBefore: number | undefined, // from mover's perspective
  evalAfter: number | undefined,  // from mover's perspective
  mateBefore?: number,
  mateAfter?: number
): MoveQuality {
  // If mate status changed against the player:
  if (mateBefore !== undefined && mateBefore > 0 && (mateAfter === undefined || mateAfter <= 0)) {
    return "blunder"; // Threw away a forced win
  }
  if (mateBefore === undefined && mateAfter !== undefined && mateAfter < 0) {
    return "blunder"; // Allowed a forced mate
  }

  if (evalBefore === undefined || evalAfter === undefined) {
    return "best";
  }

  const cpLoss = Math.max(0, evalBefore - evalAfter);
  if (cpLoss <= 10) return "best";
  if (cpLoss <= 35) return "good";
  if (cpLoss <= 90) return "inaccuracy";
  if (cpLoss <= 250) return "mistake";
  return "blunder";
}

export const QUALITY_CONFIG: Record<
  MoveQuality,
  { label: string; color: string; bg: string; border: string }
> = {
  best: {
    label: "Best",
    color: "#4e8765",
    bg: "rgba(46, 90, 68, 0.2)",
    border: "rgba(78, 135, 101, 0.4)",
  },
  good: {
    label: "Good",
    color: "#68a063",
    bg: "rgba(104, 160, 99, 0.15)",
    border: "rgba(104, 160, 99, 0.3)",
  },
  inaccuracy: {
    label: "Inaccuracy",
    color: "#e0b86a",
    bg: "rgba(224, 184, 106, 0.15)",
    border: "rgba(224, 184, 106, 0.3)",
  },
  mistake: {
    label: "Mistake",
    color: "#e67e22",
    bg: "rgba(230, 126, 34, 0.15)",
    border: "rgba(230, 126, 34, 0.3)",
  },
  blunder: {
    label: "Blunder",
    color: "#e74c3c",
    bg: "rgba(231, 76, 60, 0.2)",
    border: "rgba(231, 76, 60, 0.4)",
  },
};
