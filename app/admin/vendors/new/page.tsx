"use client";

import Link from "next/link";
import Header from "@/app/components/Header";
import { useAuth } from "@/app/lib/auth";
import AdminVendorForm from "@/app/components/co-buy/services/AdminVendorForm";

export default function NewVendor() {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;
  if (!user || role !== "admin") return <div className="min-h-screen bg-white"><Header /><main className="mx-auto max-w-md px-6 py-24 text-center"><h1 className="mb-2 text-2xl font-bold">Admins only</h1><Link href="/" className="text-green-700 hover:underline">Go home</Link></main></div>;
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-8">
        <nav className="mb-3 text-sm text-gray-500"><Link href="/admin/vendors" className="hover:text-green-800">Vendors</Link> / New</nav>
        <h1 className="mb-6 text-3xl font-bold">New vendor</h1>
        <AdminVendorForm />
      </main>
    </div>
  );
}
