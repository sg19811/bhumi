"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

type Collection = { id: string; name: string };

export default function AddToCollection({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [memberOf, setMemberOf] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    if (!user) return;
    const { data: cols } = await supabase
      .from("collections")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setCollections(cols ?? []);
    const { data: mem } = await supabase
      .from("collection_listings")
      .select("collection_id")
      .eq("listing_id", listingId);
    setMemberOf(new Set((mem ?? []).map((m: { collection_id: string }) => m.collection_id)));
  }

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function toggleOpen() {
    if (!user) {
      router.push("/auth/signin");
      return;
    }
    setOpen((o) => !o);
  }

  async function toggle(colId: string) {
    setBusy(true);
    if (memberOf.has(colId)) {
      await supabase.from("collection_listings").delete().eq("collection_id", colId).eq("listing_id", listingId);
      const next = new Set(memberOf);
      next.delete(colId);
      setMemberOf(next);
    } else {
      await supabase.from("collection_listings").insert({ collection_id: colId, listing_id: listingId });
      setMemberOf(new Set(memberOf).add(colId));
    }
    setBusy(false);
  }

  async function create() {
    const name = newName.trim();
    if (!name || !user) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("collections")
      .insert({ user_id: user.id, name })
      .select("id, name")
      .single();
    if (!error && data) {
      await supabase.from("collection_listings").insert({ collection_id: data.id, listing_id: listingId });
      setNewName("");
      await load();
    }
    setBusy(false);
  }

  const count = memberOf.size;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-800"
      >
        {count > 0 ? `✦ In ${count} collection${count > 1 ? "s" : ""}` : "✦ Save to collection"}
      </button>

      {open && (
        <div className="absolute bottom-full z-30 mb-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-gray-400">Your collections</p>
          <div className="max-h-52 space-y-0.5 overflow-y-auto">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                disabled={busy}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                <span className="truncate text-gray-700">{c.name}</span>
                {memberOf.has(c.id) && <span className="shrink-0 font-semibold text-green-700">✓</span>}
              </button>
            ))}
            {collections.length === 0 && (
              <p className="px-2 py-2 text-sm text-gray-400">No collections yet — create one below.</p>
            )}
          </div>
          <div className="mt-2 flex gap-2 border-t border-gray-200 pt-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="New collection name"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-green-600"
            />
            <button
              onClick={create}
              disabled={busy || !newName.trim()}
              className="shrink-0 rounded-lg bg-green-700 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
