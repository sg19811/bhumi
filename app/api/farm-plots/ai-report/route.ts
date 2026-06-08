import { callClaude, AI_MODELS } from "@/app/lib/ai/anthropic";
import { getUserId } from "@/app/lib/ai/require-user";
import { supabaseAdmin } from "@/app/lib/supabase-server";
import { LAND_TYPE_LABELS } from "@/app/lib/land";

const SYSTEM = `You are AcreHub's farm-plot analyst. Write a concise, balanced, buyer-oriented summary of one farm-plot project using ONLY the facts provided.
Rules:
- Never invent facts, approvals, prices, distances, or returns. If something isn't provided, say it's not stated.
- No marketing hype or superlatives. Be plain and honest.
- Call out genuine risks and missing information clearly.
- Do NOT give legal or investment advice. Always remind the buyer to verify title/records/approvals and consult a lawyer before paying.
- Output 150–230 words: a short intro paragraph, then 3–5 bullet points (what's good / what to check), then one closing caution line.`;

function facts(l: Record<string, unknown>): string {
  const g = (k: string) => { const v = l?.[k]; return v != null && v !== "" ? String(v) : null; };
  const loc = [g("village"), g("taluka"), g("district")].filter(Boolean).join(", ");
  const amenities = Array.isArray(l?.amenities) ? (l.amenities as string[]).join(", ") : null;
  const lines: [string, string | null][] = [
    ["Project name", g("project_name")],
    ["Listing title", g("title")],
    ["Type", LAND_TYPE_LABELS[String(g("land_type"))] ?? g("land_type")],
    ["Developer", g("developer_name")],
    ["Price (₹)", g("price")],
    ["Location", loc || null],
    ["Corridor", g("corridor")],
    ["Nearest city", g("nearest_city")],
    ["Total project acres", g("total_project_acres")],
    ["Number of plots", g("plot_count")],
    ["Plot size min", g("plot_size_min_value")],
    ["Plot size max", g("plot_size_max_value")],
    ["Plot size unit", g("plot_size_unit")],
    ["Project stage", g("project_stage")],
    ["Possession", g("possession_timeline")],
    ["Distance from city (km)", g("distance_from_city_km")],
    ["Maintenance fee", g("maintenance_fee_amount")],
    ["Maintenance period", g("maintenance_fee_period")],
    ["Layout approval status", g("layout_approval_status")],
    ["Land conversion status", g("conversion_status")],
    ["Water source", g("water_source")],
    ["Road access", g("road_access")],
    ["Electricity", l?.electricity ? "yes" : null],
    ["Amenities", amenities],
    ["AcreHub verification", g("verification_tier")],
    ["Owner description", g("description")],
  ];
  return lines.filter(([, v]) => v != null).map(([k, v]) => `- ${k}: ${v}`).join("\n");
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return Response.json({ error: "Please sign in to generate an AI summary." }, { status: 401 });

  let listingId = "";
  try { ({ listingId } = await req.json()); } catch { /* ignore */ }
  if (!listingId) return Response.json({ error: "Missing listing id." }, { status: 400 });

  const { data: listing, error } = await supabaseAdmin.from("listings").select("*").eq("id", listingId).maybeSingle();
  if (error || !listing) return Response.json({ error: "Project not found." }, { status: 404 });

  const result = await callClaude({
    system: SYSTEM,
    prompt: `Summarise this farm-plot project for a prospective buyer.\n\nFacts:\n${facts(listing)}`,
    model: AI_MODELS.report,
    maxTokens: 700,
  });

  if (!result.ok) return Response.json({ error: result.error }, { status: result.status ?? 502 });
  return Response.json({ report: result.text });
}
