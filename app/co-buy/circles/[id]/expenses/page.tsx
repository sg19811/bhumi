"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { expenseCategoryLabel, POST_PURCHASE_DISCLAIMERS } from "@/app/lib/co-buy/post-purchase/constants";
import { formatINR } from "@/app/lib/format";

type Row = Record<string, unknown> & { id: string };

export default function MemberExpenses() {
  const { user, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [expenses, setExpenses] = useState<Row[]>([]);
  const [myDue, setMyDue] = useState<Row | null>(null);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data: me } = await supabase.from("co_buy_circle_members").select("id").eq("circle_id", id).eq("user_id", user.id).maybeSingle();
      const fy = new Date().getFullYear();
      const [e, d] = await Promise.all([
        supabase.from("co_buy_expenses").select("*").eq("circle_id", id).order("expense_date", { ascending: false }),
        me ? supabase.from("co_buy_member_dues").select("*").eq("circle_id", id).eq("member_id", me.id).eq("fiscal_year", fy).maybeSingle() : Promise.resolve({ data: null }),
      ]);
      setExpenses((e.data as Row[]) ?? []); setMyDue((d.data as Row) ?? null);
    })();
  }, [user, id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user) return <div className="flex min-h-screen flex-col bg-white"><Header /><main className="mx-auto max-w-md flex-1 px-6 py-24 text-center"><Link href="/auth/signin" className="text-green-700 hover:underline">Sign in →</Link></main></div>;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900"><Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-6">
        <nav className="mb-3 text-sm text-gray-500"><Link href={`/co-buy/circles/${id}`} className="hover:text-green-800">Circle</Link> / Expenses</nav>
        <h1 className="text-3xl font-bold sm:text-4xl">Shared expenses</h1>

        {myDue && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm text-green-900">Your share this year ({(myDue.fiscal_year as number)})</p>
            <p className="mt-1 text-2xl font-bold text-green-800">{formatINR((myDue.balance as number) ?? 0)} <span className="text-sm font-normal text-green-700">outstanding</span></p>
            <p className="text-xs text-green-700">Allocated {formatINR((myDue.total_allocated as number) ?? 0)} · paid {formatINR((myDue.total_paid as number) ?? 0)}</p>
          </div>
        )}

        <div className="mt-6 space-y-2">
          {expenses.map((x) => (
            <div key={x.id} className="flex items-center justify-between gap-3 border-b border-gray-100 py-2.5 text-sm">
              <div><p className="font-medium text-gray-900">{x.title as string}</p><p className="text-xs text-gray-400">{expenseCategoryLabel(x.category as string)} · {x.expense_date as string}</p></div>
              <p className="shrink-0 font-semibold text-gray-800">{formatINR(x.amount as number)}</p>
            </div>
          ))}
          {expenses.length === 0 && <p className="rounded-2xl border border-dashed border-gray-300 py-10 text-center text-gray-400">No expenses recorded yet.</p>}
        </div>

        <p className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">{POST_PURCHASE_DISCLAIMERS.recordKeeping} {POST_PURCHASE_DISCLAIMERS.noMoney}</p>
      </main>
      <Footer />
    </div>
  );
}
