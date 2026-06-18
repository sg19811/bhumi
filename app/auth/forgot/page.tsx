"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import Logo from "@/app/components/Logo";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // The reset link points back to /auth/reset on the CURRENT origin (so it's
    // acrehubindia.com in production, not localhost). The same URL must be in
    // Supabase → Auth → URL Configuration → Redirect URLs.
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    // Always show the same confirmation, even on error: we don't want to reveal
    // whether an email is registered. (Real outages still surface, below.)
    if (authError && /rate limit|too many/i.test(authError.message)) {
      setError("Too many requests. Please wait a minute and try again.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-6 py-12 text-gray-900">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8 flex justify-center"><Logo /></div>
          <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-md">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">✉️</div>
            <h1 className="text-xl font-bold">Check your email</h1>
            <p className="mt-2 text-sm text-gray-600">
              If an account exists for <span className="font-medium text-gray-900">{email}</span>, we&apos;ve sent a link to reset your password. Click it to choose a new one.
            </p>
            <p className="mt-3 text-xs text-gray-400">Can&apos;t find it? Check your spam folder.</p>
            <Link href="/auth/signin" className="mt-5 inline-block rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800">Back to sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-6 py-12 text-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-md">
          <h1 className="mb-2 text-center text-2xl font-bold">Reset password</h1>
          <p className="mb-6 text-center text-sm text-gray-600">Enter your email and we&apos;ll send you a link to set a new password.</p>

          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              required className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
            <button type="submit" disabled={loading}
              className="w-full rounded-full bg-green-700 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Remembered it? <Link href="/auth/signin" className="font-medium text-green-800 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
