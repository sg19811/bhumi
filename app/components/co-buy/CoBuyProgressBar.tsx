// Small visual for current interest vs. target. A modest signal — not "join N investors!".
export default function CoBuyProgressBar({ current, target }: { current: number; target?: number | null }) {
  const t = target && target > 0 ? target : 0;
  const pct = t > 0 ? Math.min(100, Math.round((current / t) * 100)) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{current} {current === 1 ? "buyer" : "buyers"} interested{t ? ` · target ${t}` : ""}</span>
        {t ? <span>{pct}%</span> : null}
      </div>
      {t > 0 && (
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-green-600" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
