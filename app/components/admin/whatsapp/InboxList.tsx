"use client";

import Link from "next/link";
import type { WhatsAppInboxRow } from "@/app/lib/agent-types";

export type InboxRowWithAgent = WhatsAppInboxRow & { agent_name: string | null };

const STATUS_TONE: Record<string, string> = {
  inbox: "bg-amber-100 text-amber-800",
  awaiting_clarification: "bg-orange-100 text-orange-700",
  in_progress: "bg-blue-100 text-blue-700",
  listing_drafted: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-800",
  rejected: "bg-gray-200 text-gray-600",
  duplicate_merged: "bg-gray-200 text-gray-600",
  archived: "bg-gray-200 text-gray-600",
};

const CONFIDENCE_DOT: Record<string, string> = {
  high: "bg-green-500",
  medium: "bg-amber-500",
  low: "bg-red-500",
};

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function InboxList({ rows }: { rows: InboxRowWithAgent[] }) {
  if (rows.length === 0) {
    return <p className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">No messages in this view.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="divide-y divide-gray-100">
        {rows.map((r) => {
          const media: string[] = [];
          if (r.media_urls?.length) media.push(`📷×${r.media_urls.length}`);
          if (r.voice_note_url || r.voice_transcript) media.push("🎤");
          if (r.location_lat != null && r.location_lng != null) media.push("📍");

          const flags: string[] = [];
          if (r.duplicate_check_status === "duplicate_suspected" || r.duplicate_check_status === "duplicate_confirmed") flags.push("D");
          if (r.price_unusual) flags.push("$");
          if (r.missing_critical_fields?.length) flags.push("?");

          return (
            <div key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  {r.agent_name || <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">unknown sender</span>}
                  <span className="text-xs font-normal text-gray-400">{r.sender_phone}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[r.processed_status] ?? "bg-gray-100 text-gray-600"}`}>
                    {r.processed_status.replace(/_/g, " ")}
                  </span>
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{r.raw_message.slice(0, 120)}</p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span title={new Date(r.received_at).toLocaleString("en-IN")}>{relTime(r.received_at)}</span>
                  {media.length > 0 && <span>· {media.join(" ")}</span>}
                  <span>· parsing: {r.parsing_status}</span>
                  {r.parsing_confidence && <span className={`inline-block h-2 w-2 rounded-full ${CONFIDENCE_DOT[r.parsing_confidence] ?? "bg-gray-300"}`} />}
                  {flags.length > 0 && <span className="font-semibold text-red-600">· {flags.join(" ")}</span>}
                </p>
              </div>
              <Link href={`/admin/whatsapp/inbox/${r.id}`} className="shrink-0 self-start rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800">
                Process →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
