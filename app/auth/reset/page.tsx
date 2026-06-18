"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/app/components/Logo";

// States: while we wait for Supabase to read the recovery token from the URL,
// show "checking"; then either the form ("ready") or an expired-link notice.
type Stage = "checking" | "ready" | "invalid" | "done";

export default function ResetPassword() {
  const [stage, setStage] = useState<Stage>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // When the user arrives from the email link, supabase-js parses the recovery
  // token out of the URL (detectSessionInUrl is on by default) and fires a
  // PASSWORD_RECOVERY event with a temporary session. We then let them set a
  // new password. If no session shows up, the link is missing/expired.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setStage("ready");
    });

    // Handle the case where the session was already established before we
    // subscribed (event already fired). Give the URL parsing a moment, then
    // mark the link invalid if there's still nothing.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStage("ready");
    });
    const t = setTimeout(() => {
      setStage((s) => (s === "checking" ? "invalid" : s));
    }, 4000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    setStage("done");
    setLoading(false);
  }

  const wrap = (inner: React.ReactNode) => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-6 py-12 text-gray-900">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        {inner}
      </div>
    </div>
  );

  if (stage === "checking") {
    return wrap(
      <div className="rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-md">
        <p className="text-sm text-gray-600">Checking your reset link…</p>
      </div>
    );
  }

  if (stage === "invalid") {
    return wrap(
      <div className="rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-md">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">⚠️</div>
        <h1 className="text-xl font-bold">Link expired or invalid</h1>
        <p className="mt-2 text-sm text-gray-600">This password reset link is no longer valid. Please request a new one.</p>
        <Link href="/auth/forgot" className="mt-5 inline-block rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800">Request a new link</Link>
      </div>
    );
  }

  if (stage === "done") {
    return wrap(
      <div className="rounded-2xl border border-gray-200 bg-white p-7 text-center shadow-md">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">✅</div>
        <h1 className="text-xl font-bold">Password updated</h1>
        <p className="mt-2 text-sm text-gray-600">Your password has been changed. You can now use it to sign in.</p>
        <button onClick={() => { router.push("/auth/signin"); router.refresh(); }}
          className="mt-5 inline-block rounded-full bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800">Go to sign in</button>
      </div>
    );
  }

  return wrap(
    <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold">Set a new password</h1>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="password" placeholder="New password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)}
          required minLength={6} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
        <input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          required minLength={6} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
        <button type="submit" disabled={loading}
          className="w-full rounded-full bg-green-700 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50">
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
