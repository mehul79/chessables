interface EvalBarProps {
  evaluation: number | null;
  mateIn: number | null;
  isCalculating: boolean;
  perspective: "white" | "black";
}

// Lichess sigmoid: cp → win% for White
function cpToWinPct(cp: number): number {
  return 50 + 50 * (2 / (1 + Math.exp(-0.00368 * cp)) - 1);
}

export default function EvalBar({
  evaluation,
  mateIn,
  isCalculating,
  perspective,
}: EvalBarProps) {
  let whitePct = 50;
  if (mateIn !== null) {
    whitePct = mateIn > 0 ? 100 : 0;
  } else if (evaluation !== null) {
    whitePct = Math.min(100, Math.max(0, cpToWinPct(evaluation)));
  }

  // Flip bar when viewing as Black (bar bottom = Black's color)
  const bottomPct = perspective === "white" ? whitePct : 100 - whitePct;

  // Show score from the bottom player's perspective (Black sees its own +/-)
  const sign = perspective === "white" ? 1 : -1;
  const label =
    mateIn !== null
      ? `M${Math.abs(mateIn)}`
      : evaluation !== null
        ? (() => {
            const v = (evaluation * sign) / 100;
            return (v >= 0 ? "+" : "") + v.toFixed(1);
          })()
        : null;

  return (
    <div className="flex flex-col items-center w-4 h-[512px] rounded overflow-hidden relative select-none">
      {/* Dark (opponent) portion — top */}
      <div
        className="bg-gray-800 w-full transition-all duration-500 ease-in-out"
        style={{ height: `${100 - bottomPct}%` }}
      />
      {/* Light (bottom player) portion */}
      <div
        className="bg-white w-full transition-all duration-500 ease-in-out"
        style={{ height: `${bottomPct}%` }}
      />
      {/* Score label — top of bar, white */}
      {label && (
        <span className="absolute top-1 text-[9px] font-bold text-white leading-none">
          {label}
        </span>
      )}
      {isCalculating && !label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
        </div>
      )}
    </div>
  );
}
