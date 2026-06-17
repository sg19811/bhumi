// Pure auto-publish decision (spec 9.5). A draft may skip admin review and go
// live automatically only when the agent is highly trusted AND the parse is
// clean on every axis. Returns the verdict plus the reasons it's blocked, so the
// processor can show exactly what's missing.

type AutoPublishInbox = {
  parsing_confidence: string | null;
  duplicate_check_status: string | null;
  price_unusual: boolean | null;
  missing_critical_fields: string[] | null;
};

type AutoPublishAgent = {
  auto_publish_listings: boolean | null;
  trust_tier: number | null;
  accuracy_score: number | null;
};

export function shouldAutoPublish(
  inbox: AutoPublishInbox,
  agent: AutoPublishAgent | null
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!agent) {
    return { eligible: false, reasons: ["no linked agent"] };
  }
  if (!agent.auto_publish_listings) reasons.push("auto-publish not enabled for this agent");
  if ((agent.trust_tier ?? 0) < 4) reasons.push("trust tier below 4");
  if ((agent.accuracy_score ?? 0) < 0.85) reasons.push("accuracy below 0.85");
  if (inbox.parsing_confidence !== "high") reasons.push("parse confidence not high");
  if (inbox.duplicate_check_status !== "clean") reasons.push("duplicate check not clean");
  if (inbox.price_unusual) reasons.push("price flagged unusual");
  if ((inbox.missing_critical_fields?.length ?? 0) > 0) reasons.push("missing critical fields");
  return { eligible: reasons.length === 0, reasons };
}
