"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { PROJECT_LAND_TYPES } from "@/app/lib/farm-plots/types";
import { getTier } from "@/app/lib/farm-plots/verification";
import { formatINRShort } from "@/app/lib/format";

const SV_STATUSES = ["new", "contacted", "scheduled", "done", "cancelled"];

const tierBadge = (v?: string | null) => {
  const t = getTier(v);
  return t.value === "unverified" ? null : <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.style}`}>🛡️ {t.short}</span>;
};

export default function DeveloperDashboard() {
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: ls } = await supabase
        .from("listings")
        .select("*")
        .eq("owner_user_id", user.id)
        .in("land_type", PROJECT_LAND_TYPES)
        .order("created_at", { ascending: false });
      const list = ls ?? [];
      setProjects(list);
      const ids = list.map((l) => l.id);
      if (ids.length) {
        const [{ data: sv }, { data: inq }] = await Promise.all([
          supabase.from("site_visit_requests").select("*").in("listing_id", ids).order("created_at", { ascending: false }),
          supabase.from("inquiries").select("*").in("listing_id", ids).order("created_at", { ascending: false }),
        ]);
        setVisits(sv ?? []);
        setInquiries(inq ?? []);
      }
      setFetched(true);
    })();
  }, [user]);

  async function setVisitStatus(id: string, status: string) {
    await supabase.from("site_visit_requests").update({ status }).eq("id", id);
    setVisits((cur) => cur.map((v) => (v.id === id ? { ...v, status } : v)));
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Developer dashboard</h1>
          <p className="mb-8 text-gray-500">Sign in to manage your farm-plot projects and the leads on them.</p>
          <Link href="/auth/signin" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">Sign in</Link>
        </main>
      </div>
    );
  }

  const visitsByListing = (id: string) => visits.filter((v) => v.listing_id === id);
  const inqByListing = (id: string) => inquiries.filter((q) => q.listing_id === id);
  const openVisits = visits.filter((v) => v.status === "new" || v.status === "contacted");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Developer dashboard</h1>
            <p className="text-sm text-gray-500">Your farm-plot projects and their leads.</p>
          </div>
          <Link href="/listing/new" className="rounded-full bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800">+ New project</Link>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm"><p className="text-2xl font-bold text-green-700">{projects.length}</p><p className="text-xs text-gray-500">Projects</p></div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm"><p className="text-2xl font-bold text-green-700">{visits.length}</p><p className="text-xs text-gray-500">Site-visit requests</p></div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm"><p className="text-2xl font-bold text-amber-600">{openVisits.length}</p><p className="text-xs text-gray-500">Open leads</p></div>
        </div>

        {!fetched ? (
          <p className="text-gray-400">Loading your projects…</p>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-14 text-center text-gray-500">
            You haven&apos;t listed a farm-plot project yet.{" "}
            <Link href="/listing/new" className="font-medium text-green-800 hover:underline">List your first project →</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {projects.map((p) => {
              const svs = visitsByListing(p.id);
              return (
                <section key={p.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/listing/${p.id}`} className="font-semibold hover:text-green-800">{p.project_name || p.title}</Link>
                        {tierBadge(p.verification_tier)}
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{p.status}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatINRShort(p.price)} · {svs.length} visit{svs.length === 1 ? "" : "s"} · {inqByListing(p.id).length} inquir{inqByListing(p.id).length === 1 ? "y" : "ies"}
                      </p>
                    </div>
                    <Link href={`/listing/${p.id}/edit`} className="shrink-0 rounded-full border border-gray-300 px-4 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Edit</Link>
                  </div>

                  {svs.length > 0 && (
                    <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
                      {svs.map((v) => (
                        <div key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                          <span className="min-w-0">
                            <span className="font-medium">{v.name || "Someone"}</span> · <a href={`tel:${v.contact_phone}`} className="text-green-700 hover:underline">{v.contact_phone}</a>
                            {v.preferred_date ? <span className="text-gray-400"> · prefers {new Date(v.preferred_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span> : null}
                            {v.notes ? <span className="block text-xs text-gray-500">“{v.notes}”</span> : null}
                          </span>
                          <select value={v.status ?? "new"} onChange={(e) => setVisitStatus(v.id, e.target.value)} className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-xs">
                            {SV_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
