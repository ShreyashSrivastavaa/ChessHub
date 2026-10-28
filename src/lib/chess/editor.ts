import { Chess, validateFen, PieceSymbol, Square } from "chess.js";

export interface EditorSquarePiece {
  type: PieceSymbol;
  color: "w" | "b";
}

export type EditorSquareMap = Record<string, EditorSquarePiece>;

export interface SavedEditorPosition {
  id: string;
  name: string;
  fen: string;
  createdAt: number;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export const ALL_SQUARES: Square[] = [];
for (const f of FILES) {
  for (const r of RANKS) {
    ALL_SQUARES.push(`${f}${r}` as Square);
  }
}

/**
 * Convert a FEN piece placement string to a map of square -> piece
 */
export function fenToSquares(fen: string): EditorSquareMap {
  const [placement] = fen.trim().split(" ");
  if (!placement) return {};

  const squares: EditorSquareMap = {};
  const ranks = placement.split("/");

  for (let r = 0; r < 8; r++) {
    const rankStr = ranks[r] || "8";
    const rankNum = 8 - r;
    let fileIdx = 0;

    for (const char of rankStr) {
      if (char >= "1" && char <= "8") {
        fileIdx += parseInt(char, 10);
      } else {
        if (fileIdx < 8) {
          const file = String.fromCharCode(97 + fileIdx);
          const sq = `${file}${rankNum}` as Square;
          const color: "w" | "b" = char === char.toUpperCase() ? "w" : "b";
          squares[sq] = { type: char.toLowerCase() as PieceSymbol, color };
          fileIdx++;
        }
      }
    }
  }

  return squares;
}

/**
 * Convert a map of square -> piece back to a complete 6-part FEN string
 */
export function squaresToFen(
  squares: EditorSquareMap,
  activeColor: "w" | "b" = "w",
  castlingRights: { K: boolean; Q: boolean; k: boolean; q: boolean } | string = {
    K: true,
    Q: true,
    k: true,
    q: true,
  },
  enPassant: string = "-",
  halfmove: string = "0",
  fullmove: string = "1"
): string {
  const rankStrings: string[] = [];

  for (let r = 0; r < 8; r++) {
    const rankNum = 8 - r;
    let emptyCount = 0;
    let rankStr = "";

    for (let f = 0; f < 8; f++) {
      const file = String.fromCharCode(97 + f);
      const sq = `${file}${rankNum}`;
      const piece = squares[sq];

      if (!piece) {
        emptyCount++;
      } else {
        if (emptyCount > 0) {
          rankStr += emptyCount;
          emptyCount = 0;
        }
        rankStr += piece.color === "w" ? piece.type.toUpperCase() : piece.type.toLowerCase();
      }
    }

    if (emptyCount > 0) {
      rankStr += emptyCount;
    }
    rankStrings.push(rankStr);
  }

  let castleStr = "-";
  if (typeof castlingRights === "string") {
    castleStr = castlingRights || "-";
  } else {
    let str = "";
    if (castlingRights.K) str += "K";
    if (castlingRights.Q) str += "Q";
    if (castlingRights.k) str += "k";
    if (castlingRights.q) str += "q";
    castleStr = str || "-";
  }

  const epStr = enPassant && /^[a-h][36]$/.test(enPassant.trim()) ? enPassant.trim() : "-";

  return `${rankStrings.join("/")} ${activeColor} ${castleStr} ${epStr} ${halfmove} ${fullmove}`;
}

/**
 * Parse castling rights string (e.g. "KQkq") into an object
 */
export function parseCastlingRights(castlingStr: string = "KQkq"): {
  K: boolean;
  Q: boolean;
  k: boolean;
  q: boolean;
} {
  return {
    K: castlingStr.includes("K"),
    Q: castlingStr.includes("Q"),
    k: castlingStr.includes("k"),
    q: castlingStr.includes("q"),
  };
}

/**
 * Validate position thoroughly with clear, human-friendly error messages
 */
export function validateEditorPosition(fen: string): { valid: boolean; error?: string } {
  const tokens = fen.trim().split(/\s+/);
  if (tokens.length < 1) {
    return { valid: false, error: "Empty or invalid position string." };
  }

  const placement = tokens[0];
  const ranks = placement.split("/");
  if (ranks.length !== 8) {
    return { valid: false, error: "Board must have exactly 8 ranks separated by '/'." };
  }

  // Count kings
  const whiteKings = (placement.match(/K/g) || []).length;
  const blackKings = (placement.match(/k/g) || []).length;

  if (whiteKings === 0) {
    return { valid: false, error: "Missing White King (position must have exactly 1 White King)." };
  }
  if (whiteKings > 1) {
    return { valid: false, error: `Position has ${whiteKings} White Kings (must have exactly 1).` };
  }
  if (blackKings === 0) {
    return { valid: false, error: "Missing Black King (position must have exactly 1 Black King)." };
  }
  if (blackKings > 1) {
    return { valid: false, error: `Position has ${blackKings} Black Kings (must have exactly 1).` };
  }

  // Check pawn placements on 1st and 8th ranks
  if (ranks[0].includes("p") || ranks[0].includes("P")) {
    return { valid: false, error: "Pawns cannot be placed on the 8th rank." };
  }
  if (ranks[7].includes("p") || ranks[7].includes("P")) {
    return { valid: false, error: "Pawns cannot be placed on the 1st rank." };
  }

  // Check kings adjacency
  const squares = fenToSquares(fen);
  let wkSq: string | null = null;
  let bkSq: string | null = null;

  for (const [sq, piece] of Object.entries(squares)) {
    if (piece.type === "k" && piece.color === "w") wkSq = sq;
    if (piece.type === "k" && piece.color === "b") bkSq = sq;
  }

  if (wkSq && bkSq) {
    const wkFile = wkSq.charCodeAt(0) - 97;
    const wkRank = parseInt(wkSq[1], 10);
    const bkFile = bkSq.charCodeAt(0) - 97;
    const bkRank = parseInt(bkSq[1], 10);

    if (Math.max(Math.abs(wkFile - bkFile), Math.abs(wkRank - bkRank)) <= 1) {
      return { valid: false, error: "White and Black kings cannot be on adjacent squares." };
    }
  }

  // Ensure normalized 6-part FEN for chess.js validation
  const turn = tokens[1] === "b" ? "b" : "w";
  const castling = tokens[2] || "-";
  const ep = tokens[3] || "-";
  const half = tokens[4] || "0";
  const full = tokens[5] || "1";
  const fullFen = `${placement} ${turn} ${castling} ${ep} ${half} ${full}`;

  // Validate with chess.js validateFen
  const fenValidation = validateFen(fullFen);
  if (!fenValidation.ok) {
    return { valid: false, error: fenValidation.error || "Invalid FEN configuration." };
  }

  // Check if side NOT to move is in check (illegal in chess)
  try {
    const sideNotToMove = turn === "w" ? "b" : "w";
    const switchedFen = `${placement} ${sideNotToMove} - - 0 1`;
    const testSwitched = new Chess(switchedFen);
    if (testSwitched.isCheck()) {
      return {
        valid: false,
        error: `The side not to move (${sideNotToMove === "w" ? "White" : "Black"}) cannot be in check.`,
      };
    }
  } catch {
    return { valid: false, error: "Position violates chess legality rules." };
  }

  return { valid: true };
}

/**
 * Generate a random but legally valid chess position:
 * - Exactly one White King and one Black King, not adjacent
 * - A random number of other pieces (2 - 12 pieces)
 * - No pawns on back ranks (1st or 8th)
 * - Side-not-to-move is NOT in check
 */
export function generateRandomPosition(): string {
  const allSquares: string[] = [];
  for (const f of FILES) {
    for (const r of RANKS) {
      allSquares.push(`${f}${r}`);
    }
  }

  for (let attempt = 0; attempt < 100; attempt++) {
    const squares: EditorSquareMap = {};
    const available = [...allSquares];

    // White King
    const wkIdx = Math.floor(Math.random() * available.length);
    const wkSq = available.splice(wkIdx, 1)[0];
    squares[wkSq] = { type: "k", color: "w" };

    const wkFile = wkSq.charCodeAt(0) - 97;
    const wkRank = parseInt(wkSq[1], 10);

    // Black King candidates: distance > 1
    const bkCandidates = available.filter((sq) => {
      const f = sq.charCodeAt(0) - 97;
      const r = parseInt(sq[1], 10);
      return Math.max(Math.abs(f - wkFile), Math.abs(r - wkRank)) > 1;
    });

    if (bkCandidates.length === 0) continue;
    const bkSq = bkCandidates[Math.floor(Math.random() * bkCandidates.length)];
    available.splice(available.indexOf(bkSq), 1);
    squares[bkSq] = { type: "k", color: "b" };

    const turn: "w" | "b" = Math.random() < 0.5 ? "w" : "b";

    // Random number of other pieces (2 to 10)
    const numOtherPieces = 2 + Math.floor(Math.random() * 9);
    const pieceTypes: PieceSymbol[] = ["q", "r", "r", "b", "b", "n", "n", "p", "p", "p"];

    for (let i = 0; i < numOtherPieces && available.length > 0; i++) {
      const color: "w" | "b" = Math.random() < 0.5 ? "w" : "b";
      const type = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];

      let candidates = available;
      if (type === "p") {
        candidates = available.filter((sq) => sq[1] !== "1" && sq[1] !== "8");
      }
      if (candidates.length === 0) continue;

      const sq = candidates[Math.floor(Math.random() * candidates.length)];
      available.splice(available.indexOf(sq), 1);
      squares[sq] = { type, color };
    }

    const candidateFen = squaresToFen(squares, turn, "-", "-");
    const val = validateEditorPosition(candidateFen);
    if (val.valid) {
      return candidateFen;
    }
  }

