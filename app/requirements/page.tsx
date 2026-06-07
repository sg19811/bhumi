import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import RequirementFilters from "@/app/components/RequirementFilters";
import { formatINRShort } from "@/app/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buyer requirements — who's looking for land — Bhūmi",
  description: "Browse what buyers are looking for and reach them directly. Filter by district, land type, and budget.",
};

export default async function Requirements({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const sp = await searchParams;

  let query = db.from("buyer_interests").select("*").eq("status", "active");
  if (sp.district) query = query.ilike("preferred_district", `%${sp.district}%`);
  if (sp.land_type) query = query.contains("land_types", [sp.land_type]);
  const sort = sp.sort === "budget" ? { col: "budget_max", asc: false } : { col: "created_at", asc: false };
  query = query.order(sort.col, { ascending: sort.asc, nullsFirst: false });

  const { data: requirements } = await query;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Buyer requirements</h1>
            <p className="text-gray-500">{requirements?.length ?? 0} active {requirements?.length === 1 ? "buyer" : "buyers"} looking for land</p>
          </div>
          <Link href="/buy" className="shrink-0 rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800">
            + Post requirement
          </Link>
        </div>

        <RequirementFilters />

        {(!requirements || requirements.length === 0) && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center">
            <p className="mb-4 text-lg text-gray-400">No requirements match — try clearing filters.</p>
            <Link href="/buy" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">
              Post what you want to buy
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {requirements?.map((req) => {
            const wa = req.contact_whatsapp || req.contact_phone;
            return (
              <div key={req.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <span className="mb-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium capitalize text-green-800">
                  {req.intent?.replace(/_/g, " ") ?? "General"}
                </span>
                <h2 className="text-lg font-semibold">
                  Looking for land in {[req.preferred_taluka, req.preferred_district].filter(Boolean).join(", ") || "any location"}
                </h2>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                  {(req.budget_min || req.budget_max) && (
                    <span>💰 {req.budget_min ? formatINRShort(req.budget_min) : "₹0"} – {req.budget_max ? formatINRShort(req.budget_max) : "any"}</span>
                  )}
                  {(req.acreage_min || req.acreage_max) && (
                    <span>📐 {req.acreage_min ?? "0"} – {req.acreage_max ?? "any"} acres</span>
                  )}
                  {req.irrigation_pref && <span>💧 {req.irrigation_pref}</span>}
                </div>

                {req.land_types?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {req.land_types.map((t: string) => (
                      <span key={t} className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{t.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                )}

                {req.notes && <p className="mt-3 text-sm text-gray-500">{req.notes}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                  {req.contact_phone && (
                    <a href={`tel:${req.contact_phone}`} className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-green-600 hover:text-green-800">
                      📞 Call buyer
                    </a>
                  )}
                  {wa && (
                    <a href={`https://wa.me/91${wa}?text=${encodeURIComponent("Hi, I saw your land requirement on Bhūmi and may have land that matches.")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-green-800">
                      💬 WhatsApp
                    </a>
                  )}
                  <span className="ml-auto text-xs text-gray-400">
                    Posted {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
