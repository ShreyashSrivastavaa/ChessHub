import { describe, it, expect } from "vitest";
import { Chess, validateFen } from "chess.js";
import {
  parseUciInfoLine,
  calculateWinChance,
  getMoveQuality,
  QUALITY_CONFIG,
} from "../src/lib/chess/uci";

describe("Chess Studio & Engine Parser Test Suite", () => {
  it("1. chess.js handles legal moves, checks, and fen correctly", () => {
    const chess = new Chess();
    expect(chess.turn()).toBe("w");

    // 1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# (Scholar's Mate)
    chess.move({ from: "e2", to: "e4" });
    chess.move({ from: "e7", to: "e5" });
    chess.move({ from: "d1", to: "h5" });
    chess.move({ from: "b8", to: "c6" });
    chess.move({ from: "f1", to: "c4" });
    chess.move({ from: "g8", to: "f6" });
    const mateMove = chess.move({ from: "h5", to: "f7" });

    expect(mateMove.san).toBe("Qxf7#");
    expect(chess.isCheckmate()).toBe(true);
    expect(chess.isGameOver()).toBe(true);
  });

  it("2. UCI parser parses centipawn info and normalizes to White's perspective", () => {
    // White to move: score cp 125 -> White +1.25
    const whiteFen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    const whiteLine = parseUciInfoLine(
      "info depth 14 seldepth 20 multipv 1 score cp 80 nodes 12345 nps 50000 pv e7e5 g1f3",
      whiteFen
    );

    expect(whiteLine).not.toBeNull();
    expect(whiteLine?.depth).toBe(14);
    // Since it's Black to move, score cp 80 means Black is +0.80, so White is -0.80
    expect(whiteLine?.scoreCp).toBe(-80);
    expect(whiteLine?.scoreText).toBe("-0.80");
    expect(whiteLine?.pvSan[0]).toBe("e5");
  });

  it("3. UCI parser parses mate scores correctly", () => {
    const fenWhiteTurn = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const mateIn3 = parseUciInfoLine(
      "info depth 18 multipv 1 score mate 3 pv e2e4 e7e5 d1h5",
      fenWhiteTurn
    );

    expect(mateIn3).not.toBeNull();
    expect(mateIn3?.mate).toBe(3);
    expect(mateIn3?.scoreText).toBe("M3");
  });

  it("4. Win chance calculates smooth sigmoidal probability", () => {
    // 0 cp = 50%
    expect(calculateWinChance(0)).toBeCloseTo(50, 0);

    // +400 cp = heavily in White's favor (>80%)
    expect(calculateWinChance(400)).toBeGreaterThan(80);

    // -400 cp = heavily in Black's favor (<20%)
    expect(calculateWinChance(-400)).toBeLessThan(20);

    // Forced mate for White = 100%
    expect(calculateWinChance(undefined, 2)).toBe(100);

    // Forced mate for Black = 0%
    expect(calculateWinChance(undefined, -2)).toBe(0);
  });

  it("5. Move quality thresholds categorize moves accurately", () => {
    // <= 10 cp loss = best
    expect(getMoveQuality(100, 95)).toBe("best");

    // 25 cp loss = good
    expect(getMoveQuality(100, 75)).toBe("good");

    // 60 cp loss = inaccuracy
    expect(getMoveQuality(100, 40)).toBe("inaccuracy");

    // 150 cp loss = mistake
    expect(getMoveQuality(100, -50)).toBe("mistake");

    // 300 cp loss = blunder
    expect(getMoveQuality(100, -200)).toBe("blunder");

    // Throwing away mate = blunder
    expect(getMoveQuality(0, 0, 3, undefined)).toBe("blunder");
  });

  it("6. FEN validator validates legal and illegal positions", () => {
    // Standard starting position
    expect(
      validateFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1").ok
    ).toBe(true);

    // Missing kings or invalid rank
    expect(validateFen("8/8/8/8/8/8/8/8 w - - 0 1").ok).toBe(false);
  });
});
