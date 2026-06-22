import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./_systemPrompt.js";

// Model is configurable via env var. Default: Sonnet 4.6 (great balance of
// quality and cost). Set ANTHROPIC_MODEL=claude-opus-4-8 in Vercel for max quality.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const MAX_TOKENS = 2048;
const MAX_TURNS = 12;        // cap conversation length sent to the model
const MAX_CHARS = 4000;      // cap per-message length

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(503).json({
      error:
        "The assistant isn't connected yet. Add ANTHROPIC_API_KEY in the Vercel project's Environment Variables, then redeploy.",
    });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};

    // Accept either a full {messages:[...]} history or a single {question:"..."}.
    let messages = Array.isArray(body.messages) ? body.messages : null;
    if (!messages && typeof body.question === "string") {
      messages = [{ role: "user", content: body.question }];
    }

    // Sanitize: keep only valid user/assistant string turns, cap count + length.
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
      res.status(400).json({ error: "Please enter a question." });
      return;
    }

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      ],
      messages,
    });

    const reply = (response.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    res.status(200).json({
      reply: reply || "Sorry, I couldn't put a response together just now. Please try again.",
    });
  } catch (err) {
    console.error("ask error:", err);
    res.status(500).json({
      error: "Something went wrong reaching the assistant. Please try again in a moment.",
    });
  }
}
