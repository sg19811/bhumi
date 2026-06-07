import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import Link from "next/link";
import Header from "@/app/components/Header";

export default async function Requirements() {
  const { data: requirements } = await db
    .from("buyer_interests")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Buyer requirements</h1>
            <p className="text-gray-500">{requirements?.length ?? 0} active requirements</p>
          </div>
          <Link href="/buy" className="shrink-0 rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800">
            + Post requirement
          </Link>
        </div>

        {(!requirements || requirements.length === 0) && (
          <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center">
            <p className="mb-4 text-lg text-gray-400">No buyer requirements posted yet.</p>
            <Link href="/buy" className="inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-800">
              Post what you want to buy
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {requirements?.map((req) => (
            <div key={req.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium mb-2">
                    {req.intent?.replace(/_/g, " ") ?? "General"}
                  </span>
                  <h2 className="font-semibold text-lg">
                    Looking for land in {[req.preferred_taluka, req.preferred_district].filter(Boolean).join(", ") || "any location"}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                {(req.budget_min || req.budget_max) && (
                  <span>💰 ₹{req.budget_min?.toLocaleString("en-IN") ?? "0"} – ₹{req.budget_max?.toLocaleString("en-IN") ?? "any"}</span>
                )}
                {(req.acreage_min || req.acreage_max) && (
                  <span>📐 {req.acreage_min ?? "0"} – {req.acreage_max ?? "any"} acres</span>
                )}
                {req.irrigation_pref && <span>💧 {req.irrigation_pref}</span>}
              </div>

              {req.land_types?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {req.land_types.map((t: string) => (
                    <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{t.replace(/_/g, " ")}</span>
                  ))}
                </div>
              )}

              {req.notes && <p className="text-sm text-gray-500">{req.notes}</p>}

              <p className="text-xs text-gray-400 mt-3">
                Posted {new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
