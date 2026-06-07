"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { EligibilityAnswers, EligibilityResult } from "@/app/lib/legal/types";
import { buildRiskScore } from "@/app/lib/legal/riskScore";
import { VERDICT_META } from "@/app/lib/legal/copy";
import { track } from "@/app/lib/legal/analytics";
import VerdictBadge from "@/app/components/legal/VerdictBadge";
import ConfidenceBadge from "@/app/components/legal/ConfidenceBadge";
import RiskMeter from "@/app/components/legal/RiskMeter";
import LegalDisclaimer from "@/app/components/legal/LegalDisclaimer";
import LeadCaptureForm from "@/app/components/legal/LeadCaptureForm";
import ResultShareButtons from "@/app/components/legal/ResultShareButtons";

const SEV_STYLE: Record<string, string> = {
  block: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-gray-200 bg-gray-50 text-gray-600",
};

export default function ResultScreen({
  result,
  answers,
  resultId,
  listingId,
  trackOnMount = false,
}: {
  result: EligibilityResult;
  answers: EligibilityAnswers;
  resultId: string | null;
  listingId?: string;
  trackOnMount?: boolean;
}) {
  const risk = buildRiskScore(answers, result);
  const meta = VERDICT_META[result.verdict];

  useEffect(() => {
    if (trackOnMount) {
      track("legal_wizard_completed", {
        state: answers.state,
        verdict: result.verdict,
        risk_score: result.risk_score,
        confidence: result.confidence,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <LegalDisclaimer variant="result" page="result" />

      {/* Verdict header */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <VerdictBadge verdict={result.verdict} size="lg" />
          <ConfidenceBadge confidence={result.confidence} />
        </div>
        <h1 className="mt-4 text-2xl font-bold leading-tight sm:text-3xl">{result.headline}</h1>
        <p className="mt-2 text-gray-600">{meta.blurb}</p>
      </div>

      <RiskMeter risk={risk} />

      {/* Rationale */}
      {result.rationale.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">Why we say this</h2>
          <ul className="space-y-2.5">
            {result.rationale.map((r) => (
              <li key={r.rule_id} className={`rounded-xl border px-4 py-3 text-sm ${SEV_STYLE[r.severity] ?? SEV_STYLE.info}`}>
                {r.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* References */}
      {result.references.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-2 text-lg font-semibold">Legal references</h2>
          <ul className="space-y-1.5 text-sm">
            {result.references.map((r, i) => (
              <li key={i}>
                {r.url
                  ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-green-800 hover:underline">{r.label} ↗</a>
                  : <span className="text-gray-600">{r.label}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next steps */}
      {result.next_steps.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">Recommended next steps</h2>
          <div className="flex flex-col gap-2.5">
            {result.next_steps.map((s) => {
              const target = s.id === "dd" && listingId ? `/legal/due-diligence?listing=${listingId}` : (s.cta_target ?? "/legal");
              return (
                <Link key={s.id} href={target} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:border-green-400 hover:bg-green-50">
                  <span>{s.label}</span>
                  <span className="text-green-700" aria-hidden="true">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Share */}
      {resultId && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-3 text-lg font-semibold">Save or share this result</h2>
          <ResultShareButtons resultId={resultId} headline={result.headline} />
        </div>
      )}

      {/* Lead capture */}
      <LeadCaptureForm
        source={resultId ? `/legal/result/${resultId}` : "/legal/wizard"}
        defaults={{
          state: answers.state,
          district: answers.district,
          land_type: answers.land_type,
          buyer_type: answers.buyer_type,
          related_result_id: resultId ?? undefined,
          legal_concern: `Eligibility result: ${result.verdict}`,
        }}
        heading="Get a lawyer to confirm this"
        subheading="A verified land lawyer can turn this estimate into a definitive answer for your exact case."
      />

      <LegalDisclaimer variant="result" page="result-footer" />
    </div>
  );
}
