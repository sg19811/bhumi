"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { DOC_TYPES } from "@/app/components/farm-plots/ProjectDocumentsEditor";

type Doc = { id: string; label: string; url: string; doc_type?: string | null };
const typeLabel = (t?: string | null) => DOC_TYPES.find((x) => x.value === t)?.label ?? "Document";

// Buyer-facing document links for a project. Reads project_documents (RLS:
// public-read on active listings). Renders nothing if there are none / table missing.
export default function ProjectDocuments({ listingId }: { listingId: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let on = true;
    supabase
      .from("project_documents")
      .select("id,label,url,doc_type")
      .eq("listing_id", listingId)
      .then(({ data, error }) => {
        if (!on) return;
        if (!error && Array.isArray(data)) setDocs(data as Doc[]);
        setLoaded(true);
      });
    return () => { on = false; };
  }, [listingId]);

  if (!loaded || docs.length === 0) return null;

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Documents</h2>
      <p className="mt-1 text-sm text-gray-500">Shared by the developer. Verify originals independently — a shared link is not proof of validity.</p>
      <ul className="mt-3 divide-y divide-gray-100">
        {docs.map((d) => (
          <li key={d.id}>
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-green-800">
              <span className="truncate"><span className="font-medium text-gray-800">{d.label}</span> <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{typeLabel(d.doc_type)}</span></span>
              <span className="shrink-0 text-gray-400">Open →</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
