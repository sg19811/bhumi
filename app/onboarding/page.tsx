"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import Logo from "@/app/components/Logo";

// Self-selected identity. "Agent" also grants the agent role (only for plain
// users — admins/agents never reach this screen, so they can't be downgraded).
const OPTIONS = [
  { key: "agent", role: "agent", icon: "🏢", title: "Agent or company", desc: "I list or source land — a broker, real-estate or land company, or firm." },
  { key: "buyer", role: "user", icon: "🌾", title: "Buyer", desc: "I'm looking to buy land — including first-time buyers." },
  { key: "other", role: "user", icon: "✨", title: "Something else", desc: "I'm selling my own land, just exploring, or here for another reason." },
];

const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-600/15";

export default function Onboarding() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/auth/signin"); return; }
    supabase.from("profiles").select("user_type, role, full_name, phone").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data && (data.user_type || (data.role && data.role !== "user"))) { router.replace("/"); return; }
      // Pre-fill from the profile, falling back to whatever was captured at signup.
      const meta = (user.user_metadata ?? {}) as { full_name?: string; phone?: string };
      setName((data?.full_name as string) || meta.full_name || "");
      setPhone((data?.phone as string) || meta.phone || "");
      setReady(true);
    });
  }, [user, loading, router]);

  async function choose(opt: typeof OPTIONS[number]) {
    if (!user) return;
    setBusy(true);
    const patch: Record<string, string> = { user_type: opt.key, full_name: name.trim(), phone: phone.trim() };
    if (opt.role === "agent") patch.role = "agent";
    try { await supabase.from("profiles").update(patch).eq("user_id", user.id); } catch { /* columns may not exist until migration runs */ }
    router.push("/");
    router.refresh();
  }

  if (loading || !ready) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading…</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-6 py-12 text-gray-900">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-md">
          <h1 className="text-center text-2xl font-bold">Welcome! A couple of quick things</h1>
          <p className="mt-1 text-center text-sm text-gray-500">Confirm your details and tell us who you are. You can change these later.</p>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <label className="text-sm font-medium text-gray-700">Your name
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={`mt-1 ${field}`} />
            </label>
            <label className="text-sm font-medium text-gray-700">Phone
              <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="Phone number" className={`mt-1 ${field}`} />
            </label>
          </div>

          <p className="mb-2 mt-6 text-sm font-medium text-gray-700">Which best describes you?</p>
          <div className="space-y-3">
            {OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                disabled={busy}
                onClick={() => choose(o)}
                className="flex w-full items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-green-400 hover:shadow-md disabled:opacity-50"
              >
                <span className="text-2xl" aria-hidden="true">{o.icon}</span>
                <span>
                  <span className="block font-semibold text-gray-900">{o.title}</span>
                  <span className="block text-sm text-gray-500">{o.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">Pick one to finish — your name &amp; phone are saved with it.</p>
        </div>
      </div>
    </div>
  );
}
