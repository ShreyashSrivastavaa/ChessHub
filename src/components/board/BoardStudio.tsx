"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useChessGame } from "@/hooks/useChessGame";
import { useStockfish } from "@/hooks/useStockfish";
import { EvalBar } from "./EvalBar";
import { MoveList } from "./MoveList";
import { EnginePanel, PlayVsEngineConfig } from "./EnginePanel";
import type { PalettePiece } from "./SetupPanel";
import { Arrow, PieceDropHandlerArgs, SquareHandlerArgs } from "react-chessboard";
import { Square, validateFen, PieceSymbol, Chess } from "chess.js";
import {
  HelpCircle,
  Sliders,
  Sparkles,
  Palette,
  Volume2,
  VolumeX,
  Share2,
  Check,
} from "lucide-react";
import { BoardSkeleton } from "./BoardSkeleton";

// Dynamically import auxiliary panels & dialogs to keep main thread light
const SetupPanel = dynamic(
  () => import("./SetupPanel").then((mod) => mod.SetupPanel),
  {
    loading: () => <div className="h-full rounded-xl bg-[#141416] border border-[#2e2e36] animate-pulse" />,
  }
);

const NotesPanel = dynamic(
  () => import("./NotesPanel").then((mod) => mod.NotesPanel),
  {
    loading: () => <div className="h-full rounded-xl bg-[#141416] border border-[#2e2e36] animate-pulse" />,
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

// Dynamically import Chessboard without SSR to avoid hydration issues
const Chessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  {
    ssr: false,
    loading: () => <BoardSkeleton />,
  }
);

interface MemoizedBoardProps {
  fen: string;
  orientation: "white" | "black";
  showCoordinates: boolean;
  isSetupMode: boolean;
  currentTheme: { dark: string; light: string };
  squareStyles: Record<string, React.CSSProperties>;
  arrows: Arrow[];
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
  onSquareClick: (args: SquareHandlerArgs) => void;
  onSquareRightClick: (args: SquareHandlerArgs) => void;
  onArrowsChange: (args: { arrows: Arrow[] }) => void;
}

// React.memo ensures engine evaluation/depth updates never cause the board to re-render
const MemoizedBoard = React.memo(function MemoizedBoard({
  fen,
  orientation,
  showCoordinates,
  isSetupMode,
  currentTheme,
  squareStyles,
  arrows,
  onPieceDrop,
  onSquareClick,
  onSquareRightClick,
  onArrowsChange,
}: MemoizedBoardProps) {
  return (
    <Chessboard
      options={{
        position: fen,
        boardOrientation: orientation,
        showNotation: showCoordinates,
        allowDragging: !isSetupMode,
        darkSquareStyle: { backgroundColor: currentTheme.dark },
        lightSquareStyle: { backgroundColor: currentTheme.light },
        squareStyles,
        arrows,
        allowDrawingArrows: true,
        onPieceDrop,
        onSquareClick,
        onSquareRightClick,
        onArrowsChange,
      }}
    />
  );
});

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
  // Query param FEN fallback
  const startPosition = useMemo(() => {
    if (initialFen) return initialFen;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryFen = params.get("fen");
      if (queryFen && validateFen(queryFen).ok) {
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
    loadPgn,
    getPgn,
    setMoveQualityAt,
  } = useChessGame({ initialFen: startPosition });

  // Engine state & settings - defaults to false so worker/wasm only load on demand
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
  const [setupError, setSetupError] = useState<string | null>(null);

  // Help modal
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Load preferences from localStorage on client mount
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

  // Update theme preference
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

  // Trigger Stockfish evaluation whenever position FEN changes in analysis mode
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
  }, [fen, engineActive, engineDepth, isSetupMode, playVsEngine.active, gameStatus.isGameOver, evaluatePosition, stopEngine]);

  // Handle Play vs Engine automatic reply
  useEffect(() => {
    if (!playVsEngine.active || isSetupMode || gameStatus.isGameOver) return;

    // Check if it's the engine's turn to move
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

  // Record move quality when engine evaluation becomes available
  useEffect(() => {
    if (currentMoveIndex >= 0 && history[currentMoveIndex] && currentEval?.scoreCp !== undefined) {
      const move = history[currentMoveIndex];
      if (move.evalAfter === undefined) {
        setMoveQualityAt(currentMoveIndex, move.evalBefore ?? 0, currentEval.scoreCp);
      }
    }
  }, [currentEval, currentMoveIndex, history, setMoveQualityAt]);

  // Validate setup position
  const validateSetupPosition = useCallback(
    (checkFen: string): string | null => {
      const val = validateFen(checkFen);
      if (!val.ok) return val.error || "Invalid position";

      // Count kings
      const piecePart = checkFen.split(" ")[0];
      const whiteKings = (piecePart.match(/K/g) || []).length;
      const blackKings = (piecePart.match(/k/g) || []).length;

      if (whiteKings !== 1) return `Position must have exactly 1 White King (found ${whiteKings}).`;
      if (blackKings !== 1) return `Position must have exactly 1 Black King (found ${blackKings}).`;

      // Check pawns on 1st/8th rank
      const ranks = piecePart.split("/");
      if (ranks[0].includes("p") || ranks[0].includes("P")) {
        return "Pawns cannot be placed on the 8th rank.";
      }
      if (ranks[7].includes("p") || ranks[7].includes("P")) {
        return "Pawns cannot be placed on the 1st rank.";
      }

      // Check if side not to move is in check
      try {
        const testChess = new Chess(checkFen);
        // Toggle turn to test if opposite side can capture king
        const sideNotToMove = testChess.turn() === "w" ? "b" : "w";
        const tokens = checkFen.split(" ");
        tokens[1] = sideNotToMove;
        const switchedFen = tokens.join(" ");
        const testSwitched = new Chess(switchedFen);
        if (testSwitched.isCheck()) {
          return "The side not to move cannot be in check.";
        }
      } catch {
        return "Invalid board structure.";
      }

      return null;
    },
    []
  );

  // Toggle Setup Mode
  const handleToggleSetupMode = (active: boolean) => {
    if (active) {
      setIsSetupMode(true);
      setActiveTab("setup");
      stopEngine();
      setSetupTurn(chess.turn());
      setSetupError(validateSetupPosition(fen));
    } else {
      // Validate before leaving setup
      const error = validateSetupPosition(fen);
      if (error) {
        setSetupError(error);
        return;
      }
      setIsSetupMode(false);
      setSetupError(null);
      loadFen(fen);
      setActiveTab("moves");
    }
  };

  // Setup click: place piece or erase
  const handleSetupSquareClick = (square: Square) => {
    try {
      const tempChess = new Chess(fen);
      if (selectedPalettePiece === null) {
        // Eraser
        tempChess.remove(square);
      } else {
        // Put piece
        tempChess.remove(square);
        tempChess.put(
          { type: selectedPalettePiece.type, color: selectedPalettePiece.color },
          square
        );
      }

      // Preserve turn and castling rights
      const tokens = tempChess.fen().split(" ");
      tokens[1] = setupTurn;
      let castleStr = "";
      if (setupCastling.K) castleStr += "K";
      if (setupCastling.Q) castleStr += "Q";
      if (setupCastling.k) castleStr += "k";
      if (setupCastling.q) castleStr += "q";
      tokens[2] = castleStr || "-";
      const newFen = tokens.join(" ");

      setSetupError(validateSetupPosition(newFen));
      loadFen(newFen);
    } catch (err) {
      console.warn("Setup piece placement failed:", err);
    }
  };

  // Normal piece drop handler
  const handlePieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
    if (!targetSquare) return false;
    if (isSetupMode) return false;

    // In Play vs Engine mode, only let player move their color
    if (playVsEngine.active && chess.turn() !== playVsEngine.playerColor) {
      return false;
    }

    const success = makeMove(
      { from: sourceSquare, to: targetSquare },
      { evalBefore: currentEval?.scoreCp }
    );
    return !!success;
  };

  // Normal square click handler
  const handleSquareClick = ({ square }: SquareHandlerArgs) => {
    if (isSetupMode) {
      handleSetupSquareClick(square as Square);
      return;
    }

    // In Play vs Engine mode, only allow clicking when it's player's turn
    if (playVsEngine.active && chess.turn() !== playVsEngine.playerColor) {
      return;
    }

    onSquareClick(square as Square);
  };

  // Right-click on square to toggle square highlight
  const handleSquareRightClick = ({ square }: SquareHandlerArgs) => {
    setHighlightedSquares((prev) => {
      const updated = { ...prev };
      if (updated[square]) {
        delete updated[square];
      } else {
        updated[square] = "rgba(207, 168, 89, 0.4)";
      }
      return updated;
    });
  };

  // User arrows drawn via right-click drag
  const handleArrowsChange = ({ arrows }: { arrows: Arrow[] }) => {
    setUserArrows(arrows);
  };

  const handleClearAnnotations = () => {
    setUserArrows([]);
    setHighlightedSquares({});
  };

  // Compute merged arrows (user drawn + Stockfish best moves)
  const combinedArrows = useMemo(() => {
    const arrowsList: Arrow[] = [...userArrows];

    if (showBestMoveArrow && engineActive && !isSetupMode && engineLines.length > 0) {
      engineLines.forEach((line, idx) => {
        if (line.bestMoveUci && line.bestMoveUci.length >= 4) {
          const start = line.bestMoveUci.substring(0, 2);
          const end = line.bestMoveUci.substring(2, 4);
          const colors = [
            "#4e8765", // Best: emerald green
            "#68a063", // 2nd: lighter sage
            "#e0b86a", // 3rd: muted gold
          ];
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

  // Compute custom square styles (selected square, legal moves dots, last move, king in check, user annotations)
  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};

    // 1. Right-clicked highlights
    Object.entries(highlightedSquares).forEach(([sq, color]) => {
      styles[sq] = { backgroundColor: color };
    });

    // 2. Last move highlight
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: "rgba(207, 168, 89, 0.3)",
      };
      styles[lastMove.to] = {
        backgroundColor: "rgba(207, 168, 89, 0.4)",
      };
    }

    // 3. Selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: "rgba(207, 168, 89, 0.5)",
      };
    }

    // 4. King in check
    if (checkSquare) {
      styles[checkSquare] = {
        backgroundColor: "rgba(231, 76, 60, 0.65)",
        boxShadow: "inset 0 0 10px rgba(179, 38, 30, 0.8)",
      };
    }

    // 5. Possible moves dots
    possibleMoves.forEach((targetSq) => {
      const pieceOnTarget = chess.get(targetSq as Square);
      if (pieceOnTarget) {
        // Capture ring
        styles[targetSq] = {
          ...styles[targetSq],
          background:
            "radial-gradient(circle, transparent 55%, rgba(207, 168, 89, 0.7) 60%)",
        };
      } else {
        // Small center dot
        styles[targetSq] = {
          ...styles[targetSq],
          background:
            "radial-gradient(circle, rgba(207, 168, 89, 0.65) 24%, transparent 28%)",
        };
      }
    });

    return styles;
  }, [highlightedSquares, lastMove, selectedSquare, checkSquare, possibleMoves, chess]);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form field
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "f") {
        e.preventDefault();
        flipBoard();
      } else if (key === "arrowleft") {
        e.preventDefault();
        goToPrevious();
      } else if (key === "arrowright") {
        e.preventDefault();
        goToNext();
      } else if (key === "home") {
        e.preventDefault();
        goToStart();
      } else if (key === "end") {
        e.preventDefault();
        goToEnd();
      } else if (key === "u") {
        e.preventDefault();
        undo();
      } else if (e.code === "Space") {
        e.preventDefault();
        setEngineActive((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flipBoard, goToPrevious, goToNext, goToStart, goToEnd, undo]);

  // Play vs Engine Take Back button: rolls back 2 half-moves so it's user's turn
  const handleTakeBackVsEngine = () => {
    if (history.length >= 2) {
      goToMove(currentMoveIndex - 2);
    } else {
      reset();
    }
  };

  // Play vs Engine Hint button: highlights best move
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

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Top Header / Studio Bar */}
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

        {/* Top actions & settings - flex-nowrap prevents line-jump height shift on mobile */}
        <div className="flex items-center gap-2 flex-nowrap overflow-x-auto max-w-full pb-0.5">
          {/* Sound Toggle */}
          <button
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
            onClick={() => setShortcutsOpen(true)}
            className="p-2 rounded-lg border border-[#2e2e36] bg-[#1a1a1e] hover:bg-[#222228] text-[#a8a39a] hover:text-[#f5f3ef] transition-colors"
            title="Keyboard shortcuts & mouse controls"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* Main Studio Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Area: Board + Attached Eval Bar (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4">
          {/* Game Status Banner */}
          <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#141416] border border-[#2e2e36] text-[13px] font-mono">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full border border-[#2e2e36] ${
                  gameStatus.turn === "w" ? "bg-white" : "bg-[#141418]"
                }`}
              />
              <span className="font-semibold text-[#f5f3ef]">
                {gameStatus.statusText}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[12px] text-[#a8a39a]">
              <span>Orient: {orientation === "white" ? "White" : "Black"}</span>
              <button
                onClick={flipBoard}
                className="text-[#cfa859] hover:underline font-medium text-[11px]"
              >
                (Flip F)
              </button>
            </div>
          </div>

          {/* Board + Attached Eval Bar Layout */}
          <div className="relative w-full flex items-stretch justify-center gap-2 sm:gap-3 max-w-[620px]">
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
              style={{ maxHeight: "min(600px, 80vh)" }}
            >
              <MemoizedBoard
                fen={fen}
                orientation={orientation}
                showCoordinates={showCoordinates}
                isSetupMode={isSetupMode}
                currentTheme={currentTheme}
                squareStyles={squareStyles}
                arrows={combinedArrows}
                onPieceDrop={handlePieceDrop}
                onSquareClick={handleSquareClick}
                onSquareRightClick={handleSquareRightClick}
                onArrowsChange={handleArrowsChange}
              />
            </div>
          </div>

          {/* Quick Annotation & Setup status sub-bar */}
          <div className="w-full max-w-[620px] flex items-center justify-between text-[11px] font-mono text-[#a8a39a] px-1">
            <span>Right-click drag to draw arrows</span>
            {userArrows.length > 0 && (
              <button
                onClick={handleClearAnnotations}
                className="text-[#cfa859] hover:underline"
              >
                Clear {userArrows.length} arrow{userArrows.length > 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>

        {/* Right Area: Tabbed Panels (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[650px] max-h-[85vh]">
          {/* Navigation Tabs Header */}
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#1a1a1e] border border-[#2e2e36] mb-3 text-[12px] font-mono">
            <button
              onClick={() => setActiveTab("moves")}
              className={`py-2 rounded-lg font-medium transition-colors ${
                activeTab === "moves"
                  ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                  : "text-[#dcd8d0] hover:bg-[#222228] hover:text-[#f5f3ef]"
              }`}
            >
              Moves
            </button>
            <button
              onClick={() => setActiveTab("engine")}
              className={`py-2 rounded-lg font-medium transition-colors ${
                activeTab === "engine"
                  ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                  : "text-[#dcd8d0] hover:bg-[#222228] hover:text-[#f5f3ef]"
              }`}
            >
              Engine
            </button>
            <button
              onClick={() => setActiveTab("setup")}
              className={`py-2 rounded-lg font-medium transition-colors ${
                activeTab === "setup"
                  ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                  : "text-[#dcd8d0] hover:bg-[#222228] hover:text-[#f5f3ef]"
              }`}
            >
              Setup
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`py-2 rounded-lg font-medium transition-colors ${
                activeTab === "notes"
                  ? "bg-[#cfa859] text-[#0e0e10] font-semibold"
                  : "text-[#dcd8d0] hover:bg-[#222228] hover:text-[#f5f3ef]"
              }`}
            >
              Notes
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="flex-1 min-h-0">
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
                onSetFen={loadFen}
                onResetToStart={reset}
                onClearBoard={clearBoard}
                onImportPgn={loadPgn}
                onGetPgn={getPgn}
                turn={setupTurn}
                onSetTurn={(t) => {
                  setSetupTurn(t);
                  const tokens = fen.split(" ");
                  tokens[1] = t;
                  loadFen(tokens.join(" "));
                }}
                castlingRights={setupCastling}
                onSetCastlingRights={(rights) => {
                  setSetupCastling(rights);
                  const tokens = fen.split(" ");
                  let str = "";
                  if (rights.K) str += "K";
                  if (rights.Q) str += "Q";
                  if (rights.k) str += "k";
                  if (rights.q) str += "q";
                  tokens[2] = str || "-";
                  loadFen(tokens.join(" "));
                }}
                validationError={setupError}
              />
            )}

            {activeTab === "notes" && (
              <NotesPanel
                currentFen={fen}
                currentPgn={getPgn()}
                notes={notes}
                onNotesChange={setNotes}
                onLoadPosition={(loadPositionFen, loadedNotes) => {
                  loadFen(loadPositionFen);
                  if (loadedNotes !== undefined) setNotes(loadedNotes);
                }}
                onClearAnnotations={handleClearAnnotations}
              />
            )}
          </div>
        </div>
      </div>

      {/* Pawn Promotion Dialog Modal */}
      <PromotionDialog
        isOpen={!!pendingPromotion}
        color={chess.turn()}
        onSelect={(p: PieceSymbol) => confirmPromotion(p)}
        onCancel={cancelPromotion}
      />

      {/* Keyboard Shortcuts Popover */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
