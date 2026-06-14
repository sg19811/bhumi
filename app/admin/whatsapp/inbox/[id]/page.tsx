"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import type { WhatsAppInboxRow, ParsedSubmission, ParsedListing, DuplicateCheckResult, BuyerMatchResult } from "@/app/lib/agent-types";
import PublishDraft from "@/app/components/admin/whatsapp/PublishDraft";

type AgentCtx = {
  id: string;
  name: string;
  district: string | null;
  taluka: string | null;
  land_types_handled: string[] | null;
  observed_primary_district: string | null;
  observed_primary_taluka: string | null;
  observed_price_min_per_acre: number | null;
  observed_price_max_per_acre: number | null;
  trust_tier: number | null;
};
type Row = WhatsAppInboxRow & { agent: AgentCtx | null };

function ParsedView({ payload }: { payload: ParsedSubmission }) {
  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs text-gray-500">Intent: <span className="font-medium text-gray-700">{payload.intent}</span></p>
      {payload.status_update_details && (
        <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">{payload.status_update_details}</p>
      )}
      {payload.listings?.map((l: ParsedListing, i: number) => (
        <div key={i} className="rounded-xl border border-gray-200 p-3 text-sm">
          <p className="font-medium text-gray-800">
            {l.acreage ?? "?"} {l.acreage_unit} · {l.land_type?.replace(/_/g, " ")}
          </p>
          <p className="text-gray-600">
            {[l.location?.village_or_landmark, l.location?.taluka, l.location?.district, l.location?.state].filter(Boolean).join(", ") || "location unknown"}
            {l.location?.survey_number ? ` · S.No ${l.location.survey_number}` : ""}
          </p>
          <p className="text-gray-600">
            {l.price?.total_inr ? `₹${l.price.total_inr.toLocaleString("en-IN")} total` : ""}
            {l.price?.per_acre_inr ? `${l.price.total_inr ? " · " : ""}₹${l.price.per_acre_inr.toLocaleString("en-IN")}/acre` : ""}
            {!l.price?.total_inr && !l.price?.per_acre_inr ? "price unknown" : ""}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            water: {l.features?.water} · road: {l.features?.road_access} · title: {l.features?.title_status} · conversion: {l.features?.conversion_status}
          </p>
          {l.missing_critical_fields?.length > 0 && (
            <p className="mt-1 text-xs text-red-600">Missing: {l.missing_critical_fields.join(", ")}</p>
          )}
          {l.clarification_questions?.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-xs text-gray-500">
              {l.clarification_questions.map((q: string, qi: number) => <li key={qi}>{q}</li>)}
            </ul>
          )}
          {l.agent_notes_to_admin && <p className="mt-1 text-xs italic text-gray-500">Note: {l.agent_notes_to_admin}</p>}
        </div>
      ))}
    </div>
  );
}

