"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { EngineLine, EngineEval, parseUciInfoLine, calculateWinChance } from "@/lib/chess/uci";

export interface StockfishHookOptions {
  depth?: number;
  multiPv?: number;
  skillLevel?: number; // 0 to 20
  enabled?: boolean;
}

export function useStockfish(options: StockfishHookOptions = {}) {
  const { depth = 16, multiPv = 1, skillLevel = 20, enabled = true } = options;

  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [unsupportedMessage, setUnsupportedMessage] = useState<string | null>(null);
  const [lines, setLines] = useState<EngineLine[]>([]);
  const [currentEval, setCurrentEval] = useState<EngineEval | null>(null);
  const [bestMove, setBestMove] = useState<{ uci: string; san: string } | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const isReadyRef = useRef<boolean>(false);
  const currentFenRef = useRef<string>("");
  const currentLinesRef = useRef<Map<number, EngineLine>>(new Map());
  const pendingCommandsRef = useRef<string[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onEngineMoveCallbackRef = useRef<((bestMoveUci: string) => void) | null>(null);

  // Send a raw UCI command to the worker
  const sendCommand = useCallback((cmd: string) => {
    if (!workerRef.current) return;
    if (!isReadyRef.current && cmd !== "uci" && cmd !== "isready") {
      pendingCommandsRef.current.push(cmd);
      return;
    }
    workerRef.current.postMessage(cmd);
  }, []);

  // Initialize Worker on-demand only when enabled is true
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!enabled) {
      if (workerRef.current) {
        try {
          workerRef.current.postMessage("quit");
          workerRef.current.terminate();
        } catch {
          // cleanup
        }
        workerRef.current = null;
        isReadyRef.current = false;
        setIsReady(false);
        setIsThinking(false);
      }
      return;
    }

    // Check Worker and WebAssembly support
    if (!window.Worker) {
      setUnsupported(true);
      setUnsupportedMessage("Web Workers are not supported in your browser.");
      return;
    }

    let worker: Worker;
    try {
      worker = new Worker("/engine/stockfish.js");
      workerRef.current = worker;
    } catch (err) {
      setUnsupported(true);
      setUnsupportedMessage("Unable to load chess engine worker in this browser.");
      console.error("Stockfish init failed:", err);
      return;
    }

    worker.onmessage = (event: MessageEvent<string>) => {
      const line = typeof event.data === "string" ? event.data.trim() : "";
      if (!line) return;

      if (line === "uciok") {
        worker.postMessage("isready");
      } else if (line === "readyok") {
        isReadyRef.current = true;
        setIsReady(true);
        // Flush any queued commands
        while (pendingCommandsRef.current.length > 0) {
          const queued = pendingCommandsRef.current.shift();
          if (queued) worker.postMessage(queued);
        }
      } else if (line.startsWith("info ") && line.includes(" score ")) {
        const parsed = parseUciInfoLine(line, currentFenRef.current);
        if (parsed) {
          currentLinesRef.current.set(parsed.id, parsed);

          // Build sorted list of lines up to current MultiPV
          const activeLines = Array.from(currentLinesRef.current.values())
            .filter((l) => l.id <= multiPv)
            .sort((a, b) => a.id - b.id);

          setLines(activeLines);

          // Update main eval from line 1
          const line1 = currentLinesRef.current.get(1);
          if (line1) {
            setCurrentEval({
              scoreCp: line1.scoreCp,
              mate: line1.mate,
              scoreText: line1.scoreText,
              winChance: calculateWinChance(line1.scoreCp, line1.mate),
            });
            if (line1.bestMoveUci) {
              setBestMove({ uci: line1.bestMoveUci, san: line1.bestMoveSan });
            }
          }
        }
      } else if (line.startsWith("bestmove")) {
        setIsThinking(false);
        const parts = line.split(/\s+/);
        const moveUci = parts[1];
        if (onEngineMoveCallbackRef.current && moveUci && moveUci !== "(none)") {
          const cb = onEngineMoveCallbackRef.current;
          onEngineMoveCallbackRef.current = null;
          cb(moveUci);
        }
      }
    };

    worker.onerror = (err) => {
      console.warn("Stockfish worker error:", err);
      // Graceful fallback attempt with asm.js if wasm crashed
      setUnsupportedMessage("Engine error: WebAssembly may have run into memory or browser limitations.");
    };

    // Kick off UCI handshake
    worker.postMessage("uci");

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      try {
        worker.postMessage("quit");
        worker.terminate();
      } catch {
        // worker cleanup
      }
      workerRef.current = null;
      isReadyRef.current = false;
    };
  }, [enabled, multiPv]);

  // Update engine options when settings change
  useEffect(() => {
    if (!isReady) return;
    sendCommand(`setoption name MultiPV value ${multiPv}`);
    sendCommand(`setoption name Skill Level value ${skillLevel}`);
  }, [isReady, multiPv, skillLevel, sendCommand]);

  // Stop current search
  const stop = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    sendCommand("stop");
    setIsThinking(false);
    onEngineMoveCallbackRef.current = null;
  }, [sendCommand]);

  // Evaluate a specific position FEN
  const evaluatePosition = useCallback(
    (fen: string, searchDepth: number = depth) => {
      if (!enabled || unsupported) {
        stop();
        return;
      }

      currentFenRef.current = fen;
      currentLinesRef.current.clear();
      setLines([]);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        sendCommand("stop");
        sendCommand("ucinewgame");
        sendCommand(`setoption name MultiPV value ${multiPv}`);
        sendCommand(`setoption name Skill Level value ${skillLevel}`);
        sendCommand(`position fen ${fen}`);
        sendCommand(`go depth ${searchDepth}`);
        setIsThinking(true);
      }, 120);
    },
    [enabled, unsupported, depth, multiPv, skillLevel, sendCommand, stop]
  );

  // Request engine to compute and make a move (for Play vs Engine mode)
  const getEngineMove = useCallback(
    (fen: string, onMove: (bestMoveUci: string) => void, thinkTimeMs: number = 800) => {
      if (unsupported) return;

      currentFenRef.current = fen;
      onEngineMoveCallbackRef.current = onMove;

      stop();
      sendCommand(`setoption name Skill Level value ${skillLevel}`);
      sendCommand(`position fen ${fen}`);
      sendCommand(`go movetime ${thinkTimeMs}`);
      setIsThinking(true);
    },
    [unsupported, skillLevel, sendCommand, stop]
  );

  return {
    isReady,
    isThinking,
    unsupported,
    unsupportedMessage,
    lines,
    currentEval,
    bestMove,
    evaluatePosition,
    getEngineMove,
    stop,
    sendCommand,
  };
}
