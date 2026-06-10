"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabase";
import { CO_BUY_INTEREST_STATUS_LABELS, type CoBuyInterestStatus } from "@/app/lib/co-buy/types";
import { formatINRShort } from "@/app/lib/format";
import { serviceCategoryLabel } from "@/app/lib/co-buy/service-categories";
import { addMemberFromInterest } from "@/app/lib/co-buy/circles/circle-actions";

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return v ? (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-1.5 text-sm">
      <span className="text-gray-500">{k}</span>
      <span className="text-right font-medium text-gray-800">{v}</span>
    </div>
  ) : null;
}

// Inline panel to view + qualify a single lead.
export default function AdminCoBuyLeadDrawer({
  lead,
  onClose,
  onSaved,
}: {
  lead: Record<string, unknown> & { id: string };
  onClose: () => void;
  onSaved: (id: string, status: string, notes: string) => void;
}) {
  const [status, setStatus] = useState<CoBuyInterestStatus>((lead.status as CoBuyInterestStatus) ?? "new");
  const [notes, setNotes] = useState((lead.qualification_notes as string) ?? "");
  const [busy, setBusy] = useState(false);
  const [circles, setCircles] = useState<{ id: string; name: string }[]>([]);
  const [circleMsg, setCircleMsg] = useState("");

  const oppId = lead.opportunity_id as string | undefined;
  useEffect(() => {
    if (!oppId) return;
    supabase.from("co_buy_circles").select("id, name").eq("opportunity_id", oppId).in("status", ["forming", "threshold_pending"])
      .then(({ data }) => setCircles((data as { id: string; name: string }[]) ?? []));
  }, [oppId]);

  const memberPayload = { interest_id: lead.id, display_name: lead.city ? `${lead.name}, ${lead.city}` : String(lead.name), desired_share_label: (lead.desired_share_label as string) ?? null, soft_commitment_amount: (lead.desired_contribution as number) ?? null, user_id: (lead.user_id as string) ?? null };
  async function addToCircle(circleId: string) {
    setBusy(true);
    const res = await addMemberFromInterest(circleId, memberPayload);
    setBusy(false);
    if (res.ok) { setCircleMsg("✓ Added to circle."); onSaved(lead.id, "added_to_circle", notes); } else { setCircleMsg(res.error ?? "Failed."); }
  }

  const digits = String(lead.phone ?? "").replace(/\D/g, "");
  const wa = digits.length >= 10 ? `91${digits.slice(-10)}` : digits;
  const msg = encodeURIComponent(`Hi ${lead.name ?? ""}, this is AcrehubIndia about your Buying Circle interest.`);

  async function save() {
    setBusy(true);
    await supabase.from("co_buy_interests").update({ status, qualification_notes: notes || null, updated_at: new Date().toISOString() }).eq("id", lead.id);
    setBusy(false);
    onSaved(lead.id, status, notes);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">{String(lead.name)}</h2>
            <p className="text-sm text-gray-500">{String(lead.phone)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100">✕</button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {wa && <a href={`https://wa.me/${wa}?text=${msg}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white">💬 WhatsApp</a>}
          {digits && <a href={`tel:+${wa}`} className="rounded-full border border-green-700 px-4 py-2 text-sm font-medium text-green-800">📞 Call</a>}
        </div>

        <div className="mb-4">
          <Row k="Buyer type" v={String(lead.buyer_type ?? "—")} />
          <Row k="City" v={lead.city as string} />
          <Row k="Email" v={lead.email as string} />
          <Row k="WhatsApp" v={lead.whatsapp as string} />
          <Row k="Budget" v={lead.budget_min || lead.budget_max ? `${lead.budget_min ? formatINRShort(lead.budget_min as number) : "?"} – ${lead.budget_max ? formatINRShort(lead.budget_max as number) : "?"}` : null} />
          <Row k="Desired share" v={lead.desired_share_label as string} />
          <Row k="Timeline" v={lead.timeline as string} />
          <Row k="Co-ownership" v={lead.coownership_comfort as string} />
          <Row k="Purpose" v={Array.isArray(lead.purpose) ? (lead.purpose as string[]).join(", ") : null} />
          <Row k="Site visit" v={lead.site_visit_interest ? "Yes" : null} />
          <Row k="Services" v={Array.isArray(lead.service_interests) && (lead.service_interests as string[]).length ? (lead.service_interests as string[]).map(serviceCategoryLabel).join(", ") : null} />
          <Row k="Call time" v={lead.preferred_call_time as string} />
          <Row k="Notes (buyer)" v={lead.notes as string} />
        </div>

        {oppId && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3">
            <p className="mb-2 text-sm font-semibold text-green-900">Add to a circle</p>
            <div className="flex flex-wrap gap-2">
              {circles.map((c) => (
                <button key={c.id} onClick={() => addToCircle(c.id)} disabled={busy} className="rounded-full bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-800 disabled:opacity-50">+ {c.name}</button>
              ))}
              <Link href={`/admin/co-buy/circles/new?opportunity_id=${oppId}&interest_id=${lead.id}`} className="rounded-full border border-green-700 px-3 py-1.5 text-xs font-medium text-green-800 hover:bg-green-100">+ New circle</Link>
            </div>
            {circleMsg && <p className="mt-2 text-xs text-green-800">{circleMsg}</p>}
          </div>
        )}

        <label className="mb-3 block text-sm font-medium text-gray-700">Status
          <select value={status} onChange={(e) => setStatus(e.target.value as CoBuyInterestStatus)} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm">
            {Object.entries(CO_BUY_INTEREST_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </label>
        <label className="mb-4 block text-sm font-medium text-gray-700">Qualification notes (admin)
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm" />
        </label>
        <button onClick={save} disabled={busy} className="w-full rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">{busy ? "Saving…" : "Save"}</button>
      </div>
    </div>
  );
}
