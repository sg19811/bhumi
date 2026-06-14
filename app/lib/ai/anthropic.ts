// Server-only Claude helper. Calls the Anthropic Messages API via fetch (no SDK
// dependency, keeping the project lean). The API key is read from a server-only
// env var (ANTHROPIC_API_KEY — never NEXT_PUBLIC_) and never reaches the browser.
// Import this ONLY from route handlers / server code.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// Current models (see project context). Sonnet for quality, Haiku for quick/cheap.
export const AI_MODELS = {
  report: "claude-sonnet-4-6",
  assist: "claude-haiku-4-5-20251001",
} as const;

export type ClaudeUsage = { input_tokens: number; output_tokens: number };
export type ClaudeResult =
  | { ok: true; text: string; usage?: ClaudeUsage }
  | { ok: false; error: string; status?: number };

export function aiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function callClaude(opts: {
  prompt: string;
  system?: string;
  model?: string;
  maxTokens?: number;
}): Promise<ClaudeResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, error: "AI isn't configured yet. Add ANTHROPIC_API_KEY to enable it.", status: 503 };

  try {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model ?? AI_MODELS.report,
        max_tokens: opts.maxTokens ?? 1024,
        ...(opts.system ? { system: opts.system } : {}),
        messages: [{ role: "user", content: opts.prompt }],
      }),
    });

    if (!res.ok) {
      // Don't leak provider internals/keys to the client.
      return { ok: false, error: `The AI service returned an error (${res.status}).`, status: 502 };
    }
    const data = await res.json();
    const text = Array.isArray(data?.content)
      ? data.content.filter((c: { type?: string }) => c.type === "text").map((c: { text?: string }) => c.text ?? "").join("\n").trim()
      : "";
    if (!text) return { ok: false, error: "The AI returned an empty response. Please try again.", status: 502 };
    const usage = data?.usage && typeof data.usage.input_tokens === "number"
      ? { input_tokens: data.usage.input_tokens, output_tokens: data.usage.output_tokens ?? 0 }
      : undefined;
    return { ok: true, text, usage };
  } catch {
    return { ok: false, error: "Couldn't reach the AI service. Please try again.", status: 502 };
  }
}
