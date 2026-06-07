"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabase";

export default function VideoUpload({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setErr("");
    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("video/")) {
        setErr("Please upload video files only.");
        continue;
      }
      const path = `videos/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const { error } = await supabase.storage.from("Listings").upload(path, file);
      if (error) {
        setErr(error.message);
        continue;
      }
      const { data } = supabase.storage.from("Listings").getPublicUrl(path);
      newUrls.push(data.publicUrl);
    }

    onChange([...value, ...newUrls]);
    setUploading(false);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={i} className="relative w-40 overflow-hidden rounded-lg border border-gray-200">
            <video src={url} className="h-24 w-full object-cover" muted playsInline />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
              aria-label="Remove video"
            >
              ✕
            </button>
          </div>
        ))}
        <label className="flex h-24 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-400 hover:border-green-600 hover:text-green-600">
          <span className="text-2xl leading-none">+</span>
          Add video
          <input type="file" accept="video/*" multiple onChange={handleFiles} className="hidden" />
        </label>
      </div>
      {uploading && <p className="text-sm text-gray-400">Uploading… large videos may take a while.</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <p className="text-xs text-gray-400">Short clips (a walk-through of the land) work best.</p>
    </div>
  );
}
