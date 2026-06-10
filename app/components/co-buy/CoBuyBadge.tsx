export default function CoBuyBadge({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 ${className}`}>
      👥 Buying Circle
    </span>
  );
}
