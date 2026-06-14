import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { getUserId } from "@/app/lib/ai/require-user";
import { parseSubmission, type AgentParseContext } from "@/app/lib/whatsapp-parsing";

export const dynamic = "force-dynamic";

function fail(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

// Parsing costs money, so restrict to admins (not just any signed-in user).
async function isAdminUser(req: Request): Promise<boolean> {
  const userId = await getUserId(req);
  if (!userId) return false;
  const { data } = await db.from("profiles").select("role").eq("user_id", userId).maybeSingle();
  return data?.role === "admin";
}

export async function POST(req: Request) {
  if (!(await isAdminUser(req))) {
    return fail("UNAUTHORIZED", "Admins only.", 401);
  }

  let body: { text?: unknown; agent_context?: AgentParseContext };
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_INPUT", "Invalid request.", 400);
  }

  const text = String(body.text ?? "").trim();
  if (text.length < 5) {
    return fail("INVALID_INPUT", "Message text is missing or too short.", 400);
  }

  try {
    const { parsed, confidence, cost_inr } = await parseSubmission(text, body.agent_context);
    return Response.json({ parsed, confidence, cost_inr });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.startsWith("PARSE_FAILED")) return fail("PARSE_FAILED", "The AI couldn't produce a clean result. Try again.", 500);
    return fail("CLAUDE_API_ERROR", "The AI service is unavailable right now. Try again.", 502);
  }
}
