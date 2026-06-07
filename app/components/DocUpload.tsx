"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

// Uploads to the PRIVATE "verification" bucket and tracks storage paths
// (not public URLs). Documents are only readable by admins via signed URLs.
export default function DocUpload({ value, onChange }: { value: string[]; onChange: (paths: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setErr("");
    const paths: string[] = [];
    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const { error } = await supabase.storage.from("verification").upload(path, file);
      if (error) { setErr(error.message); continue; }
      paths.push(path);
    }
    onChange([...value, ...paths]);
    setUploading(false);
  }

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 space-y-1">
          {value.map((p, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm">
              <span className="truncate text-gray-700">📄 {p.split("-").slice(2).join("-") || p}</span>
              <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="ml-2 text-xs text-gray-400 hover:text-red-600" aria-label="Remove document">✕</button>
            </li>
          ))}
        </ul>
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-green-600 hover:text-green-800">
        + Add document
        <input type="file" accept="image/*,application/pdf" multiple onChange={handleFiles} className="hidden" />
      </label>
      {uploading && <p className="mt-2 text-sm text-gray-400">Uploading…</p>}
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
