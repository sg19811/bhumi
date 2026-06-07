const BADGES = [
  { icon: "⚖️", label: "Lawyer-reviewed content" },
  { icon: "🗺️", label: "State-wise rules" },
  { icon: "🔒", label: "Your data stays private" },
  { icon: "🤝", label: "No bait-and-switch" },
];

export default function TrustBadgesRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600">
      {BADGES.map((b) => (
        <span key={b.label} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true">{b.icon}</span> {b.label}
        </span>
      ))}
    </div>
  );
}
