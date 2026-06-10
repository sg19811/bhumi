"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";

export default function AdminTemplates() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [tpls, setTpls] = useState<Record<string, unknown>[]>([]);
  useEffect(() => { if (isAdmin) supabase.from("acrehub_message_templates").select("*").order("display_name").then(({ data }) => setTpls(data ?? [])); }, [isAdmin]);
  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between gap-3"><h1 className="text-3xl font-bold">Message templates</h1><Link href="/admin/templates/new" className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800">+ New</Link></div>
        <div className="space-y-2">
          {tpls.map((t) => (
            <Link key={t.id as string} href={`/admin/templates/${t.id}`} className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-green-300">
              <div className="flex items-center justify-between gap-3"><span className="font-medium">{t.display_name as string}</span><span className="text-xs text-gray-400">{t.channel as string} · {t.language as string}{t.active === false ? " · inactive" : ""}</span></div>
              <p className="mt-1 line-clamp-2 text-sm text-gray-500">{t.body as string}</p>
            </Link>
          ))}
          {tpls.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-gray-400">No templates yet.</p>}
        </div>
      </main>
    </div>
  );
}