  // High-reliability fallback (an interesting, valid endgame position)
  return "8/2k5/8/8/3K4/2P5/8/8 w - - 0 1";
}

const STORAGE_KEY = "chesshub_saved_positions";

export const DEFAULT_SAVED_POSITIONS: SavedEditorPosition[] = [
  {
    id: "lucena",
    name: "Lucena Position (Winning Rook Endgame)",
    fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
    createdAt: 1700000000000,
  },
  {
    id: "philidor",
    name: "Philidor Position (Drawing Rook Endgame)",
    fen: "4k3/R7/8/4P3/8/8/5r2/4K3 b - - 0 1",
    createdAt: 1700000001000,
  },
  {
    id: "opera",
    name: "Morphy's Opera Game (Tactical Study)",
    fen: "4kb1r/p2rqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 1",
    createdAt: 1700000002000,
  },
];

export function getSavedPositions(): SavedEditorPosition[] {
  if (typeof window === "undefined") return DEFAULT_SAVED_POSITIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SAVED_POSITIONS));
      return DEFAULT_SAVED_POSITIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SAVED_POSITIONS;
  } catch {
    return DEFAULT_SAVED_POSITIONS;
  }
}

export function savePosition(name: string, fen: string): SavedEditorPosition[] {
  if (typeof window === "undefined") return [];
  const current = getSavedPositions();
  const newItem: SavedEditorPosition = {
    id: `pos_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim() || `Position ${new Date().toLocaleDateString()}`,
    fen: fen.trim(),
    createdAt: Date.now(),
  };
  const updated = [newItem, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save position to localStorage:", err);
  }
  return updated;
}

export function deleteSavedPosition(id: string): SavedEditorPosition[] {
  if (typeof window === "undefined") return [];
  const current = getSavedPositions();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to delete position from localStorage:", err);
  }
  return updated;
}
