import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const NAVY = "#0c1f4a";

const STARTERS = [
  "What do I say to a Catholic woman?",
  "A Catholic told me “we believe in the same God” — how do I respond?",
  "What are the differences between Jehovah's Witnesses and Christians?",
  "Why does God allow suffering?",
  "How do I start a spiritual conversation with a stranger?",
  "I'm talking to an atheist right now — what do I say?",
];

export default function Ask() {
  const [messages, setMessages] = useState([]); // {role, content}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || loading) return;
    setError("");
    const next = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        // Happens in local dev (no serverless functions) — the SPA returns HTML.
        throw new Error("offline");
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "request failed");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(
        e.message === "offline"
          ? "The assistant only runs on the live site (it needs the server). Try it at your deployed URL."
          : typeof e.message === "string" && e.message.length < 200
          ? e.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: NAVY, letterSpacing: "-0.3px" }}>Ask Anything</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3, lineHeight: 1.5 }}>
          Ask any question about evangelism or faith — what to say in a conversation, how to answer a hard question, or how to share the gospel.
        </div>
      </div>

      {messages.length === 0 && !loading ? (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Try asking</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {STARTERS.map((s) => (
              <button key={s} onClick={() => send(s)} style={{
                textAlign: "left", background: "#fff", border: "1px solid #e6ebf4", borderRadius: 12,
                padding: "12px 14px", fontSize: 14, color: "#1f2937", cursor: "pointer", lineHeight: 1.4,
                boxShadow: "0 1px 6px rgba(12,31,74,0.05)",
              }}>{s}</button>
            ))}
          </div>
        </div>
      ) : null}

      {/* conversation */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} style={{ alignSelf: "flex-end", maxWidth: "85%", background: "linear-gradient(135deg,#0c1f4a,#1e3a8a)", color: "#fff", borderRadius: "16px 16px 4px 16px", padding: "10px 14px", fontSize: 14.5, lineHeight: 1.45 }}>
              {m.content}
            </div>
          ) : (
            <div key={i} style={{ alignSelf: "flex-start", maxWidth: "92%", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", boxShadow: "0 2px 14px rgba(12,31,74,0.07)", border: "1px solid #eef2f9" }}>
              <div className="md-guide" style={{ fontSize: 14.5 }}>
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          )
        )}
        {loading ? (
          <div style={{ alignSelf: "flex-start", background: "#fff", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", boxShadow: "0 2px 14px rgba(12,31,74,0.07)", border: "1px solid #eef2f9", color: "#9aa6b8", fontSize: 14 }}>
            Thinking…
          </div>
        ) : null}
        <div ref={scrollRef} />
      </div>

      {error ? (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#92400e", marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      {/* input */}
      <div style={{ position: "sticky", bottom: 0, paddingTop: 6, paddingBottom: 6, background: "#f1f5f9" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask anything about evangelism or faith…"
            rows={1}
            style={{ flex: 1, resize: "none", border: "1px solid #d6deec", borderRadius: 12, padding: "12px 14px", fontSize: 14.5, fontFamily: "inherit", lineHeight: 1.4, outline: "none", maxHeight: 120 }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            flexShrink: 0, background: loading || !input.trim() ? "#9aa6b8" : "linear-gradient(135deg,#0c1f4a,#1e3a8a)",
            color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontWeight: 700, fontSize: 14,
            cursor: loading || !input.trim() ? "default" : "pointer",
          }}>Send</button>
        </div>
        <div style={{ fontSize: 11, color: "#9aa6b8", textAlign: "center", marginTop: 8, lineHeight: 1.5 }}>
          A study aid, not a substitute for the Bible, prayer, or your local church. In crisis? Call or text 988.
        </div>
      </div>
    </div>
  );
}
