"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { vendorCategoryLabel } from "@/app/lib/co-buy/services/catalog";

export default function AdminVendors() {
  const { user, role, loading } = useAuth();
  const isAdmin = role === "admin";
  const [vendors, setVendors] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("acrehub_vendors").select("*").order("vendor_name").then(({ data }) => setVendors(data ?? []));
  }, [isAdmin]);

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || !isAdmin) return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">Vendors</h1>
          <Link href="/admin/vendors/new" className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800">+ New vendor</Link>
        </div>
        <p className="mb-4 text-sm text-gray-500">Internal vendor CRM. Not a public directory.</p>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 text-left text-xs text-gray-500"><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">City</th><th className="p-3">Phone</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id as string} className="border-b border-gray-100">
                  <td className="p-3 font-medium">{v.vendor_name as string}{v.active === false ? <span className="ml-1 text-xs text-gray-400">(inactive)</span> : null}</td>
                  <td className="p-3 text-gray-600">{vendorCategoryLabel(v.vendor_category as string)}</td>
                  <td className="p-3 text-gray-600">{(v.city as string) ?? "—"}</td>
                  <td className="p-3 text-gray-600">{v.phone as string}</td>
                  <td className="p-3 text-gray-600">{v.verification_status as string}</td>
                  <td className="p-3 text-right"><Link href={`/admin/vendors/${v.id}`} className="font-medium text-green-800 hover:underline">Edit</Link></td>
                </tr>
              ))}
              {vendors.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-400">No vendors yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
