import { SYSTEM_PROMPT } from "./_systemPrompt.js";

// Edge runtime: near-zero cold start + native streaming.
export const config = { runtime: "edge" };

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const MAX_TOKENS = 2048;
const MAX_TURNS = 12;
const MAX_CHARS = 4000;

const json = (obj, status) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req) {
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(
      {
        error:
          "The assistant isn't connected yet. Add ANTHROPIC_API_KEY in the Vercel project's Environment Variables, then redeploy.",
      },
      503
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  let messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages && typeof body.question === "string") {
    messages = [{ role: "user", content: body.question }];
  }
  messages = (messages || [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return json({ error: "Please enter a question." }, 400);
  }

  // Call Anthropic with streaming enabled.
  let upstream;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: true,
        system: [
          { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        ],
        messages,
      }),
    });
  } catch {
    return json({ error: "Couldn't reach the assistant. Please try again." }, 502);
  }

  if (!upstream.ok || !upstream.body) {
    return json({ error: "The assistant is busy right now. Please try again in a moment." }, 502);
  }

  // Parse Anthropic's SSE stream and re-emit just the text, token by token.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const evt = JSON.parse(payload);
              if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                controller.enqueue(encoder.encode(evt.delta.text));
              }
            } catch {
              /* ignore partial/non-JSON lines */
            }
          }
        }
      } catch {
        controller.enqueue(encoder.encode("\n\n[Sorry — the answer was interrupted. Please try again.]"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
