"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { SERVICE_STATUS_LABELS, COST_COLUMNS, SERVICE_DISCLAIMERS, serviceCategoryLabel } from "@/app/lib/co-buy/services/catalog";
import { formatINR, formatINRShort } from "@/app/lib/format";

type Row = Record<string, unknown> & { id: string };

export default function MemberServiceDetail() {
  const { user, loading } = useAuth();
  const { id, reqId } = useParams<{ id: string; reqId: string }>();
  const [req, setReq] = useState<Record<string, unknown> | null>(null);
  const [quotes, setQuotes] = useState<Row[]>([]);
  const [updates, setUpdates] = useState<Row[]>([]);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!user || !reqId) return;
    (async () => {
      const { data: r } = await supabase.from("co_buy_service_requests").select("*").eq("id", reqId).maybeSingle();
      const [qs, u] = await Promise.all([
        supabase.from("co_buy_service_vendor_quotes").select("*").eq("service_request_id", reqId),
        supabase.from("co_buy_service_updates").select("*").eq("service_request_id", reqId).order("created_at", { ascending: false }),
      ]);
      setReq(r ?? null); setQuotes((qs.data as Row[]) ?? []); setUpdates((u.data as Row[]) ?? []); setFetched(true);
    })();
  }, [user, reqId]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><Link href="/auth/signin" className="text-green-700 hover:underline">Sign in →</Link></main></div>;
  if (fetched && !req) return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><p className="text-gray-500">Service not found.</p></main></div>;

  const approved = req?.approval_status === "circle_approved";

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 sm:px-6">
        <nav className="mb-3 text-sm text-gray-500"><Link href={`/co-buy/circles/${id}/services`} className="hover:text-green-800">Services</Link> / {(req?.title as string) ?? "…"}</nav>
        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">{SERVICE_STATUS_LABELS[req?.status as string] ?? (req?.status as string)}</span>
        <h1 className="mt-2 text-3xl font-bold">{req?.title as string}</h1>
        <p className="mt-1 text-sm text-gray-500">{serviceCategoryLabel(req?.service_category as string)}</p>
        {req?.buyer_visible_summary ? <p className="mt-3 text-gray-700">{req.buyer_visible_summary as string}</p> : null}

        {/* Three-column cost — always broken out */}
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 font-semibold">Estimated cost</h2>
          <div className="space-y-3">
            {COST_COLUMNS.map((c) => (
              <div key={c.key} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-2">
                <div><p className="text-sm font-medium text-gray-800">{c.label}</p><p className="text-xs text-gray-500">{c.explainer}</p></div>
                <p className="shrink-0 text-sm font-semibold text-gray-900">{formatINR((req?.[c.key] as number) ?? 0)}</p>
              </div>
            ))}
            <div className="flex justify-between pt-1 text-sm font-semibold"><span>Estimated total</span><span>{formatINR((req?.estimated_total_cost as number) ?? 0)}</span></div>
          </div>
          {req?.fee_notes ? <p className="mt-2 text-xs text-gray-500">{req.fee_notes as string}</p> : null}
        </section>

        {/* Approval state */}
        <section className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="mb-1 font-semibold">Approval</h2>
          {approved ? <p className="text-sm text-green-800">✓ Approved by the circle. {(req?.approved_by_summary as string) ?? ""}</p>
            : <p className="text-sm text-gray-600">Awaiting the circle&apos;s decision. Discuss in your WhatsApp group; AcrehubIndia records the outcome here. {SERVICE_DISCLAIMERS.noMoneyInPlatform}</p>}
        </section>

        {/* Buyer-visible quotes */}
        {quotes.length > 0 && (
          <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 font-semibold">Vendor quote</h2>
            {quotes.map((qt) => (
              <p key={qt.id} className="text-sm text-gray-700">{(qt.vendor_name_snapshot as string) ?? "Vendor"} — {qt.quote_title as string}: <strong>{formatINRShort(qt.quote_amount as number)}</strong></p>
            ))}
            <p className="mt-2 text-xs text-gray-400">{SERVICE_DISCLAIMERS.vendor}</p>
          </section>
        )}

        {/* Updates */}
        {updates.length > 0 && (
          <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-2 font-semibold">Updates</h2>
            <ul className="space-y-2">
              {updates.map((u) => (
                <li key={u.id} className="text-sm text-gray-700"><span className="font-medium">{u.title as string}</span>{u.body ? ` — ${u.body as string}` : ""} <span className="text-xs text-gray-400">· {u.created_at ? new Date(u.created_at as string).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span></li>
              ))}
            </ul>
          </section>
        )}

        {/* Disclaimers */}
        <div className="mt-6 space-y-2 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-xs text-gray-500">
          <p>{SERVICE_DISCLAIMERS.perRequest}</p>
          <p>{SERVICE_DISCLAIMERS.governmentFees}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