export default function InboxDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [row, setRow] = useState<Row | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseErr, setParseErr] = useState("");
  const [intel, setIntel] = useState<{ dup: DuplicateCheckResult; matches: BuyerMatchResult[] } | null>(null);
  const [intelLoading, setIntelLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin || !id) return;
    supabase
      .from("whatsapp_inbox")
      .select("*, agent:agent_profiles(id, name, district, taluka, land_types_handled, observed_primary_district, observed_primary_taluka, observed_price_min_per_acre, observed_price_max_per_acre, trust_tier)")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => (data ? setRow(data as Row) : setNotFound(true)));
  }, [isAdmin, id]);

  async function setStatus(processed_status: string) {
    await supabase.from("whatsapp_inbox").update({ processed_status }).eq("id", id);
    setRow((cur) => (cur ? { ...cur, processed_status: processed_status as Row["processed_status"] } : cur));
  }

  async function runParse() {
    if (!row) return;
    setParsing(true);
    setParseErr("");

    // Message text + any voice transcript appended in [brackets] (the parser expects this).
    const text = row.voice_transcript ? `${row.raw_message}\n\n[${row.voice_transcript}]` : row.raw_message;

    const a = row.agent;
    const agent_context = a
      ? {
          name: a.name,
          primary_district: a.observed_primary_district ?? a.district ?? undefined,
          primary_taluka: a.observed_primary_taluka ?? a.taluka ?? undefined,
          land_types_handled: a.land_types_handled ?? undefined,
          observed_price_min_per_acre: a.observed_price_min_per_acre ?? undefined,
          observed_price_max_per_acre: a.observed_price_max_per_acre ?? undefined,
          trust_tier: a.trust_tier ?? undefined,
        }
      : undefined;

    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch("/api/whatsapp/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({ text, agent_context }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setParseErr(d?.error?.message || "Parsing failed. Please try again.");
      setParsing(false);
      return;
    }

    const { parsed, confidence, cost_inr } = await res.json();
    const first: ParsedListing | undefined = parsed?.listings?.[0];
    const updates = {
      parsed_payload: parsed,
      parsing_status: "parsed",
      parsing_confidence: confidence,
      parsing_cost_inr: cost_inr,
      missing_critical_fields: first?.missing_critical_fields ?? [],
      clarification_questions: first?.clarification_questions ?? [],
      processed_status: row.processed_status === "inbox" ? "in_progress" : row.processed_status,
    };
    await supabase.from("whatsapp_inbox").update(updates).eq("id", id);
    setRow((cur) => (cur ? ({ ...cur, ...updates } as Row) : cur));
    setParsing(false);
  }

  async function runIntel() {
    const first = row?.parsed_payload?.listings?.[0];
    if (!first) return;
    setIntelLoading(true);

    const loc = first.location ?? ({} as ParsedListing["location"]);
    const perAcre =
      first.price?.per_acre_inr ??
      (first.price?.total_inr && first.acreage ? Math.round(first.price.total_inr / first.acreage) : null);

    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;

    const [dupRes, matchRes] = await Promise.all([
      fetch("/api/duplicates/check", {
        method: "POST",
        headers,
        body: JSON.stringify({
          district: loc.district, taluka: loc.taluka, village: loc.village_or_landmark,
          survey_number: loc.survey_number, latitude: row?.location_lat ?? null, longitude: row?.location_lng ?? null,
          description: first.raw_description,
        }),
      }).then((r) => (r.ok ? r.json() : null)),
      fetch("/api/matching/buyers", {
        method: "POST",
        headers,
        body: JSON.stringify({
          listing_draft: { district: loc.district, taluka: loc.taluka, land_type: first.land_type, acreage: first.acreage ?? 0, price_per_acre: perAcre },
          limit: 5,
        }),
      }).then((r) => (r.ok ? r.json() : null)),
    ]);

    const dup: DuplicateCheckResult = dupRes ?? { is_duplicate_suspected: false, matched_listing_id: null, match_type: null, similarity_score: 0, evidence: "Check failed" };
    const matches: BuyerMatchResult[] = matchRes?.matches ?? [];
    setIntel({ dup, matches });

    const updates = {
      duplicate_check_status: dup.is_duplicate_suspected ? "duplicate_suspected" : "clean",
      duplicate_of_listing_id: dup.matched_listing_id,
      similarity_score: dup.similarity_score,
      matched_buyer_requirements: matches,
    };
    await supabase.from("whatsapp_inbox").update(updates).eq("id", id);
    setRow((cur) => (cur ? ({ ...cur, ...updates } as Row) : cur));
    setIntelLoading(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Admins only</h1>
          <Link href={user ? "/" : "/auth/signin"} className="text-green-700 hover:underline">{user ? "Go home" : "Sign in"}</Link>
        </main>
      </div>
    );
  }
  if (notFound) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Message not found</h1>
          <Link href="/admin/whatsapp/inbox" className="text-green-700 hover:underline">Back to inbox</Link>
        </main>
      </div>
    );
  }
  if (!row) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading message…</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/admin/whatsapp/inbox" className="text-sm text-green-700 hover:underline">← Inbox</Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-bold">Message from {row.agent?.name || "unknown sender"}</h1>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-600">{row.processed_status.replace(/_/g, " ")}</span>
        </div>
        <p className="text-sm text-gray-500">
          {row.sender_phone} · {new Date(row.received_at).toLocaleString("en-IN")}
          {row.agent && <> · <Link href={`/admin/agents/${row.agent.id}`} className="text-green-700 hover:underline">view agent</Link></>}
        </p>

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Message</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-800">{row.raw_message}</p>
          {row.voice_transcript && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              <span className="font-medium">🎤 Voice transcript: </span>{row.voice_transcript}
            </div>
          )}
          {row.media_urls?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {row.media_urls.map((u, i) => (
                <a key={i} href={u} target="_blank" rel="noopener" className="text-xs text-green-700 hover:underline">📷 photo {i + 1}</a>
              ))}
            </div>
          )}
          {row.location_lat != null && row.location_lng != null && (
            <p className="mt-3 text-xs text-gray-500">📍 {row.location_lat}, {row.location_lng}</p>
          )}
        </section>

        <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">AI parse</h2>
            <button onClick={runParse} disabled={parsing} className="rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50">
              {parsing ? "Parsing…" : row.parsed_payload ? "Re-parse" : "Parse with AI"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Status: <span className="font-medium text-gray-700">{row.parsing_status}</span>
            {row.parsing_confidence && <> · confidence: <span className="font-medium text-gray-700">{row.parsing_confidence}</span></>}
            {row.parsing_cost_inr > 0 && <> · cost: ₹{row.parsing_cost_inr}</>}
          </p>
          {parseErr && <p className="mt-2 text-sm text-red-600">{parseErr}</p>}

          {row.parsed_payload && <ParsedView payload={row.parsed_payload} />}

          {row.resulting_listing_id ? (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              ✓ Published. <Link href={`/listing/${row.resulting_listing_id}`} className="font-semibold underline">View the live listing →</Link>
            </div>
          ) : row.parsed_payload?.listings?.[0] ? (
            <PublishDraft
              inboxId={String(id)}
              listing={row.parsed_payload.listings[0]}
              coords={{ latitude: row.location_lat, longitude: row.location_lng }}
              onPublished={() => setRow((cur) => (cur ? { ...cur, processed_status: "published" } : cur))}
            />
          ) : null}
        </section>

        {row.parsed_payload?.listings?.[0] && (
          <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Intelligence</h2>
              <button onClick={runIntel} disabled={intelLoading} className="rounded-full border border-green-700 px-4 py-1.5 text-sm font-medium text-green-800 hover:bg-green-50 disabled:opacity-50">
                {intelLoading ? "Checking…" : "Check duplicates & buyer matches"}
              </button>
            </div>
            {intel && (
              <>
                {intel.dup.is_duplicate_suspected ? (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                    ⚠ Possible duplicate ({intel.dup.match_type?.replace(/_/g, " ")}). {intel.dup.evidence}
                    {intel.dup.matched_listing_id && <> · <Link href={`/listing/${intel.dup.matched_listing_id}`} className="font-medium underline">view</Link></>}
                  </div>
                ) : (
                  <div className="rounded-lg bg-green-50 p-3 text-sm text-green-800">✓ No duplicates found.</div>
                )}
                <div className="mt-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Buyer matches ({intel.matches.length})</p>
                  {intel.matches.length === 0 ? (
                    <p className="mt-1 text-sm text-gray-400">No matching buyer requirements yet.</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {intel.matches.map((m) => (
                        <li key={m.buyer_interest_id} className="rounded-lg border border-gray-200 p-2 text-sm">
                          <span className="font-medium capitalize">{m.match_label.replace(/_/g, " ")}</span> · {m.buyer_phone_masked} · score {m.match_score}
                          {m.match_reasons.length > 0 && <span className="text-xs text-gray-500"> — {m.match_reasons.join(", ")}</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </section>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {row.processed_status !== "rejected" && <button onClick={() => setStatus("rejected")} className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Reject</button>}
          {row.processed_status !== "archived" && <button onClick={() => setStatus("archived")} className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Archive</button>}
          {(row.processed_status === "rejected" || row.processed_status === "archived") && <button onClick={() => setStatus("inbox")} className="rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Move back to inbox</button>}
        </div>
      </main>
    </div>
  );
}
