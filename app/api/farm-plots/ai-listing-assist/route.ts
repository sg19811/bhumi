import { callClaude, AI_MODELS } from "@/app/lib/ai/anthropic";
import { getUserId } from "@/app/lib/ai/require-user";
import { LAND_TYPE_LABELS } from "@/app/lib/land";

const SYSTEM = `You help a seller write an honest description for a farm-plot / land listing on AcreHub.
Rules:
- Use ONLY the details the seller provides. Never invent facts, approvals, water, returns, or appreciation claims.
- No hype, no superlatives, no pressure ("don't miss", "best investment"). Plain, trustworthy tone.
- Mention what's genuinely useful to a buyer (location, access, water, plot sizes, stage, what to verify).
- Do not make legal claims or promise approvals. It's fine to suggest the buyer verify documents.
- Output ONLY the description text (no preamble, no headings, no quotes). 60–120 words.`;

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return Response.json({ error: "Please sign in to use the AI assistant." }, { status: 401 });

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* ignore */ }

  const fields = (body.fields as Record<string, unknown>) || {};
  const draft = typeof body.description === "string" ? body.description.trim() : "";

  const g = (k: string) => { const v = fields?.[k]; return v != null && v !== "" ? String(v) : null; };
  const detailLines: [string, string | null][] = [
    ["Title", g("title")],
    ["Type", LAND_TYPE_LABELS[String(g("land_type"))] ?? g("land_type")],
    ["Project name", g("project_name")],
    ["Developer", g("developer_name")],
    ["Location", [g("village"), g("taluka"), g("district")].filter(Boolean).join(", ") || null],
    ["Corridor", g("corridor")],
    ["City", g("nearest_city")],
    ["Price (₹)", g("price")],
    ["Area", [g("area_value"), g("area_unit")].filter(Boolean).join(" ") || null],
    ["Plots", g("plot_count")],
    ["Plot sizes", [g("plot_size_min_value"), g("plot_size_max_value"), g("plot_size_unit")].filter(Boolean).join(" / ") || null],
    ["Stage", g("project_stage")],
    ["Possession", g("possession_timeline")],
    ["Water source", g("water_source")],
    ["Road access", g("road_access")],
    ["Layout approval", g("layout_approval_status")],
    ["Conversion", g("conversion_status")],
  ];
  const details = detailLines.filter(([, v]) => v != null).map(([k, v]) => `- ${k}: ${v}`).join("\n");

  if (!details) return Response.json({ error: "Fill in a few details first (location, type, sizes…), then try again." }, { status: 400 });

  const prompt = draft
    ? `Improve this draft description, keeping it factual and on AcreHub's honest tone. Don't add facts not present below.\n\nDraft:\n${draft}\n\nDetails:\n${details}`
    : `Write a description from these details.\n\nDetails:\n${details}`;

  const result = await callClaude({ system: SYSTEM, prompt, model: AI_MODELS.assist, maxTokens: 400 });
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status ?? 502 });
  return Response.json({ description: result.text });
}
