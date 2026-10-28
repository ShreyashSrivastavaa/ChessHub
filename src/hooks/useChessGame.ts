"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Chess, Square, PieceSymbol, validateFen } from "chess.js";
import { chessAudio } from "@/lib/chess/sound";
import { MoveQuality, getMoveQuality } from "@/lib/chess/uci";

export interface GameMoveRecord {
  san: string;
  from: string;
  to: string;
  piece: string;
  color: "w" | "b";
  captured?: string;
  promotion?: string;
  fenBefore: string;
  fenAfter: string;
  moveNumber: number;
  quality?: MoveQuality;
  evalBefore?: number;
  evalAfter?: number;
}

export interface UseChessGameOptions {
  initialFen?: string;
  soundEnabled?: boolean;
}

export function useChessGame(options: UseChessGameOptions = {}) {
  const { initialFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" } = options;

  // Root starting position for current game
  const [startFen, setStartFen] = useState<string>(initialFen);

  // Maintain active chess.js instance
  const chessRef = useRef<Chess>(new Chess(initialFen));

  // Current board orientation
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  // Move history
  const [history, setHistory] = useState<GameMoveRecord[]>([]);

  // Navigation pointer (-1 = startFen, 0 = after move 1, etc.)
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number>(-1);

  // Active FEN on the board
  const [fen, setFen] = useState<string>(initialFen);

  // Selected square for click-to-move
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);

  // Legal target squares for selected piece
  const [possibleMoves, setPossibleMoves] = useState<string[]>([]);

  // Last move from/to squares for highlight
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Pending promotion state: { from, to }
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: string;
    to: string;
  } | null>(null);

  // Sound mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => chessAudio.isMuted());

  const toggleSound = useCallback(() => {
    const next = chessAudio.toggleMute();
    setIsMuted(next);
    return next;
  }, []);

  // Sync internal chess instance to currentMoveIndex
  const syncToMoveIndex = useCallback(
    (index: number, moveHistory: GameMoveRecord[] = history, rootFen: string = startFen) => {
      const newChess = new Chess(rootFen);

      for (let i = 0; i <= index && i < moveHistory.length; i++) {
        const m = moveHistory[i];
        newChess.move({
          from: m.from,
          to: m.to,
          promotion: m.promotion,
        });
      }

      chessRef.current = newChess;
      const currentFen = newChess.fen();
      setFen(currentFen);
      setCurrentMoveIndex(index);
      setSelectedSquare(null);
      setPossibleMoves([]);

      if (index >= 0 && moveHistory[index]) {
        setLastMove({ from: moveHistory[index].from, to: moveHistory[index].to });
      } else {
        setLastMove(null);
      }
    },
    [history, startFen]
  );

  // Identify square of king in check
  const checkSquare = useMemo(() => {
    const chess = chessRef.current;
    if (!chess.isCheck()) return null;
    const turn = chess.turn();

    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["1", "2", "3", "4", "5", "6", "7", "8"];

    for (const file of files) {
      for (const rank of ranks) {
        const sq = `${file}${rank}` as Square;
        const p = chess.get(sq);
        if (p && p.type === "k" && p.color === turn) {
          return sq;
        }
      }
    }
    return null;
  }, [fen]);

  // Derived game status
  const gameStatus = useMemo(() => {
    const chess = chessRef.current;
    const turn = chess.turn();
    const isCheck = chess.isCheck();
    const isCheckmate = chess.isCheckmate();
    const isStalemate = chess.isStalemate();
    const isThreefold = chess.isThreefoldRepetition();
    const isInsufficient = chess.isInsufficientMaterial();
    const isFifty = chess.isDrawByFiftyMoves();
    const isDraw = chess.isDraw();
    const isGameOver = chess.isGameOver();

    let statusText = turn === "w" ? "White to move" : "Black to move";
    if (isCheckmate) {
      statusText = `Checkmate! ${turn === "w" ? "Black" : "White"} wins`;
    } else if (isStalemate) {
      statusText = "Draw by stalemate";
    } else if (isThreefold) {
      statusText = "Draw by threefold repetition";
    } else if (isInsufficient) {
      statusText = "Draw by insufficient material";
    } else if (isFifty) {
      statusText = "Draw by 50-move rule";
    } else if (isCheck) {
      statusText = `${turn === "w" ? "White" : "Black"} is in check!`;
    }

    return {
      turn,
      isCheck,
      isCheckmate,
      isStalemate,
      isDraw,
      isGameOver,
      statusText,
    };
  }, [fen]);

  // Check if a move requires promotion choice
  const isPromotionMove = useCallback((from: string, to: string): boolean => {
    const chess = chessRef.current;
    const piece = chess.get(from as Square);
    if (!piece || piece.type !== "p") return false;

    const toRank = to.charAt(1);
    return (piece.color === "w" && toRank === "8") || (piece.color === "b" && toRank === "1");
  }, []);

  // Execute a verified legal move
  const executeMove = useCallback(
    (
      moveData: { from: string; to: string; promotion?: string },
      options?: { evalBefore?: number; evalAfter?: number }
    ) => {
      const chess = chessRef.current;
      const fenBefore = chess.fen();
      const moveNumber = Math.floor(history.slice(0, currentMoveIndex + 1).length / 2) + 1;

      try {
        const result = chess.move({
          from: moveData.from,
          to: moveData.to,
          promotion: moveData.promotion || "q",
        });

        if (!result) return false;

        const fenAfter = chess.fen();

        // Audio feedback
        if (chess.isCheckmate() || chess.isStalemate() || chess.isDraw()) {
          chessAudio.playGameOver();
        } else if (chess.isCheck()) {
          chessAudio.playCheck();
        } else if (result.captured) {
          chessAudio.playCapture();
        } else {
          chessAudio.playMove();
        }

        // Calculate move quality if evals are provided
        let quality: MoveQuality | undefined = undefined;
        if (options?.evalBefore !== undefined && options?.evalAfter !== undefined) {
          quality = getMoveQuality(options.evalBefore, options.evalAfter);
        }

        const newRecord: GameMoveRecord = {
          san: result.san,
          from: result.from,
          to: result.to,
          piece: result.piece,
          color: result.color,
          captured: result.captured,
          promotion: result.promotion,
          fenBefore,
          fenAfter,
          moveNumber,
          quality,
          evalBefore: options?.evalBefore,
          evalAfter: options?.evalAfter,
        };

        // If navigated back in history, truncate future moves (overwrite line)
        const updatedHistory = [...history.slice(0, currentMoveIndex + 1), newRecord];
        const nextIndex = updatedHistory.length - 1;

        setHistory(updatedHistory);
        setCurrentMoveIndex(nextIndex);
        setFen(fenAfter);
        setLastMove({ from: result.from, to: result.to });
        setSelectedSquare(null);
        setPossibleMoves([]);
        setPendingPromotion(null);

        return true;
      } catch (err) {
        console.warn("Move failed:", err);
        return false;
      }
    },
    [history, currentMoveIndex]
  );

  // High-level request to move (triggers promotion dialog if needed)
  const makeMove = useCallback(
    (
      moveData: { from: string; to: string; promotion?: string },
      options?: { evalBefore?: number; evalAfter?: number }
    ) => {
      const { from, to, promotion } = moveData;

      // Check if move is legal
      const chess = chessRef.current;
      const legalMoves = chess.moves({ square: from as Square, verbose: true });
      const isValid = legalMoves.some((m) => m.to === to);

      if (!isValid) {
        setSelectedSquare(null);
        setPossibleMoves([]);
        return false;
      }

      // If it's a pawn promotion and no promotion piece specified yet, prompt
      if (!promotion && isPromotionMove(from, to)) {
        setPendingPromotion({ from, to });
        return true;
      }

      return executeMove(moveData, options);
    },
    [isPromotionMove, executeMove]
  );

  // Complete pending promotion with chosen piece (q/r/b/n)
  const confirmPromotion = useCallback(
    (piece: PieceSymbol) => {
      if (!pendingPromotion) return;
      executeMove({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: piece,
      });
      setPendingPromotion(null);
    },
    [pendingPromotion, executeMove]
  );

  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    setSelectedSquare(null);
    setPossibleMoves([]);
  }, []);

  // Handle square selection for click-to-move
  const onSquareClick = useCallback(
    (square: Square) => {
      const chess = chessRef.current;

      // If already selected a square and clicked a legal move square, make the move
      if (selectedSquare && possibleMoves.includes(square)) {
        makeMove({ from: selectedSquare, to: square });
        return;
      }

      // Check if clicked square has a piece
      const piece = chess.get(square);
      if (piece) {
        // In analysis/play-both-sides mode, can click either side if it's their turn
        if (piece.color === chess.turn()) {
          setSelectedSquare(square);
          const legalMoves = chess.moves({ square, verbose: true });
          setPossibleMoves(legalMoves.map((m) => m.to));
          return;
        }
      }

      // Otherwise deselect
      setSelectedSquare(null);
      setPossibleMoves([]);
    },
    [selectedSquare, possibleMoves, makeMove]
  );

  // Navigation functions
  const goToMove = useCallback(
    (index: number) => {
      syncToMoveIndex(index);
    },
    [syncToMoveIndex]
  );

  const goToPrevious = useCallback(() => {
    if (currentMoveIndex >= 0) {
      goToMove(currentMoveIndex - 1);
    }
  }, [currentMoveIndex, goToMove]);

  const goToNext = useCallback(() => {
    if (currentMoveIndex < history.length - 1) {
      goToMove(currentMoveIndex + 1);
    }
  }, [currentMoveIndex, history.length, goToMove]);

  const goToStart = useCallback(() => {
    goToMove(-1);
  }, [goToMove]);

  const goToEnd = useCallback(() => {
    goToMove(history.length - 1);
  }, [history.length, goToMove]);

  const undo = goToPrevious;
  const redo = goToNext;

  // Reset to standard initial position
  const reset = useCallback(() => {
    const standardFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    setStartFen(standardFen);
    chessRef.current = new Chess(standardFen);
    setHistory([]);
    setCurrentMoveIndex(-1);
    setFen(standardFen);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setPendingPromotion(null);
  }, []);

  // Clear board (all squares empty)
  const clearBoard = useCallback(() => {
    const emptyFen = "8/8/8/8/8/8/8/8 w - - 0 1";
    setStartFen(emptyFen);
    try {
      const emptyChess = new Chess();
      emptyChess.clear();
      chessRef.current = emptyChess;
    } catch {
      // ignore
    }
    setHistory([]);
    setCurrentMoveIndex(-1);
    setFen(emptyFen);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setLastMove(null);
    setPendingPromotion(null);
  }, []);

  // Update board FEN directly for free-form editor mode
  const setFenDirectly = useCallback((newFen: string) => {
    setFen(newFen);
  }, []);

  // Load a custom FEN
  const loadFen = useCallback((newFen: string): { ok: boolean; error?: string } => {
    const val = validateFen(newFen.trim());
    if (!val.ok) {
      return { ok: false, error: val.error || "Invalid FEN format." };
    }

    try {
      const newChess = new Chess(newFen.trim());
      chessRef.current = newChess;
      setStartFen(newFen.trim());
      setHistory([]);
      setCurrentMoveIndex(-1);
      setFen(newChess.fen());
      setSelectedSquare(null);
      setPossibleMoves([]);
      setLastMove(null);
      setPendingPromotion(null);
      return { ok: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error loading FEN";
      return { ok: false, error: msg };
    }
  }, []);

  // Load PGN
  const loadPgn = useCallback((pgnString: string): { ok: boolean; error?: string } => {
    try {
      const newChess = new Chess();
      newChess.loadPgn(pgnString.trim());

      // Reconstruct history
      const verboseMoves = newChess.history({ verbose: true });
      const tempChess = new Chess();
      const newHistory: GameMoveRecord[] = [];

      for (let i = 0; i < verboseMoves.length; i++) {
        const vm = verboseMoves[i];
        const fenBefore = tempChess.fen();
        const moveNumber = Math.floor(i / 2) + 1;
        const played = tempChess.move({ from: vm.from, to: vm.to, promotion: vm.promotion });
        const fenAfter = tempChess.fen();

        if (played) {
          newHistory.push({
            san: played.san,
            from: played.from,
            to: played.to,
            piece: played.piece,
            color: played.color,
            captured: played.captured,
            promotion: played.promotion,
            fenBefore,
            fenAfter,
            moveNumber,
          });
        }
      }

      setStartFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      setHistory(newHistory);
      setCurrentMoveIndex(newHistory.length - 1);
      chessRef.current = newChess;
      setFen(newChess.fen());
      if (newHistory.length > 0) {
        const last = newHistory[newHistory.length - 1];
        setLastMove({ from: last.from, to: last.to });
      } else {
        setLastMove(null);
      }
      setSelectedSquare(null);
      setPossibleMoves([]);
      setPendingPromotion(null);
      return { ok: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error loading PGN";
      return { ok: false, error: msg };
    }
  }, []);

  // Export current game as PGN
  const getPgn = useCallback(() => {
    const exportChess = new Chess(startFen);
    for (let i = 0; i <= currentMoveIndex && i < history.length; i++) {
      const m = history[i];
      exportChess.move({ from: m.from, to: m.to, promotion: m.promotion });
    }
    return exportChess.pgn();
  }, [startFen, currentMoveIndex, history]);

  // Flip orientation
  const flipBoard = useCallback(() => {
    setOrientation((prev) => (prev === "white" ? "black" : "white"));
  }, []);

  // Update a move record's eval and quality after engine calculation
  const setMoveQualityAt = useCallback(
    (index: number, evalBefore: number, evalAfter: number) => {
      setHistory((prev) => {
        if (!prev[index]) return prev;
        const updated = [...prev];
        const quality = getMoveQuality(evalBefore, evalAfter);
        updated[index] = {
          ...updated[index],
          evalBefore,
          evalAfter,
          quality,
        };
        return updated;
      });
    },
    []
  );

  return {
    fen,
    chess: chessRef.current,
    history,
    currentMoveIndex,
    orientation,
    selectedSquare,
    possibleMoves,
    lastMove,
    checkSquare,
    gameStatus,
    pendingPromotion,
    isMuted,
    toggleSound,
    flipBoard,
    setOrientation,
    makeMove,
    onSquareClick,
    confirmPromotion,
    cancelPromotion,
    goToMove,
    goToPrevious,
    goToNext,
    goToStart,
    goToEnd,
    undo,
    redo,
    reset,
    clearBoard,
    loadFen,
    setFenDirectly,
    loadPgn,
    getPgn,
    setMoveQualityAt,
  };
}
