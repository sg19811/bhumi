"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function PhotoUpload({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setErr("");
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const { error } = await supabase.storage.from("listings").upload(path, file);
      if (error) { setErr(error.message); continue; }
      const { data } = supabase.storage.from("listings").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    onChange([...value, ...newUrls]);
    setUploading(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {value.map((url, i) => (
          <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs">✕</button>
          </div>
        ))}
        <label className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer text-gray-400 hover:border-green-600 hover:text-green-600 text-3xl">
          +
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </label>
      </div>
      {uploading && <p className="text-sm text-gray-400">Uploading...</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
