"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/Logo";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // A DB trigger creates the profile row on signup; just fill in name/phone
      // here (best-effort — needs a session, which exists when email confirmation
      // is off). Using update avoids creating a duplicate profile row.
      await supabase.from("profiles").update({ name: fullName, phone }).eq("user_id", data.user.id);
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-6 py-12 text-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold">Create account</h1>

          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)}
              required className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
            <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
            <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={6} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
            <button type="submit" disabled={loading}
              className="w-full rounded-full bg-green-700 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link href="/auth/signin" className="font-medium text-green-800 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
