"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useChessGame } from "@/hooks/useChessGame";
import { useStockfish } from "@/hooks/useStockfish";
import { EvalBar } from "./EvalBar";
import { MoveList } from "./MoveList";
import { EnginePanel, PlayVsEngineConfig } from "./EnginePanel";
import { FullscreenButton } from "./FullscreenButton";
import { PiecePalette, PalettePiece } from "./PiecePalette";
import { Arrow, PieceDropHandlerArgs, SquareHandlerArgs, ChessboardOptions } from "react-chessboard";
import { Square, validateFen, PieceSymbol } from "chess.js";
import {
  HelpCircle,
  Palette,
  Volume2,
  VolumeX,
  Pencil,
  Sparkles,
} from "lucide-react";
import { BoardSkeleton } from "./BoardSkeleton";
import {
  fenToSquares,
  squaresToFen,
  parseCastlingRights,
  validateEditorPosition,
  EditorSquareMap,
} from "@/lib/chess/editor";

// Dynamically import auxiliary panels & dialogs
const SetupPanel = dynamic(
  () => import("./SetupPanel").then((mod) => mod.SetupPanel),
  {
    loading: () => (
      <div className="h-full rounded-xl bg-[#141416] border border-[#2e2e36] animate-pulse" />
    ),
  }
);

const NotesPanel = dynamic(
  () => import("./NotesPanel").then((mod) => mod.NotesPanel),
  {
    loading: () => (
      <div className="h-full rounded-xl bg-[#141416] border border-[#2e2e36] animate-pulse" />
    ),
  }
);

const PromotionDialog = dynamic(
  () => import("./PromotionDialog").then((mod) => mod.PromotionDialog),
  { ssr: false }
);

const ShortcutsModal = dynamic(
  () => import("./ShortcutsModal").then((mod) => mod.ShortcutsModal),
  { ssr: false }
);

// Dynamic Chessboard & Provider to prevent SSR hydration mismatch
const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => <BoardSkeleton />,
  }
);

const ChessboardProvider = dynamic(
  () => import("react-chessboard").then((mod) => mod.ChessboardProvider),
  { ssr: false }
);

interface BoardStudioProps {
  initialFen?: string;
}

const BOARD_THEMES = [
  {
    id: "charcoal",
    name: "Obsidian Velvet",
    dark: "#141418",
    light: "#222228",
  },
  {
    id: "green",
    name: "Classic Forest",
    dark: "#2e5a44",
    light: "#dcd8d0",
  },
  {
    id: "wood",
    name: "Warm Walnut",
    dark: "#8a5832",
    light: "#e2cfa7",
  },
  {
    id: "slate",
    name: "Grandmaster Blue",
    dark: "#34495e",
    light: "#bdc3c7",
  },
];

type StudioTab = "moves" | "engine" | "setup" | "notes";

