import { useEffect, useRef, useState } from "react";

// ponytail: asm.js variant — single self-contained file, no .wasm sibling to
// resolve under Vite and no SharedArrayBuffer/COOP-COEP headers needed.
// Upgrade path: switch to stockfish-18-lite-single.{js,wasm} copied into
// public/ (load via absolute path) only if eval quality feels weak.

export function useStockfish(fen: string | null, isGameOver: boolean) {
  const workerRef = useRef<Worker | null>(null);
  const currentFenRef = useRef<string | null>(null);
  const [evaluation, setEvaluation] = useState<number | null>(null);
  const [mateIn, setMateIn] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Spawn worker once
  useEffect(() => {
    const w = new Worker(
      new URL("stockfish/bin/stockfish-18-asm.js", import.meta.url),
    );
    workerRef.current = w;
    w.postMessage("uci");
    w.onmessage = (e: MessageEvent) => {
      const msg = e.data as string;
      if (typeof msg !== "string") return;
      if (msg.startsWith("info") && msg.includes("score")) {
        const sideToMove = currentFenRef.current?.split(" ")[1]; // 'w' or 'b'
        const cpMatch = msg.match(/score cp (-?\d+)/);
        const mateMatch = msg.match(/score mate (-?\d+)/);
        if (cpMatch) {
          let cp = parseInt(cpMatch[1]);
          if (sideToMove === "b") cp = -cp; // normalize to White's perspective
          setEvaluation(cp);
          setMateIn(null);
        } else if (mateMatch) {
          let mate = parseInt(mateMatch[1]);
          if (sideToMove === "b") mate = -mate;
          setMateIn(mate);
          setEvaluation(null);
        }
      }
      if (msg.startsWith("bestmove")) setIsCalculating(false);
    };
    return () => w.terminate();
  }, []);

  // Re-run analysis on every new FEN
  useEffect(() => {
    const w = workerRef.current;
    if (!fen || isGameOver || !w) return;
    setIsCalculating(true);
    currentFenRef.current = fen;
    w.postMessage("stop");
    w.postMessage(`position fen ${fen}`);
    w.postMessage("go movetime 500"); // 500ms per move; tune for feel vs strength
  }, [fen, isGameOver]);

  return { evaluation, mateIn, isCalculating };
}
