# Plan: Real-time Stockfish Evaluation Bar

## Context
Add a live evaluation bar (like chess.com) to `GameRoom` that updates after every move. The bar shows White/Black advantage as a vertical fill, with a numeric score (+1.4, M3, etc.) and smooth animation.

**Decision: Frontend-only, Stockfish WASM Web Worker.**
The backend already sends the full FEN in every MOVE message (`move.after`). Running Stockfish in a browser Web Worker means zero backend changes, zero new WS message types, and no added server load. The non-NNUE `stockfish-16.js` variant avoids the `SharedArrayBuffer`/COOP-COEP header complexity that NNUE requires in Vite.

---

## Files Changed

| File | Change |
|---|---|
| `frontend_1/package.json` | add `stockfish` npm dependency |
| `frontend_1/src/hooks/useStockfish.ts` | **New** — UCI wrapper hook |
| `frontend_1/src/components/EvalBar.tsx` | **New** — visual bar component |
| `frontend_1/src/screens/GameRoom.tsx` | ~12 lines added |
| `frontend_1/vite.config.ts` | maybe 1 line if Vite pre-bundle fails |

No backend files touched.

---

## Step 1 — Install

```bash
cd frontend_1 && npm install stockfish
```

After install, confirm the pure-JS worker filename:
```
ls node_modules/stockfish/src/
# expect: stockfish-16.js (non-NNUE) — adjust the import path below if different
```

---

## Step 2 — `src/hooks/useStockfish.ts` (new file)

```ts
import { useEffect, useRef, useState } from 'react'

export function useStockfish(fen: string | null, isGameOver: boolean) {
  const workerRef = useRef<Worker | null>(null)
  const currentFenRef = useRef<string | null>(null)
  const [evaluation, setEvaluation] = useState<number | null>(null)
  const [mateIn, setMateIn] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Spawn worker once
  useEffect(() => {
    const w = new Worker(new URL('stockfish/src/stockfish-16.js', import.meta.url))
    workerRef.current = w
    w.postMessage('uci')
    w.onmessage = (e: MessageEvent) => {
      const msg = e.data as string
      if (msg.startsWith('info') && msg.includes('score')) {
        const sideToMove = currentFenRef.current?.split(' ')[1] // 'w' or 'b'
        const cpMatch = msg.match(/score cp (-?\d+)/)
        const mateMatch = msg.match(/score mate (-?\d+)/)
        if (cpMatch) {
          let cp = parseInt(cpMatch[1])
          if (sideToMove === 'b') cp = -cp   // normalize to White's perspective
          setEvaluation(cp)
          setMateIn(null)
        } else if (mateMatch) {
          let mate = parseInt(mateMatch[1])
          if (sideToMove === 'b') mate = -mate
          setMateIn(mate)
          setEvaluation(null)
        }
      }
      if (msg.startsWith('bestmove')) setIsCalculating(false)
    }
    return () => w.terminate()
  }, [])

  // Re-run analysis on every new FEN
  useEffect(() => {
    const w = workerRef.current
    if (!fen || isGameOver || !w) return
    setIsCalculating(true)
    currentFenRef.current = fen
    w.postMessage('stop')
    w.postMessage(`position fen ${fen}`)
    w.postMessage('go movetime 500')   // 500ms per move; tune for feel vs strength
  }, [fen, isGameOver])

  return { evaluation, mateIn, isCalculating }
}
```

Key points:
- `stop` before each new `go` prevents stale results from a prior search
- Scores are normalized so positive = White ahead (Stockfish scores relative to side-to-move, so negate when Black's turn)
- `movetime 500` keeps the bar snappy; lower to 200ms if it feels slow

---

## Step 3 — `src/components/EvalBar.tsx` (new file)

```tsx
interface EvalBarProps {
  evaluation: number | null
  mateIn: number | null
  isCalculating: boolean
  perspective: 'white' | 'black'
}

// Lichess sigmoid: cp → win% for White
function cpToWinPct(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368 * cp)) - 1)
}

export default function EvalBar({ evaluation, mateIn, isCalculating, perspective }: EvalBarProps) {
  let whitePct = 50
  if (mateIn !== null) {
    whitePct = mateIn > 0 ? 100 : 0
  } else if (evaluation !== null) {
    whitePct = Math.min(100, Math.max(0, cpToWinPct(evaluation)))
  }

  // Flip bar when viewing as Black (bar bottom = Black's color)
  const bottomPct = perspective === 'white' ? whitePct : 100 - whitePct

  const label = mateIn !== null
    ? `M${Math.abs(mateIn)}`
    : evaluation !== null
    ? (evaluation >= 0 ? '+' : '') + (evaluation / 100).toFixed(1)
    : null

  return (
    <div className="flex flex-col items-center w-4 h-[512px] rounded overflow-hidden relative select-none">
      {/* Dark (opponent) portion — top */}
      <div className="bg-gray-800 w-full transition-all duration-500 ease-in-out" style={{ height: `${100 - bottomPct}%` }} />
      {/* Light (bottom player) portion */}
      <div className="bg-white w-full transition-all duration-500 ease-in-out" style={{ height: `${bottomPct}%` }} />
      {/* Score label */}
      {label && (
        <span className="absolute bottom-1 text-[9px] font-bold text-gray-500 leading-none">
          {label}
        </span>
      )}
      {isCalculating && !label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
        </div>
      )}
    </div>
  )
}
```

The `h-[512px]` matches `8 × 64px` (ChessBoard square size). If the board size changes, update this value.

---

## Step 4 — Changes to `GameRoom.tsx`

**Add near the top imports:**
```ts
import { useStockfish } from '@/hooks/useStockfish'
import EvalBar from '@/components/EvalBar'
```

**Add after `const chess = chessRef.current` (already exists in the component body):**
```ts
const currentFen = chess?.fen() ?? null
const isGameOver = status === 'COMPLETED' || Boolean(chess?.isGameOver())
const { evaluation, mateIn, isCalculating } = useStockfish(currentFen, isGameOver)
```

`currentFen` derives from `chess` (a ref read), but it re-computes every render. Since `board` state changes on every move (triggering a re-render), `currentFen` will be fresh after every move without needing extra state.

**In the board container JSX** — insert `<EvalBar>` as the first child of the board flex container, before `<ChessBoard>`:
```tsx
<EvalBar
  evaluation={evaluation}
  mateIn={mateIn}
  isCalculating={isCalculating}
  perspective={myColor ?? 'white'}
/>
```

The board container already uses `flex justify-between`, so the bar will sit flush to the left of the chess board.

---

## Step 5 — Vite config (only if needed)

If Vite throws `Failed to resolve import "stockfish/src/stockfish-16.js"`:

```ts
// vite.config.ts — inside defineConfig({})
optimizeDeps: {
  exclude: ['stockfish']
}
```

This prevents Vite from pre-bundling the worker file.

---

## Verification

1. `cd frontend_1 && npm run dev`
2. Open a game in two tabs, make a move
3. Eval bar should animate within ~500ms of the move
4. After checkmate: bar should go full White or full Black, label should show `M0`
5. After game ends: bar freezes at final value
6. Open browser DevTools → Application → Workers: confirm one `stockfish-16.js` worker per tab

---

## Known limitation

`ChessBoard.tsx` never flips the board for Black players (row 0 is always rank 8). The `perspective` prop is wired correctly in `EvalBar` so the bar will orient correctly once board flip is added, but currently all players see White at the bottom regardless of color.
