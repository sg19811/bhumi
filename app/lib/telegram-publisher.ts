// Telegram Bot API publisher. SERVER-ONLY (reads bot tokens from env). No npm
// package — direct fetch. Consumed by the Phase 2 batch-publish flow.
// See growth-engine-spec-aggressive-v2.md §11.2.

export interface TelegramPublishOpts {
  channelInternalId: string;            // e.g. @AcrehubKarnataka or -1001234567890
  botTokenEnvVar: string;               // name of the env var holding the bot token
  text: string;
  parseMode?: "Markdown" | "HTML" | "MarkdownV2";
}

export interface TelegramPublishResult {
  message_id: number;
  success: boolean;
  error?: string;
}

/** Post one message to a Telegram channel via the Bot API. */
export async function publishToTelegram(opts: TelegramPublishOpts): Promise<TelegramPublishResult> {
  const token = process.env[opts.botTokenEnvVar];
  if (!token) {
    return { message_id: 0, success: false, error: `Bot token env var ${opts.botTokenEnvVar} not set` };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: opts.channelInternalId,
        text: opts.text,
        parse_mode: opts.parseMode ?? "Markdown",
        disable_web_page_preview: false,
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      return { message_id: 0, success: false, error: data.description ?? "Unknown Telegram API error" };
    }
    return { message_id: data.result.message_id, success: true };
  } catch (e) {
    return { message_id: 0, success: false, error: e instanceof Error ? e.message : "Telegram fetch failed" };
  }
}

/**
 * Publish a batch sequentially with a delay between posts (Telegram rate
 * limits). Default 30s gap, per spec §3.3.
 */
export async function publishBatch(
  posts: TelegramPublishOpts[],
  delayMs = 30000
): Promise<TelegramPublishResult[]> {
  const results: TelegramPublishResult[] = [];
  for (let i = 0; i < posts.length; i++) {
    results.push(await publishToTelegram(posts[i]));
    if (i < posts.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return results;
}
