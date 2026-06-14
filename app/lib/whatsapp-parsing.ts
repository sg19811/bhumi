// Server-only. Turns an agent's WhatsApp message into a structured ParsedSubmission
// via Claude Haiku. Uses the project's fetch-based callClaude helper (no SDK).
// Spec section 7.2, adapted: no @anthropic-ai/sdk dependency.

import { callClaude, AI_MODELS } from "@/app/lib/ai/anthropic";
import { buildListingParserPrompt } from "@/app/lib/prompts/listing-parser";
import type { ParsedSubmission, ParsingConfidence } from "@/app/lib/agent-types";

// Claude Haiku 4.5 pricing (USD per million tokens) → INR.
const HAIKU_INPUT_USD_PER_M = 1;
const HAIKU_OUTPUT_USD_PER_M = 5;
const INR_PER_USD = 85;

export type ParseResult = {
  parsed: ParsedSubmission;
  confidence: ParsingConfidence;
  cost_inr: number;
  raw_response: string;
};

export type AgentParseContext = Parameters<typeof buildListingParserPrompt>[0];

// Throws Error('PARSE_FAILED: …') on bad JSON, Error('CLAUDE_API_ERROR: …') on upstream failure.
export async function parseSubmission(text: string, agentContext?: AgentParseContext): Promise<ParseResult> {
  const system = buildListingParserPrompt(agentContext);

  const result = await callClaude({ system, prompt: text, model: AI_MODELS.assist, maxTokens: 2048 });
  if (!result.ok) {
    throw new Error(`CLAUDE_API_ERROR: ${result.error}`);
  }

  // Strip any accidental markdown fences.
  const cleaned = result.text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed: ParsedSubmission;
  try {
    parsed = JSON.parse(cleaned) as ParsedSubmission;
  } catch {
    throw new Error(`PARSE_FAILED: Claude returned invalid JSON: ${cleaned.slice(0, 200)}`);
  }
  if (!parsed || !Array.isArray(parsed.listings)) {
    throw new Error("PARSE_FAILED: response missing a listings array.");
  }

  // Overall confidence = the lowest of every listing-level confidence.
  const all: ParsingConfidence[] = [];
  for (const l of parsed.listings) {
    all.push(l.acreage_confidence, l.location?.location_confidence, l.price?.price_confidence);
  }
  const confidence: ParsingConfidence = all.includes("low") ? "low" : all.includes("medium") ? "medium" : "high";

  // Cost from token usage (0 if the provider didn't report usage).
  let cost_inr = 0;
  if (result.usage) {
    const usd =
      (result.usage.input_tokens / 1_000_000) * HAIKU_INPUT_USD_PER_M +
      (result.usage.output_tokens / 1_000_000) * HAIKU_OUTPUT_USD_PER_M;
    cost_inr = Number((usd * INR_PER_USD).toFixed(4));
  }

  return { parsed, confidence, cost_inr, raw_response: result.text };
}
