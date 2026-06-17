// Public verification panel shown on a listing when a government land record is
// linked. Owner names from official records are public; owner PHONE numbers from
// the inbox are never rendered here (this component only receives record fields).

type LandRecord = {
  source: string;
  retrieved_at: string;
  owners: { name: string; percentage?: number }[] | null;
  extent_value: number | null;
  extent_unit: string | null;
  classification: string | null;
  fmb_sketch_url: string | null;
  encumbrance_status: string | null;
};

const SOURCE_LABELS: Record<string, string> = {
  manual: "AcrehubIndia (manual verification)",
  landeed: "Landeed",
  tamilnilam: "TamilNilam (Tamil Nadu)",
  bhoomi: "Bhoomi (Karnataka)",
  dharani: "Dharani (Telangana)",
  meebhoomi: "Meebhoomi (Andhra Pradesh)",
  mahabhulekh: "Mahabhulekh (Maharashtra)",
  relis: "ReLIS (Kerala)",
  other: "official record",
};

export default function LandRecordViewer({ record }: { record: LandRecord }) {
  const owners = Array.isArray(record.owners) ? record.owners : [];
  const source = SOURCE_LABELS[record.source] ?? record.source;
  const date = new Date(record.retrieved_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-green-700 px-3 py-1 text-sm font-semibold text-white">✓ Verified via {source}</p>
      <p className="mt-2 text-xs text-green-800">Cross-checked against the official land record on {date}.</p>

      <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        {owners.length > 0 && (
          <div className="sm:col-span-2"><dt className="text-gray-500">Recorded owner(s)</dt><dd className="font-medium text-gray-800">{owners.map((o) => o.name + (o.percentage ? ` (${o.percentage}%)` : "")).join(", ")}</dd></div>
        )}
        {record.extent_value != null && <div><dt className="text-gray-500">Extent on record</dt><dd className="font-medium text-gray-800">{record.extent_value} {record.extent_unit}</dd></div>}
        {record.classification && <div><dt className="text-gray-500">Classification</dt><dd className="font-medium text-gray-800">{record.classification}</dd></div>}
        {record.encumbrance_status && <div><dt className="text-gray-500">Encumbrance</dt><dd className="font-medium text-gray-800 capitalize">{record.encumbrance_status.replace(/_/g, " ")}</dd></div>}
      </dl>

      {record.fmb_sketch_url && (
        <a href={record.fmb_sketch_url} target="_blank" rel="noopener noreferrer" className="mt-4 block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={record.fmb_sketch_url} alt="Field Measurement Book sketch" className="max-h-64 rounded-lg border border-green-200 object-contain" />
        </a>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Government land record data shown is for informational purposes. It reflects the official record at the time of fetch and may have changed. Always verify directly with the relevant Taluk office before any transaction.
      </p>
    </div>
  );
}
