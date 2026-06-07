"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { useAuth } from "@/app/lib/auth";
import { DD_STEPS } from "@/app/lib/legal/dueDiligence";
import { track } from "@/app/lib/legal/analytics";
import StepCard from "./StepCard";
import LawyerCTA from "@/app/components/legal/LawyerCTA";

const SCOPE = "standalone";
const LS_KEY = "acrehub_dd_standalone";

export default function DueDiligencePage() {
  const { user } = useAuth();
  const [done, setDone] = useState<Record<string, boolean>>({});

  // Load progress: DB for logged-in users, localStorage otherwise.
  useEffect(() => {
    if (user) {
      supabase
        .from("legal_dd_progress")
        .select("step_id, completed")
        .eq("user_id", user.id)
        .eq("scope_id", SCOPE)
        .then(({ data }) => {
          const map: Record<string, boolean> = {};
          (data ?? []).forEach((r) => { map[r.step_id] = r.completed; });
          setDone(map);
        });
    } else {
      try {
        setDone(JSON.parse(localStorage.getItem(LS_KEY) || "{}"));
      } catch {
        setDone({});
      }
    }
  }, [user]);

  async function toggle(stepId: string, next: boolean) {
    setDone((d) => ({ ...d, [stepId]: next }));
    if (next) track("legal_dd_step_completed", { step_id: stepId, scope_id: SCOPE });
    if (user) {
      await supabase.from("legal_dd_progress").upsert({
        user_id: user.id,
        scope_id: SCOPE,
        step_id: stepId,
        completed: next,
        completed_at: next ? new Date().toISOString() : null,
      });
    } else {
      const updated = { ...done, [stepId]: next };
      try { localStorage.setItem(LS_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
    }
  }

  const completedCount = DD_STEPS.filter((s) => done[s.step_id]).length;
  const pct = Math.round((completedCount / DD_STEPS.length) * 100);

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold">10-step due diligence</h1>
      <p className="mt-2 text-gray-600">
        Work through these before you buy. {user ? "Your progress is saved to your account." : "Sign in to save your progress across devices."}
      </p>

      <div className="sticky top-16 z-10 my-6 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-green-800">{completedCount} of {DD_STEPS.length} done</span>
          <span className="text-gray-500">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {DD_STEPS.map((step, i) => (
          <StepCard key={step.step_id} step={step} index={i} completed={!!done[step.step_id]} onToggle={(next) => toggle(step.step_id, next)} />
        ))}
      </div>

      <div className="mt-8">
        <LawyerCTA context="due_diligence" label="Get a lawyer to run this for you" />
      </div>
    </main>
  );
}