export function BoardStudio({ initialFen }: BoardStudioProps) {
  // Query param FEN fallback (supports direct loading of studies & puzzles)
  const startPosition = useMemo(() => {
    if (initialFen) return initialFen;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryFen = params.get("fen");
      if (queryFen && (validateFen(queryFen).ok || validateEditorPosition(queryFen).valid)) {
        return queryFen;
      }
    }
    return "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
  }, [initialFen]);

  // Chess game engine & state
  const {
    fen,
    chess,
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
    reset,
    clearBoard,
    loadFen,
    setFenDirectly,
    loadPgn,
    getPgn,
    setMoveQualityAt,
  } = useChessGame({ initialFen: startPosition });

  // Engine state & settings
  const [engineActive, setEngineActive] = useState(false);
  const [engineDepth, setEngineDepth] = useState(16);
  const [multiPv, setMultiPv] = useState(1);
  const [showBestMoveArrow, setShowBestMoveArrow] = useState(true);
  const [showQualityHints, setShowQualityHints] = useState(true);

  // Play vs Engine config
  const [playVsEngine, setPlayVsEngine] = useState<PlayVsEngineConfig>({
    active: false,
    playerColor: "w",
    skillLevel: 10,
  });

  const {
    isReady: isEngineReady,
    isThinking: isEngineThinking,
    unsupported: isEngineUnsupported,
    unsupportedMessage: engineUnsupportedMessage,
    lines: engineLines,
    currentEval,
    bestMove,
    evaluatePosition,
    getEngineMove,
    stop: stopEngine,
  } = useStockfish({
    depth: engineDepth,
    multiPv,
    skillLevel: playVsEngine.skillLevel,
    enabled: engineActive || playVsEngine.active,
  });

  // Active UI tab
  const [activeTab, setActiveTab] = useState<StudioTab>("moves");

  // Board appearance preferences
  const [themeId, setThemeId] = useState<string>("charcoal");
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);

  // Lesson notes & annotations
  const [notes, setNotes] = useState<string>("");
  const [userArrows, setUserArrows] = useState<Arrow[]>([]);
  const [highlightedSquares, setHighlightedSquares] = useState<Record<string, string>>({});

  // Setup mode states
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [selectedPalettePiece, setSelectedPalettePiece] = useState<PalettePiece>({
    type: "p",
    color: "w",
  });
  const [setupTurn, setSetupTurn] = useState<"w" | "b">("w");
  const [setupCastling, setSetupCastling] = useState({ K: true, Q: true, k: true, q: true });
  const [setupEnPassant, setSetupEnPassant] = useState<string>("-");
  const [setupError, setSetupError] = useState<string | null>(null);

  // Help modal
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Fullscreen container and states
  const containerRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const isFullscreen = isNativeFullscreen || isPseudoFullscreen;

  // Responsive board width calculation
  const [boardDim, setBoardDim] = useState<number | null>(null);
  const lastClickedSquareRef = useRef<{ square: string; time: number } | null>(null);

  // Client mounted state for SSR safety
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fullscreen change event listener (keeps Esc and button state in sync)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsNativeFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Fullscreen toggle function
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
          await (container as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
        } else {
          setIsPseudoFullscreen(true);
        }
      } catch (err) {
        console.warn("Native requestFullscreen failed; falling back to pseudo-fullscreen:", err);
        setIsPseudoFullscreen(true);
      }
    } else {
      if (document.fullscreenElement) {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
            await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
          }
        } catch (err) {
          console.warn("exitFullscreen failed:", err);
        }
      }
      setIsPseudoFullscreen(false);
    }
  }, [isFullscreen]);

  // Responsive ResizeObserver for board container
  useEffect(() => {
    const el = boardContainerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const rect = el.getBoundingClientRect();
      const availableWidth = rect.width;
      if (availableWidth > 0) {
        // Leave room for attached eval bar (~36px) and padding
        const maxW = availableWidth - 44;
        const maxH = isFullscreen ? window.innerHeight - 140 : 600;
        const squareSize = Math.max(260, Math.min(maxW, maxH));
        setBoardDim(Math.floor(squareSize));
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(el);
    window.addEventListener("resize", updateDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, [isFullscreen]);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedTheme = localStorage.getItem("chesshub_board_theme");
    if (savedTheme && BOARD_THEMES.some((t) => t.id === savedTheme)) {
      setThemeId(savedTheme);
    }
    const savedCoords = localStorage.getItem("chesshub_show_coordinates");
    if (savedCoords !== null) {
      setShowCoordinates(savedCoords === "true");
    }
  }, []);

  const handleSelectTheme = (id: string) => {
    setThemeId(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("chesshub_board_theme", id);
    }
  };

  const handleToggleCoordinates = (show: boolean) => {
    setShowCoordinates(show);
    if (typeof window !== "undefined") {
      localStorage.setItem("chesshub_show_coordinates", show ? "true" : "false");
    }
  };

  const currentTheme = useMemo(
    () => BOARD_THEMES.find((t) => t.id === themeId) || BOARD_THEMES[0],
    [themeId]
  );

  // Trigger Stockfish evaluation when position FEN changes in normal analysis mode
  useEffect(() => {
    if (!isSetupMode && engineActive && !playVsEngine.active) {
      if (gameStatus.isGameOver) {
        stopEngine();
      } else {
        evaluatePosition(fen, engineDepth);
      }
    } else {
      stopEngine();
    }
  }, [
    fen,
    engineActive,
    engineDepth,
    isSetupMode,
    playVsEngine.active,
    gameStatus.isGameOver,
    evaluatePosition,
    stopEngine,
  ]);

  // Handle Play vs Engine automatic reply
  useEffect(() => {
    if (!playVsEngine.active || isSetupMode || gameStatus.isGameOver) return;

    if (chess.turn() !== playVsEngine.playerColor) {
      const timer = setTimeout(() => {
        getEngineMove(
          fen,
          (bestMoveUci) => {
            const from = bestMoveUci.substring(0, 2);
            const to = bestMoveUci.substring(2, 4);
            const promotion = bestMoveUci.length > 4 ? bestMoveUci.substring(4, 5) : undefined;
            makeMove({ from, to, promotion });
          },
          700
        );
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [fen, playVsEngine, isSetupMode, gameStatus.isGameOver, chess, getEngineMove, makeMove]);

  // Record move quality when evaluation arrives
  useEffect(() => {
    if (currentMoveIndex >= 0 && history[currentMoveIndex] && currentEval?.scoreCp !== undefined) {
      const move = history[currentMoveIndex];
      if (move.evalAfter === undefined) {
        setMoveQualityAt(currentMoveIndex, move.evalBefore ?? 0, currentEval.scoreCp);
      }
    }
  }, [currentEval, currentMoveIndex, history, setMoveQualityAt]);

  // Helper to sync editor changes to FEN
  const updateEditorFen = useCallback(
    (
      squares: EditorSquareMap,
      turn = setupTurn,
      castling = setupCastling,
      ep = setupEnPassant
    ) => {
      const newFen = squaresToFen(squares, turn, castling, ep);
      setFenDirectly(newFen);
      const val = validateEditorPosition(newFen);
      setSetupError(val.valid ? null : val.error || null);
      return newFen;
    },
    [setupTurn, setupCastling, setupEnPassant, setFenDirectly]
  );

  // Done / Start Analysis button handler
  const handleStartAnalysis = useCallback(() => {
    const val = validateEditorPosition(fen);
    if (!val.valid) {
      setSetupError(val.error || "Please set a valid position before starting analysis.");
      return;
    }

    const res = loadFen(fen);
    if (res.ok) {
      setIsSetupMode(false);
      setSetupError(null);
      setActiveTab("moves");
    } else {
      setSetupError(res.error || "Could not initialize game with this position.");
    }
  }, [fen, loadFen]);

  // Toggle Setup Mode
  const handleToggleSetupMode = useCallback(
    (active: boolean) => {
      if (active) {
        setIsSetupMode(true);
        setActiveTab("setup");
        stopEngine();
        const tokens = fen.trim().split(/\s+/);
        if (tokens.length >= 2) setSetupTurn(tokens[1] === "b" ? "b" : "w");
        if (tokens.length >= 3) setSetupCastling(parseCastlingRights(tokens[2]));
        if (tokens.length >= 4) setSetupEnPassant(tokens[3]);
        const val = validateEditorPosition(fen);
        setSetupError(val.valid ? null : val.error || null);
      } else {
        handleStartAnalysis();
      }
    },
    [fen, stopEngine, handleStartAnalysis]
  );

  // Free-form and legal piece drop handler
  const handlePieceDrop = useCallback(
    ({ piece, sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
      if (isSetupMode) {
        const currentSquares = fenToSquares(fen);

        // 1. Dragged off the board: delete piece
        if (!targetSquare) {
          if (currentSquares[sourceSquare]) {
            delete currentSquares[sourceSquare];
            updateEditorFen(currentSquares);
          }
          return true;
        }

        // 2. Dropping spare piece from palette
        if (piece.isSparePiece || sourceSquare.startsWith("w") || sourceSquare.startsWith("b")) {
          const color = sourceSquare[0] as "w" | "b";
          const type = sourceSquare[1].toLowerCase() as PieceSymbol;
          currentSquares[targetSquare] = { type, color };
          updateEditorFen(currentSquares);
          return true;
        }

        // 3. Move pieces freely on the board (replacing target, no legality checks)
        if (sourceSquare !== targetSquare && currentSquares[sourceSquare]) {
          currentSquares[targetSquare] = currentSquares[sourceSquare];
          delete currentSquares[sourceSquare];
          updateEditorFen(currentSquares);
          return true;
        }

        return true;
      }

      // Normal play mode
      if (!targetSquare) return false;
      if (playVsEngine.active && chess.turn() !== playVsEngine.playerColor) {
        return false;
      }

      const success = makeMove(
        { from: sourceSquare, to: targetSquare },
        { evalBefore: currentEval?.scoreCp }
      );
      return !!success;
    },
    [isSetupMode, fen, updateEditorFen, playVsEngine, chess, makeMove, currentEval]
  );

  // Square click handler (handles click-to-place, eraser, and double-click delete in editor mode)
  const handleSquareClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (isSetupMode) {
        const currentSquares = fenToSquares(fen);
        const now = Date.now();
        const isDoubleClick =
          lastClickedSquareRef.current?.square === square &&
          now - lastClickedSquareRef.current.time < 350;
        lastClickedSquareRef.current = { square, time: now };

        if (isDoubleClick) {
          // Double-click removes piece
          if (currentSquares[square]) {
            delete currentSquares[square];
            updateEditorFen(currentSquares);
          }
          return;
        }

        if (selectedPalettePiece === null) {
          // Eraser tool
          if (currentSquares[square]) {
            delete currentSquares[square];
            updateEditorFen(currentSquares);
          }
        } else {
          // Place selected piece repeatedly
          currentSquares[square] = {
            type: selectedPalettePiece.type,
            color: selectedPalettePiece.color,
          };
          updateEditorFen(currentSquares);
        }
        return;
      }

      if (playVsEngine.active && chess.turn() !== playVsEngine.playerColor) {
        return;
      }

      onSquareClick(square as Square);
    },
    [isSetupMode, fen, updateEditorFen, selectedPalettePiece, playVsEngine, chess, onSquareClick]
  );

  // Right-click handler (deletes piece in editor mode; toggles highlight in play mode)
  const handleSquareRightClick = useCallback(
    ({ square }: SquareHandlerArgs) => {
      if (isSetupMode) {
        const currentSquares = fenToSquares(fen);
        if (currentSquares[square]) {
          delete currentSquares[square];
          updateEditorFen(currentSquares);
          return;
        }
      }

      setHighlightedSquares((prev) => {
        const updated = { ...prev };
        if (updated[square]) {
          delete updated[square];
        } else {
          updated[square] = "rgba(207, 168, 89, 0.4)";
        }
        return updated;
      });
    },
    [isSetupMode, fen, updateEditorFen]
  );

  // Set FEN from SetupPanel
  const handleSetFen = useCallback(
    (newFen: string) => {
      if (isSetupMode) {
        const val = validateEditorPosition(newFen);
        setFenDirectly(newFen);
        const tokens = newFen.trim().split(/\s+/);
        if (tokens.length >= 2) setSetupTurn(tokens[1] === "b" ? "b" : "w");
        if (tokens.length >= 3) setSetupCastling(parseCastlingRights(tokens[2]));
        if (tokens.length >= 4) setSetupEnPassant(tokens[3]);
        setSetupError(val.valid ? null : val.error || null);
        return { ok: true };
      } else {
        return loadFen(newFen);
      }
    },
    [isSetupMode, setFenDirectly, loadFen]
  );

  const handleClearBoard = useCallback(() => {
    clearBoard();
    setSetupError("Missing White King (position must have exactly 1 White King).");
  }, [clearBoard]);

  const handleResetToStart = useCallback(() => {
    reset();
    setSetupTurn("w");
    setSetupCastling({ K: true, Q: true, k: true, q: true });
    setSetupEnPassant("-");
    setSetupError(null);
  }, [reset]);

  const handleArrowsChange = ({ arrows }: { arrows: Arrow[] }) => {
    setUserArrows(arrows);
  };

  const handleClearAnnotations = () => {
    setUserArrows([]);
    setHighlightedSquares({});
  };

  // Compute merged arrows (user annotations + engine best moves)
  const combinedArrows = useMemo(() => {
    const arrowsList: Arrow[] = [...userArrows];

    if (showBestMoveArrow && engineActive && !isSetupMode && engineLines.length > 0) {
      engineLines.forEach((line, idx) => {
        if (line.bestMoveUci && line.bestMoveUci.length >= 4) {
          const start = line.bestMoveUci.substring(0, 2);
          const end = line.bestMoveUci.substring(2, 4);
          const colors = ["#4e8765", "#68a063", "#e0b86a"];
          arrowsList.push({
            startSquare: start,
            endSquare: end,
            color: colors[idx] || colors[0],
          });
        }
      });
    }

    return arrowsList;
  }, [userArrows, showBestMoveArrow, engineActive, isSetupMode, engineLines]);

  // Compute custom square styles
  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    Object.entries(highlightedSquares).forEach(([sq, color]) => {
      styles[sq] = { backgroundColor: color };
    });

    if (lastMove && !isSetupMode) {
      styles[lastMove.from] = { backgroundColor: "rgba(207, 168, 89, 0.3)" };
      styles[lastMove.to] = { backgroundColor: "rgba(207, 168, 89, 0.4)" };
    }

    if (selectedSquare && !isSetupMode) {
      styles[selectedSquare] = { backgroundColor: "rgba(207, 168, 89, 0.5)" };
    }

    if (checkSquare && !isSetupMode) {
      styles[checkSquare] = {
        backgroundColor: "rgba(231, 76, 60, 0.65)",
        boxShadow: "inset 0 0 10px rgba(179, 38, 30, 0.8)",
      };
    }

    if (!isSetupMode) {
      possibleMoves.forEach((targetSq) => {
        const pieceOnTarget = chess.get(targetSq as Square);
        if (pieceOnTarget) {
          styles[targetSq] = {
            ...styles[targetSq],
            background:
              "radial-gradient(circle, transparent 55%, rgba(207, 168, 89, 0.7) 60%)",
          };
        } else {
          styles[targetSq] = {
            ...styles[targetSq],
            background:
              "radial-gradient(circle, rgba(207, 168, 89, 0.65) 24%, transparent 28%)",
          };
        }
      });
    }

    return styles;
  }, [highlightedSquares, lastMove, isSetupMode, selectedSquare, checkSquare, possibleMoves, chess]);

  // Global Keyboard shortcuts (Shift+F for Fullscreen, F for Flip, Esc for exit pseudo-fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Shift + F: Toggle Fullscreen
      if (e.shiftKey && (e.key === "F" || e.key === "f")) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Esc: Exit pseudo-fullscreen
      if (e.key === "Escape" && isPseudoFullscreen) {
        e.preventDefault();
        setIsPseudoFullscreen(false);
        return;
      }

      // F (without modifiers): Flip board orientation
      if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && (e.key === "f" || e.key === "F")) {
        e.preventDefault();
        flipBoard();
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToStart();
      } else if (e.key === "End") {
        e.preventDefault();
        goToEnd();
      } else if (e.key.toLowerCase() === "u") {
        e.preventDefault();
        undo();
      } else if (e.code === "Space") {
        e.preventDefault();
        if (!isSetupMode) {
          setEngineActive((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    toggleFullscreen,
    isPseudoFullscreen,
    flipBoard,
    goToPrevious,
    goToNext,
    goToStart,
    goToEnd,
    undo,
    isSetupMode,
  ]);

  const handleTakeBackVsEngine = () => {
    if (history.length >= 2) {
      goToMove(currentMoveIndex - 2);
    } else {
      reset();
    }
  };

  const handleEngineHint = () => {
    if (bestMove) {
      const from = bestMove.uci.substring(0, 2);
      const to = bestMove.uci.substring(2, 4);
      setUserArrows([
        {
          startSquare: from,
          endSquare: to,
          color: "#cfa859",
        },
      ]);
    }
  };

  // Configure Chessboard options
  const chessboardOptions: ChessboardOptions = useMemo(
    () => ({
      id: "chesshub-studio-board",
      position: fen,
      boardOrientation: orientation,
      showNotation: showCoordinates,
      allowDragging: true,
      allowDragOffBoard: isSetupMode,
      darkSquareStyle: { backgroundColor: currentTheme.dark },
      lightSquareStyle: { backgroundColor: currentTheme.light },
      squareStyles,
      arrows: combinedArrows,
      allowDrawingArrows: !isSetupMode,
      onPieceDrop: handlePieceDrop,
      onSquareClick: handleSquareClick,
      onSquareRightClick: handleSquareRightClick,
      onArrowsChange: handleArrowsChange,
    }),
    [
      fen,
      orientation,
      showCoordinates,
      isSetupMode,
      currentTheme,
      squareStyles,
      combinedArrows,
      handlePieceDrop,
      handleSquareClick,
      handleSquareRightClick,
    ]
  );

  const containerClasses = isFullscreen
    ? isPseudoFullscreen
      ? "fixed inset-0 z-50 bg-[#0e0e10] text-[#f5f3ef] overflow-y-auto lg:overflow-hidden p-3 md:p-6 flex flex-col justify-between"
      : "w-full h-full min-h-screen bg-[#0e0e10] text-[#f5f3ef] overflow-y-auto lg:overflow-hidden p-3 md:p-6 flex flex-col justify-between"
    : "w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6";

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Top Header / Studio Bar */}
      {isFullscreen ? (
        /* Sleek Fullscreen Top Bar */
        <div className="flex items-center justify-between pb-3 border-b border-[#2e2e36]/80 text-[12px] font-mono shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="font-light font-[family-name:var(--font-heading)] text-[18px] text-[#f5f3ef]">
              ChessHub Studio
            </span>
            <span className="px-2 py-0.5 rounded-full border border-[#cfa859]/30 bg-[#cfa859]/10 text-[10px] text-[#cfa859]">
              Fullscreen
            </span>
            {isSetupMode && (
              <span className="px-2 py-0.5 rounded-full border border-[#e0b86a]/40 bg-[#e0b86a]/15 text-[10px] text-[#e0b86a] font-semibold flex items-center gap-1">
                <Pencil size={10} /> Editor Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-lg border border-[#2e2e36] bg-[#1a1a1e] hover:bg-[#222228] transition-colors ${
                isMuted ? "text-[#a8a39a]" : "text-[#cfa859]"
              }`}
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Coordinates toggle */}
            <button
              type="button"
              onClick={() => handleToggleCoordinates(!showCoordinates)}
              className={`px-2 py-1.5 rounded-lg border border-[#2e2e36] bg-[#1a1a1e] text-[11px] font-mono transition-colors ${
                showCoordinates ? "text-[#cfa859]" : "text-[#a8a39a]"
              }`}
              title="Toggle algebraic coordinates"
            >
              Coord: {showCoordinates ? "ON" : "OFF"}
            </button>

            {/* Shortcuts Help */}
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="p-2 rounded-lg border border-[#2e2e36] bg-[#1a1a1e] hover:bg-[#222228] text-[#a8a39a] hover:text-[#f5f3ef] transition-colors"
              title="Keyboard shortcuts (Shift+F, F, etc.)"
            >
              <HelpCircle size={15} />
            </button>

            {/* Exit Fullscreen Toggle Button */}
            <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
          </div>
        </div>
      ) : (
        /* Normal Standard Header */
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e36]">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] md:text-[32px] font-light font-[family-name:var(--font-heading)] text-[#f5f3ef] tracking-tight">
                Chess Board Studio
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full border border-[#cfa859]/30 bg-[#cfa859]/10 text-[11px] font-mono text-[#cfa859]">
                Coach & Analysis
              </span>
            </div>
            <p className="text-[13px] text-[#a8a39a] font-[family-name:var(--font-body)] mt-0.5">
              Interactive analysis board with client-side Stockfish 19 WASM engine, position editor, and teaching tools.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-nowrap overflow-x-auto max-w-full pb-0.5">
            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              className={`p-2 rounded-lg border border-[#2e2e36] bg-[#1a1a1e] hover:bg-[#222228] transition-colors ${
                isMuted ? "text-[#a8a39a]" : "text-[#cfa859]"
              }`}
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Theme selector dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2e2e36] bg-[#1a1a1e] text-[12px] font-mono">
              <Palette size={14} className="text-[#cfa859]" />
              <select
                value={themeId}
                onChange={(e) => handleSelectTheme(e.target.value)}
                className="bg-transparent text-[#f5f3ef] focus:outline-hidden cursor-pointer"
              >
                {BOARD_THEMES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#141416] text-[#f5f3ef]">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinates toggle */}
            <button
              type="button"
              onClick={() => handleToggleCoordinates(!showCoordinates)}
              className={`px-2.5 py-1.5 rounded-lg border border-[#2e2e36] bg-[#1a1a1e] text-[12px] font-mono transition-colors ${
                showCoordinates ? "text-[#cfa859]" : "text-[#a8a39a]"
              }`}
              title="Toggle algebraic coordinates (a-h, 1-8)"
            >
              Coord: {showCoordinates ? "ON" : "OFF"}
            </button>

            {/* Shortcuts Help */}
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="p-2 rounded-lg border border-[#2e2e36] bg-[#1a1a1e] hover:bg-[#222228] text-[#a8a39a] hover:text-[#f5f3ef] transition-colors"
              title="Keyboard shortcuts & mouse controls"
            >
              <HelpCircle size={16} />
            </button>

            {/* Fullscreen Button in Header */}
            <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
          </div>
        </div>
      )}

      {/* Main Studio Work Area wrapped with ChessboardProvider for seamless spare-piece DND */}
      <ChessboardProvider options={chessboardOptions}>
        <div
          className={`grid grid-cols-1 ${
            isFullscreen
              ? "lg:grid-cols-12 flex-1 min-h-0 gap-4 md:gap-6 items-center"
              : "lg:grid-cols-12 gap-6 items-start"
          }`}
        >
          {/* Left / Center Area: Board + Attached Eval Bar + Tray (7 cols) */}
          <div
            className={`${
              isFullscreen
                ? "lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center h-full min-h-0"
                : "lg:col-span-7 flex flex-col items-center gap-4"
            }`}
          >
            {/* Game Status Banner with Top-Right Fullscreen & Flip buttons */}
            <div className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-[#141416] border border-[#2e2e36] text-[13px] font-mono max-w-[660px] mb-2">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full border border-[#2e2e36] ${
                    isSetupMode
                      ? "bg-[#cfa859] animate-pulse"
                      : gameStatus.turn === "w"
                      ? "bg-white"
                      : "bg-[#141418]"
                  }`}
                />
                <span className="font-semibold text-[#f5f3ef]">
                  {isSetupMode ? "Editor Mode Active" : gameStatus.statusText}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[12px] text-[#a8a39a]">
                <span>Orient: {orientation === "white" ? "White" : "Black"}</span>
                <button
                  type="button"
                  onClick={flipBoard}
                  className="text-[#cfa859] hover:underline font-medium text-[11px]"
                  title="Flip board (F)"
                >
                  (Flip F)
                </button>

                {/* Fullscreen button near top-right of board area */}
                <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} />
              </div>
            </div>

            {/* Board + Attached Eval Bar Layout */}
            <div
              ref={boardContainerRef}
              className="relative w-full flex items-stretch justify-center gap-2 sm:gap-3"
              style={{
                maxWidth: boardDim ? `${boardDim + 56}px` : isFullscreen ? "calc(100vh - 160px)" : "640px",
              }}
            >
              {/* Attached Eval Bar */}
              <div className="shrink-0 flex items-stretch">
                <EvalBar
                  evaluation={currentEval}
                  orientation={orientation}
                  isThinking={isEngineThinking}
                />
              </div>

              {/* Chessboard Box */}
              <div
                className="relative aspect-square w-full rounded-xl overflow-hidden border border-[#2e2e36] bg-[#0e0e10] shadow-2xl select-none"
                style={{
                  width: boardDim ? `${boardDim}px` : undefined,
                  height: boardDim ? `${boardDim}px` : undefined,
                  maxHeight: isFullscreen ? "calc(100vh - 160px)" : "min(600px, 80vh)",
                }}
              >
                {isMounted ? <Chessboard /> : <BoardSkeleton />}
              </div>
            </div>

            {/* Piece Palette Tray directly below the board when in Editor Mode */}
            {isSetupMode && (
              <div
                className="w-full mt-2"
                style={{
                  maxWidth: boardDim ? `${boardDim + 56}px` : isFullscreen ? "calc(100vh - 160px)" : "640px",
                }}
              >
                <PiecePalette
                  selectedPiece={selectedPalettePiece}
                  onSelectPiece={setSelectedPalettePiece}
                />
              </div>
            )}

            {/* Quick Annotation sub-bar */}
            {!isSetupMode && (
              <div
                className="w-full flex items-center justify-between text-[11px] font-mono text-[#a8a39a] px-1 mt-1"
                style={{
                  maxWidth: boardDim ? `${boardDim + 56}px` : "620px",
                }}
              >
                <span>Right-click drag to draw arrows</span>
                {userArrows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAnnotations}
                    className="text-[#cfa859] hover:underline cursor-pointer"
                  >
                    Clear {userArrows.length} arrow{userArrows.length > 1 ? "s" : ""}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Area: Tabbed Panels (5 cols) */}
          <div
            className={`${
              isFullscreen
                ? "lg:col-span-5 xl:col-span-4 flex flex-col h-full min-h-0 max-h-[calc(100vh-100px)]"
                : "lg:col-span-5 flex flex-col h-[650px] max-h-[85vh]"
            }`}
          >
            {/* Navigation Tabs Header */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#1a1a1e] border border-[#2e2e36] mb-3 text-[12px] font-mono shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("moves")}
                className={`py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "moves"
                    ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                    : "text-[#dcd8d0] hover:bg-[#222228] hover:text-[#f5f3ef]"
                }`}
              >
                Moves
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("engine")}
                className={`py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "engine"
                    ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                    : "text-[#dcd8d0] hover:bg-[#222228] hover:text-[#f5f3ef]"
                }`}
              >
                Engine
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("setup")}
                className={`py-2 rounded-lg font-medium transition-colors cursor-pointer relative ${
                  activeTab === "setup"
                    ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                    : "text-[#dcd8d0] hover:bg-[#222228] hover:text-[#f5f3ef]"
                }`}
              >
                Setup
                {isSetupMode && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#cfa859] animate-ping" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "notes"
                    ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                    : "text-[#dcd8d0] hover:bg-[#222228] hover:text-[#f5f3ef]"
                }`}
              >
                Notes
              </button>
            </div>

            {/* Active Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {activeTab === "moves" && (
                <MoveList
                  history={history}
                  currentMoveIndex={currentMoveIndex}
                  onGoToMove={goToMove}
                  onGoToStart={goToStart}
                  onGoToEnd={goToEnd}
                  onGoToPrevious={goToPrevious}
                  onGoToNext={goToNext}
                  onReset={reset}
                  onFlip={flipBoard}
                  isMuted={isMuted}
                  onToggleSound={toggleSound}
                  showQualityHints={showQualityHints}
                />
              )}

              {activeTab === "engine" && (
                <EnginePanel
                  engineEnabled={engineActive}
                  onToggleEngine={setEngineActive}
                  isReady={isEngineReady}
                  isThinking={isEngineThinking}
                  unsupported={isEngineUnsupported}
                  unsupportedMessage={engineUnsupportedMessage}
                  depth={engineDepth}
                  onDepthChange={setEngineDepth}
                  multiPv={multiPv}
                  onMultiPvChange={setMultiPv}
                  lines={engineLines}
                  currentEval={currentEval}
                  onPlayEngineMove={(uci) => {
                    const from = uci.substring(0, 2);
                    const to = uci.substring(2, 4);
                    const promotion = uci.length > 4 ? uci.substring(4, 5) : undefined;
                    makeMove({ from, to, promotion });
                  }}
                  showBestMoveArrow={showBestMoveArrow}
                  onToggleBestMoveArrow={setShowBestMoveArrow}
                  showQualityHints={showQualityHints}
                  onToggleQualityHints={setShowQualityHints}
                  playVsEngine={playVsEngine}
                  onUpdatePlayVsEngine={setPlayVsEngine}
                  onEngineHint={handleEngineHint}
                  onTakeBack={handleTakeBackVsEngine}
                />
              )}

              {activeTab === "setup" && (
                <SetupPanel
                  currentFen={fen}
                  isSetupMode={isSetupMode}
                  onToggleSetupMode={handleToggleSetupMode}
                  selectedPalettePiece={selectedPalettePiece}
                  onSelectPalettePiece={setSelectedPalettePiece}
                  onSetFen={handleSetFen}
                  onResetToStart={handleResetToStart}
                  onClearBoard={handleClearBoard}
                  onImportPgn={loadPgn}
                  onGetPgn={getPgn}
                  turn={setupTurn}
                  onSetTurn={(t) => {
                    setSetupTurn(t);
                    const currentSquares = fenToSquares(fen);
                    updateEditorFen(currentSquares, t, setupCastling, setupEnPassant);
                  }}
                  castlingRights={setupCastling}
                  onSetCastlingRights={(rights) => {
                    setSetupCastling(rights);
                    const currentSquares = fenToSquares(fen);
                    updateEditorFen(currentSquares, setupTurn, rights, setupEnPassant);
                  }}
                  enPassant={setupEnPassant}
                  onSetEnPassant={(ep) => {
                    setSetupEnPassant(ep);
                    const currentSquares = fenToSquares(fen);
                    updateEditorFen(currentSquares, setupTurn, setupCastling, ep);
                  }}
                  validationError={setupError}
                  onStartAnalysis={handleStartAnalysis}
                />
              )}

              {activeTab === "notes" && (
                <NotesPanel
                  currentFen={fen}
                  currentPgn={getPgn()}
                  notes={notes}
                  onNotesChange={setNotes}
                  onLoadPosition={(loadPositionFen, loadedNotes) => {
                    handleSetFen(loadPositionFen);
                    if (loadedNotes !== undefined) setNotes(loadedNotes);
                  }}
                  onClearAnnotations={handleClearAnnotations}
                />
              )}
            </div>
          </div>
        </div>
      </ChessboardProvider>

      {/* Pawn Promotion Dialog Modal */}
      <PromotionDialog
        isOpen={!!pendingPromotion}
        color={chess.turn()}
        onSelect={(p: PieceSymbol) => confirmPromotion(p)}
        onCancel={cancelPromotion}
      />

      {/* Keyboard Shortcuts Popover */}
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
