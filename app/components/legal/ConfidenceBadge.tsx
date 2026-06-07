export default function ConfidenceBadge({ confidence }: { confidence: number }) {
  const tone = confidence >= 70 ? "text-green-800 bg-green-100" : confidence >= 40 ? "text-amber-800 bg-amber-100" : "text-gray-600 bg-gray-100";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${tone}`}>
      <span aria-hidden="true">◷</span> {confidence}% confidence
    </span>
  );
}
