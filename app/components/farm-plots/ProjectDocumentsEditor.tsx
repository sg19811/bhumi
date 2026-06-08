"use client";

export type DraftDoc = { label: string; url: string; doc_type: string };
export const emptyDoc = (): DraftDoc => ({ label: "", url: "", doc_type: "other" });

export const DOC_TYPES: { value: string; label: string }[] = [
  { value: "rera", label: "RERA" },
  { value: "layout_approval", label: "Layout approval" },
  { value: "conversion_order", label: "Conversion order" },
  { value: "brochure", label: "Brochure" },
  { value: "other", label: "Other" },
];

const inp = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600";

// Controlled editor for project document links. Owners paste a link (storage,
// DigiLocker, Drive, etc.) + a label. Saved to project_documents on the edit page.
export default function ProjectDocumentsEditor({ value, onChange }: { value: DraftDoc[]; onChange: (v: DraftDoc[]) => void }) {
  const update = (i: number, patch: Partial<DraftDoc>) => onChange(value.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <section className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Project documents <span className="text-sm font-normal text-gray-400">(optional)</span></h3>
        <button type="button" onClick={() => onChange([...value, emptyDoc()])} className="rounded-full bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800">+ Add link</button>
      </div>
      <p className="-mt-1 text-xs text-gray-500">Paste links to approvals, RERA, conversion order or a brochure. Buyers see these on the listing.</p>

      {value.length === 0 && <p className="text-sm text-gray-400">No documents added.</p>}

      {value.map((d, i) => (
        <div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-[1fr_1.5fr_auto_auto] sm:items-center">
          <input value={d.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label (e.g. Layout sanction)" className={inp} />
          <input value={d.url} onChange={(e) => update(i, { url: e.target.value })} placeholder="https://…" inputMode="url" className={inp} />
          <select value={d.doc_type} onChange={(e) => update(i, { doc_type: e.target.value })} className={inp}>
            {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button type="button" onClick={() => remove(i)} className="rounded-lg px-2 py-2 text-xs text-red-600 hover:bg-red-50">Remove</button>
        </div>
      ))}
    </section>
  );
}
