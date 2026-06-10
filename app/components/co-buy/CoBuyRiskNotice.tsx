// Yellow/red callout for opportunities flagged with elevated or high legal caution.
export default function CoBuyRiskNotice({ level }: { level?: string | null }) {
  if (level !== "elevated" && level !== "high") return null;
  const high = level === "high";
  return (
    <div className={`rounded-2xl border p-4 text-sm ${high ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
      <p className="font-semibold">{high ? "⚠ High legal caution" : "⚠ Extra checks advised"}</p>
      <p className="mt-1">
        This opportunity carries {high ? "high" : "elevated"} legal complexity. Independent lawyer review is essential before any commitment or payment.
      </p>
    </div>
  );
}
