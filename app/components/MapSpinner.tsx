// Loading placeholder shown while the (dynamically imported, client-only) map
// chunk downloads — a spinner instead of plain text, and it fills its container.
export default function MapSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100" role="status" aria-label="Loading map">
      <div className="flex flex-col items-center gap-2">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-green-600" aria-hidden="true" />
        <span className="text-sm text-gray-500">Loading map…</span>
      </div>
    </div>
  );
}
