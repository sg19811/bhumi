// Builds the WhatsApp clarification message an admin sends to an agent when a
// submission is missing critical fields. Spec sections 5.3 / 6.3.

import { clarificationMessage } from "@/app/lib/message-templates";

export function generateClarificationMessage(questions: string[], agentName: string): { message_text: string } {
  const cleaned = questions.map((q) => q.trim()).filter(Boolean).slice(0, 5);
  return { message_text: clarificationMessage({ agentName: agentName || "there", questions: cleaned }) };
}
