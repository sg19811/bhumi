"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { CITIES } from "@/app/lib/farm-plots/cities";
import { CORRIDORS } from "@/app/lib/farm-plots/corridors";

const inp = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

export default function NewResale() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setBusy(true); setError("");
    const f = new FormData(e.currentTarget);
    const phone = String(f.get("contact_phone") || "").trim();
    if (!phone) { setError("A contact number is required."); setBusy(false); return; }
    const num = (k: string) => { const v = f.get(k); return v != null && v !== "" ? Number(v) : null; };
    const str = (k: string) => { const v = f.get(k); return v != null && v !== "" ? String(v) : null; };
    const row = {
      owner_user_id: user.id,
      project_name: str("project_name"),
      nearest_city: str("nearest_city"),
      corridor: str("corridor"),
      plot_size_value: num("plot_size_value"),
      plot_size_unit: str("plot_size_unit"),
      price: num("price"),
      contact_name: str("contact_name"),
      contact_phone: phone,
      notes: str("notes"),
    };
    const { error: dbError } = await supabase.from("plot_resales").insert(row);
    if (dbError) { setError(dbError.message || "Couldn't post your resale. Please try again."); setBusy(false); return; }
    router.push("/farm-plots/resale");
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">List your plot for resale</h1>
          <p className="mb-8 text-gray-500">Sign in to post a plot you want to resell.</p>
          <Link href="/auth/signin" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">Sign in</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <nav className="mb-4 flex items-center gap-1.5 text-sm text-gray-500">
          <Link href="/farm-plots/resale" className="hover:text-green-800">Resale</Link>
          <span className="text-gray-300">/</span><span className="text-gray-400">List a plot</span>
        </nav>
        <h1 className="text-2xl font-bold">List your plot for resale</h1>
        <p className="mt-1 text-sm text-gray-500">Resell a plot you own in a farm-plot project. Buyers contact you directly.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div><label className="mb-1 block text-sm font-medium">Project name</label>
            <input name="project_name" placeholder="e.g. Green Acres Phase 1" className={inp} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">City</label>
              <select name="nearest_city" defaultValue="bangalore" className={inp}>
                {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select></div>
            <div><label className="mb-1 block text-sm font-medium">Corridor (optional)</label>
              <select name="corridor" defaultValue="" className={inp}>
                <option value="">—</option>
                {CORRIDORS.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Plot size</label>
              <input name="plot_size_value" type="number" min="0" step="0.01" className={inp} /></div>
            <div><label className="mb-1 block text-sm font-medium">Unit</label>
              <select name="plot_size_unit" defaultValue="sqft" className={inp}>
                <option value="sqft">sq ft</option><option value="guntha">guntha</option><option value="cent">cent</option><option value="acre">acre</option>
              </select></div>
            <div><label className="mb-1 block text-sm font-medium">Price (₹)</label>
              <input name="price" type="number" min="0" className={inp} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Your name</label>
              <input name="contact_name" className={inp} /></div>
            <div><label className="mb-1 block text-sm font-medium">Phone *</label>
              <input name="contact_phone" required inputMode="tel" className={inp} /></div>
          </div>
          <div><label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea name="notes" rows={3} placeholder="Why selling, plot number, dues cleared, etc." className={inp} /></div>

          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div className="flex gap-3">
            <button type="submit" disabled={busy} className="flex-1 rounded-full bg-green-700 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Posting…" : "Post resale"}</button>
            <Link href="/farm-plots/resale" className="rounded-full border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
          </div>
          <p className="text-xs text-gray-400">By posting you confirm you own this plot and the details are accurate. AcreHub doesn&apos;t verify resale posts.</p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
