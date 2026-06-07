"use client";

import Link from "next/link";
import { track } from "@/app/lib/legal/analytics";

// Standardized "Talk to a verified lawyer" CTA. `context` describes where it sits.
export default function LawyerCTA({
  context,
  state,
  variant = "block",
  label = "Talk to a verified lawyer",
}: {
  context: string;
  state?: string;
  variant?: "block" | "inline";
  label?: string;
}) {
  const onClick = () => track("legal_lawyer_cta_clicked", { context, state: state ?? null });

  if (variant === "inline") {
    return (
      <Link href="/legal/talk-to-lawyer" onClick={onClick} className="font-medium text-green-800 hover:underline">
        {label} →
      </Link>
    );
  }
  return (
    <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center sm:p-6">
      <h3 className="text-lg font-semibold text-green-900">Not sure where you stand?</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-green-800">
        Land law is state-specific and changes often. Get a verified land lawyer to review your case.
      </p>
      <Link href="/legal/talk-to-lawyer" onClick={onClick} className="mt-4 inline-block rounded-full bg-green-700 px-6 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-green-800">
        {label}
      </Link>
    </div>
  );
}
