import { useState } from "react";
import decksData from "./data/flashcards.json";

const NAVY = "#0c1f4a";
const decks = decksData.decks;
const nivLink = (ref) =>
  "https://www.biblegateway.com/passage/?search=" + encodeURIComponent(ref) + "&version=NIV";

const TEACHER = {
  Gendron: "Mike Gendron",
  Knechtle: "Cliffe Knechtle",
  Craig: "William Lane Craig",
  Turek: "Frank Turek",
  Koukl: "Greg Koukl",
  Platt: "David Platt",
  general: "",
};

export default function Flashcards({ onGoToGuide }) {
  const [deckIdx, setDeckIdx] = useState(0);
  const [mode, setMode] = useState("browse"); // "browse" | "quiz"
  const [open, setOpen] = useState({});       // card index -> expanded?
  const [revealed, setRevealed] = useState({}); // card index -> answer shown? (quiz mode)

  const reset = () => { setOpen({}); setRevealed({}); };
  const selectDeck = (i) => { setDeckIdx(i); reset(); };
  const switchMode = (m) => { setMode(m); reset(); };
  const toggle = (i) => setOpen((o) => ({ ...o, [i]: !o[i] }));
  const reveal = (i) => setRevealed((r) => ({ ...r, [i]: true }));

  const deck = decks[deckIdx];

  const modeBtn = (m, label) => (
    <button onClick={() => switchMode(m)} style={{
      flex: 1, padding: "8px 0", borderRadius: 10, cursor: "pointer", border: "none",
      background: mode === m ? "linear-gradient(135deg,#0c1f4a,#1e3a8a)" : "transparent",
      color: mode === m ? "#fff" : "#475569", fontWeight: 700, fontSize: 13,
    }}>{label}</button>
  );

  const Answer = ({ c }) => (
    <>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Say something like</div>
      <div style={{ fontSize: 15, color: "#111827", lineHeight: 1.5, fontWeight: 600 }}>{c.shortAnswer}</div>

      {c.keyScriptures && c.keyScriptures.length ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Scripture</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {c.keyScriptures.map((ref) => (
              <a key={ref} href={nivLink(ref)} target="_blank" rel="noreferrer"
                style={{ fontSize: 12.5, fontWeight: 700, color: "#1e3a8a", background: "#eff4ff", borderRadius: 8, padding: "5px 10px", textDecoration: "none" }}>
                {ref} <span style={{ opacity: 0.6 }}>NIV &rarr;</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      {c.deeper ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Why</div>
          <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55 }}>{c.deeper}</div>
        </div>
      ) : null}

      <div style={{ marginTop: 14 }}>
        <button onClick={onGoToGuide} style={{
          fontSize: 12, fontWeight: 700, color: "#3730a3", background: "#e0e7ff",
          border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer",
        }}>
          Go deeper{TEACHER[c.teacher] ? ` · ${TEACHER[c.teacher]}` : ""} &rarr;
        </button>
      </div>

      {c.watchOut ? (
        <div style={{ marginTop: 12, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "9px 12px", fontSize: 12.5, color: "#92400e" }}>
          <strong>Watch out:</strong> {c.watchOut}
        </div>
      ) : null}
    </>
  );

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: NAVY, letterSpacing: "-0.3px" }}>Questions &amp; Answers</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3, lineHeight: 1.5 }}>
          {mode === "browse"
            ? "Tap any question to see how to respond. Start with the Top 10 most common."
            : "Read the question, answer it in your head, then tap “Show answer” to check yourself."}
        </div>
      </div>

      {/* Browse / Quiz toggle */}
      <div style={{ display: "flex", gap: 4, background: "#e8edf6", borderRadius: 12, padding: 4, marginBottom: 14 }}>
        {modeBtn("browse", "📖 Browse")}
        {modeBtn("quiz", "🎯 Quiz me")}
      </div>

      {/* deck selector */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 14 }}>
        {decks.map((d, i) => (
          <button key={i} onClick={() => selectDeck(i)} style={{
            flexShrink: 0, padding: "7px 13px", borderRadius: 18, cursor: "pointer",
            border: i === deckIdx ? "none" : "1px solid #d6deec",
            background: i === deckIdx ? "linear-gradient(135deg,#0c1f4a,#1e3a8a)" : "#fff",
            color: i === deckIdx ? "#fff" : "#475569", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap",
          }}>{d.name} ({d.cards.length})</button>
        ))}
      </div>

      {/* question list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {deck.cards.map((c, i) => {
          const isOpen = !!open[i];
          const showAnswer = isOpen && (mode === "browse" || revealed[i]);
          return (
            <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #eef2f9", boxShadow: "0 1px 6px rgba(12,31,74,0.05)", overflow: "hidden" }}>
              <button onClick={() => toggle(i)} style={{
                width: "100%", textAlign: "left", background: "transparent", border: "none",
                cursor: "pointer", padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <span style={{ flex: 1 }}>
                  {c.context ? (
                    <span style={{ display: "block", fontSize: 11, fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{c.context}</span>
                  ) : null}
                  <span style={{ fontSize: 15, fontWeight: 700, color: NAVY, lineHeight: 1.4 }}>{c.front}</span>
                </span>
                <span style={{ color: "#9aa6b8", fontSize: 16, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", lineHeight: 1, marginTop: 2 }}>⌄</span>
              </button>

              {isOpen ? (
                <div style={{ padding: "0 16px 16px" }}>
                  {showAnswer ? (
                    <Answer c={c} />
                  ) : (
                    <button onClick={() => reveal(i)} style={{
                      width: "100%", padding: "11px 0", borderRadius: 10, cursor: "pointer",
                      border: "1.5px solid #1e3a8a", background: "#eff4ff", color: "#1e3a8a",
                      fontWeight: 800, fontSize: 14,
                    }}>Show answer &darr;</button>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
