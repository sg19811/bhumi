"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

type Collection = { id: string; name: string; collection_listings: { count: number }[] };

export default function CollectionsPage() {
  const { user, loading } = useAuth();
  const [cols, setCols] = useState<Collection[]>([]);
  const [fetched, setFetched] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!user) return;
    const { data } = await supabase
      .from("collections")
      .select("id, name, collection_listings(count)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setCols((data as Collection[]) ?? []);
    setFetched(true);
  }

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function create() {
    const name = newName.trim();
    if (!name || !user) return;
    setBusy(true);
    await supabase.from("collections").insert({ user_id: user.id, name });
    setNewName("");
    await load();
    setBusy(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this collection? The listings themselves are not deleted.")) return;
    setBusy(true);
    await supabase.from("collections").delete().eq("id", id);
    await load();
    setBusy(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6">
        <h1 className="mb-6 text-3xl font-bold">Collections</h1>

        {!user && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
            <p className="mb-4 text-gray-500">Sign in to create collections and organize land you like.</p>
            <Link href="/auth/signin" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">Sign in</Link>
          </div>
        )}

        {user && (
          <>
            <div className="mb-8 flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
                placeholder="New collection (e.g. Near Mysuru, Under ₹50L)"
                className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15"
              />
              <button
                onClick={create}
                disabled={busy || !newName.trim()}
                className="shrink-0 rounded-full bg-green-700 px-5 py-2.5 font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
              >
                Create
              </button>
            </div>

            {fetched && cols.length === 0 && (
              <p className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-gray-500">
                No collections yet. Create one above, then add listings with “✦ Save to collection”.
              </p>
            )}

            <div className="space-y-3">
              {cols.map((c) => {
                const n = c.collection_listings?.[0]?.count ?? 0;
                return (
                  <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                    <Link href={`/collections/${c.id}`} className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-gray-900">{c.name}</span>
                      <span className="text-sm text-gray-500">{n} {n === 1 ? "listing" : "listings"}</span>
                    </Link>
                    <button onClick={() => remove(c.id)} disabled={busy} className="shrink-0 text-sm text-gray-400 hover:text-red-600">Delete</button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
