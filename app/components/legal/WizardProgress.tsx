export default function WizardProgress({ steps, current }: { steps: string[]; current: number }) {
  const pct = Math.round(((current + 1) / steps.length) * 100);
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium text-green-800">{steps[current]}</span>
        <span>Step {current + 1} of {steps.length}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-green-600 transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
