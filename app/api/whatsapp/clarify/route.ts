import { supabaseAdmin as db } from "@/app/lib/supabase-server";
import { getAdminUserId } from "@/app/lib/ai/require-user";
import { generateClarificationMessage } from "@/app/lib/whatsapp-clarify";

export const dynamic = "force-dynamic";

function fail(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status });
}

export async function POST(req: Request) {
  if (!(await getAdminUserId(req))) return fail("UNAUTHORIZED", "Admins only.", 401);

  let body: { inbox_id?: string; questions?: unknown; agent_name?: string };
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_INPUT", "Invalid request.", 400);
  }

  const inboxId = String(body.inbox_id ?? "");
  const questions = Array.isArray(body.questions) ? body.questions.map(String) : [];
  if (!inboxId || questions.length === 0) {
    return fail("INVALID_INPUT", "inbox_id and at least one question are required.", 400);
  }

  const { data: inbox } = await db
    .from("whatsapp_inbox")
    .select("id, sender_phone, agent_id")
    .eq("id", inboxId)
    .maybeSingle();
  if (!inbox) return fail("INBOX_NOT_FOUND", "That inbox message no longer exists.", 404);

  const { message_text } = generateClarificationMessage(questions, body.agent_name ?? "");

  const { data: outbound } = await db
    .from("outbound_messages")
    .insert({
      to_phone: inbox.sender_phone,
      agent_id: inbox.agent_id,
      channel: "whatsapp",
      message_text,
      template_used: "clarification",
      context: { type: "clarification", inbox_id: inboxId },
      status: "pending",
    })
    .select("id")
    .maybeSingle();

  await db
    .from("whatsapp_inbox")
    .update({
      processed_status: "awaiting_clarification",
      clarification_sent_at: new Date().toISOString(),
      clarification_questions: questions,
    })
    .eq("id", inboxId);

  await db.from("agent_events").insert({
    agent_id: inbox.agent_id,
    event_type: "clarification_sent",
    inbox_id: inboxId,
  });

  return Response.json({ outbound_id: outbound?.id, message_text });
}
