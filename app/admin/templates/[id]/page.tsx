"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import AdminTemplateForm from "@/app/components/co-buy/AdminTemplateForm";

export default function EditTemplate() {
  const { user, role, loading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [tpl, setTpl] = useState<Record<string, unknown> | null>(null);
  const [fetched, setFetched] = useState(false);
  useEffect(() => { if (role === "admin" && id) supabase.from("acrehub_message_templates").select("*").eq("id", id).maybeSingle().then(({ data }) => { setTpl(data ?? null); setFetched(true); }); }, [role, id]);
  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || role !== "admin") return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900"><Header />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/templates" className="hover:text-green-800">Templates</Link> / Edit</nav>
        <h1 className="mb-6 text-3xl font-bold">Edit template</h1>
        {!fetched ? <p className="text-gray-400">Loading…</p> : tpl ? <AdminTemplateForm existing={tpl} /> : <p className="text-gray-500">Template not found.</p>}
      </main>
    </div>
  );
}
