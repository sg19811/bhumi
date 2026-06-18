"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/Logo";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        /email not confirmed/i.test(error.message)
          ? "Please check your email and click the confirmation link to verify your account, then sign in."
          : error.message
      );
      setLoading(false);
      return;
    }

    let dest = "/";
    try {
      const uid = data.user?.id;
      if (uid) {
        const meta = (data.user?.user_metadata ?? {}) as { full_name?: string; phone?: string };
        const { data: prof } = await supabase.from("profiles").select("user_type, role, full_name, phone").eq("user_id", uid).maybeSingle();
        // Self-heal: if name/phone never made it into profiles but we have them from
        // signup (stored on the account), copy them over now. So even if the DB
        // trigger isn't set up, the profile fills in on first sign-in.
        if (prof && !prof.full_name && (meta.full_name || meta.phone)) {
          await supabase.from("profiles").update({ full_name: meta.full_name ?? prof.full_name ?? null, phone: meta.phone ?? prof.phone ?? null }).eq("user_id", uid);
        }
        // First-timers (plain users who haven't picked an identity) go to onboarding.
        if (prof && !prof.user_type && (!prof.role || prof.role === "user")) dest = "/onboarding";
      }
    } catch { /* profiles columns may not exist until the migration runs */ }
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-6 py-12 text-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold">Sign in</h1>

          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              required className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
            <button type="submit" disabled={loading}
              className="w-full rounded-full bg-green-700 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm">
            <Link href="/auth/forgot" className="font-medium text-green-800 hover:underline">Forgot password?</Link>
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          No account? <Link href="/auth/signup" className="font-medium text-green-800 hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}
