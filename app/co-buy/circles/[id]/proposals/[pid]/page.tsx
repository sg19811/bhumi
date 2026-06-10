"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { castVote } from "@/app/lib/co-buy/post-purchase/actions";
import { tallyVotes, type VoteOption } from "@/app/lib/co-buy/post-purchase/voting";
import { POST_PURCHASE_DISCLAIMERS } from "@/app/lib/co-buy/post-purchase/constants";

export default function MemberProposalDetail() {
  const { user, loading } = useAuth();
  const { id, pid } = useParams<{ id: string; pid: string }>();
  const [p, setP] = useState<Record<string, unknown> | null>(null);
  const [votes, setVotes] = useState<{ vote_value: string; member_id: string }[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [fetched, setFetched] = useState(false);

  async function reload() {
    const { data: prop } = await supabase.from("co_buy_proposals").select("*").eq("id", pid).maybeSingle();
    const { data: v } = await supabase.from("co_buy_votes").select("vote_value, member_id").eq("proposal_id", pid);
    setP(prop ?? null); setVotes((v as { vote_value: string; member_id: string }[]) ?? []); setFetched(true);
  }
  useEffect(() => {
    if (!user || !id || !pid) return;
    (async () => {
      const { data: me } = await supabase.from("co_buy_circle_members").select("id").eq("circle_id", id).eq("user_id", user.id).maybeSingle();
      setMemberId((me?.id as string) ?? null);
      await reload();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id, pid]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><Link href="/auth/signin" className="text-green-700 hover:underline">Sign in →</Link></main></div>;
  if (fetched && !p) return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><p className="text-gray-500">Proposal not found.</p></main></div>;

  const options: VoteOption[] = Array.isArray(p?.options) ? (p!.options as VoteOption[]) : [];
  const tally = tallyVotes(votes, options);
  const myVote = votes.find((v) => v.member_id === memberId)?.vote_value;
  const open = p?.status === "open";

  async function vote(val: string) {
    if (!memberId) return;
    const res = await castVote(pid, memberId, val);
    setMsg(res.ok ? "✓ Vote recorded." : (res.error ?? "Failed."));
    if (res.ok) reload();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900"><Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-8 sm:px-6">
        <nav className="mb-3 text-sm text-gray-500"><Link href={`/co-buy/circles/${id}/proposals`} className="hover:text-green-800">Proposals</Link></nav>
        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">{p?.status as string}</span>
        <h1 className="mt-2 text-3xl font-bold">{p?.title as string}</h1>
        <p className="mt-2 whitespace-pre-line text-gray-700">{p?.description as string}</p>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 font-semibold">{open ? "Cast your vote" : "Result"}</h2>
          <div className="space-y-2">
            {options.map((o) => (
              <div key={o.key} className="flex items-center justify-between gap-3">
                <button disabled={!open || !memberId} onClick={() => vote(o.key)} className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${myVote === o.key ? "border-green-600 bg-green-50 text-green-800" : "border-gray-300 text-gray-700 hover:border-green-400"}`}>{o.label}{myVote === o.key ? " ✓" : ""}</button>
                <span className="text-sm text-gray-500">{tally[o.key] ?? 0} {(tally[o.key] ?? 0) === 1 ? "vote" : "votes"}</span>
              </div>
            ))}
          </div>
          {msg && <p className="mt-2 text-xs text-green-800">{msg}</p>}
        </section>

        {p?.decision_notes ? (
          <section className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="mb-1 font-semibold">Decision</h2>
            <p className="text-sm text-gray-700">{p.decision_notes as string}</p>
          </section>
        ) : null}

        <p className="mt-6 text-xs text-gray-400">{POST_PURCHASE_DISCLAIMERS.advisoryVote}</p>
      </main>
      <Footer />
    </div>
  );
}
