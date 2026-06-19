"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

type RefEventRow = { referral_code: string | null; event_type: string };
type ChannelRow = { id: string; name: string; channel_kind: string; member_count: number; status: string };

type Stats = {
  shareLinks: number;
  totalClicks: number;
  referralCodes: number;
  referralEvents: number;
  growthEvents: number;
  eventsByType: Array<[string, number]>;
  topSharers: Array<[string, number]>;
  channels: ChannelRow[];
};

function tally<T>(rows: T[], key: (r: T) => string | null): Array<[string, number]> {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = key(r);
    if (k) m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString("en-IN")}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function GrowthDashboard() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      const [sl, re, rc, ge, ch] = await Promise.all([
        supabase.from("share_links").select("click_count").limit(10000),
        supabase.from("referral_events").select("referral_code, event_type").limit(10000),
        supabase.from("referral_codes").select("id", { count: "exact", head: true }),
        supabase.from("growth_events").select("event_type").limit(10000),
        supabase.from("acrehub_owned_channels").select("id, name, channel_kind, member_count, status").order("member_count", { ascending: false }),
      ]);
      const links = (sl.data ?? []) as { click_count: number | null }[];
      const refEvents = (re.data ?? []) as RefEventRow[];
      const growthEvents = (ge.data ?? []) as { event_type: string }[];
      setStats({
        shareLinks: links.length,
        totalClicks: links.reduce((sum, l) => sum + (l.click_count ?? 0), 0),
        referralCodes: rc.count ?? 0,
        referralEvents: refEvents.length,
        growthEvents: growthEvents.length,
        eventsByType: tally(growthEvents, (r) => r.event_type),
        topSharers: tally(refEvents, (r) => r.referral_code).slice(0, 10),
        channels: (ch.data ?? []) as ChannelRow[],
      });
    })();
  }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <Header />
        <main className="mx-auto max-w-md px-6 py-24 text-center">
          <h1 className="mb-2 text-2xl font-bold">Admins only</h1>
          <Link href={user ? "/" : "/auth/signin"} className="mt-4 inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white hover:bg-green-800">{user ? "Go home" : "Sign in"}</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Growth</h1>
          <Link href="/admin" className="text-sm text-green-700 hover:underline">← Dashboard</Link>
        </div>

        {!stats ? (
          <p className="text-gray-400">Loading metrics…</p>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Stat label="Share links" value={stats.shareLinks} />
              <Stat label="Total clicks" value={stats.totalClicks} />
              <Stat label="Referral codes" value={stats.referralCodes} />
              <Stat label="Referral events" value={stats.referralEvents} />
              <Stat label="Growth events" value={stats.growthEvents} />
            </div>

            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Channel growth</h2>
              {stats.channels.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">No channels yet. Add them in the owned-channels manager.</p>
              ) : (
                <div className="space-y-2">
                  {stats.channels.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
                      <span className="font-medium text-gray-800">{c.name}</span>
                      <span className="text-gray-500">{c.member_count.toLocaleString("en-IN")} members · {c.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="grid gap-8 sm:grid-cols-2">
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Top sharers (by attributed events)</h2>
                {stats.topSharers.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">No attributed events yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.topSharers.map(([code, count]) => (
                      <li key={code} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm">
                        <span className="font-mono text-gray-800">{code}</span>
                        <span className="text-gray-500">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-500">Events by type</h2>
                {stats.eventsByType.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">No events yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.eventsByType.map(([type, count]) => (
                      <li key={type} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm">
                        <span className="text-gray-800">{type}</span>
                        <span className="text-gray-500">{count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
