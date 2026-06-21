import { useState, useEffect } from "react";
import decksData from "./data/flashcards.json";

const NAVY = "#0c1f4a";
const decks = decksData.decks;
const nivLink = (ref) =>
  "https://www.biblegateway.com/passage/?search=" + encodeURIComponent(ref) + "&version=NIV";

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Flashcards() {
  const [deckIdx, setDeckIdx] = useState(0);
  const [queue, setQueue] = useState([]);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ got: 0, shaky: 0, missed: 0 });
  const [started, setStarted] = useState(0); // count of cards rated this round

  const startDeck = (i) => {
    setDeckIdx(i);
    setQueue(shuffle(decks[i].cards.map((_, idx) => idx)));
    setFlipped(false);
    setStats({ got: 0, shaky: 0, missed: 0 });
    setStarted(0);
  };
  useEffect(() => { startDeck(0); }, []);

  const card = queue.length ? decks[deckIdx].cards[queue[0]] : null;

  const rate = (level) => {
    setStats((s) => ({ ...s, [level]: s[level] + 1 }));
    setStarted((n) => n + 1);
    setQueue((q) => {
      const [cur, ...rest] = q;
      if (level === "got") return rest;
      if (level === "shaky") {
        const pos = Math.min(3, rest.length);
        return [...rest.slice(0, pos), cur, ...rest.slice(pos)];
      }
      return [...rest, cur]; // missed -> back of the deck
    });
    setFlipped(false);
  };

  const pill = (key, label, active, onClick) => (
    <button key={key} onClick={onClick} style={{
      flexShrink: 0, padding: "7px 13px", borderRadius: 18, cursor: "pointer",
      border: active ? "none" : "1px solid #d6deec",
      background: active ? "linear-gradient(135deg,#0c1f4a,#1e3a8a)" : "#fff",
      color: active ? "#fff" : "#475569", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap",
    }}>{label}</button>
  );

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: NAVY, letterSpacing: "-0.3px" }}>Practice Flashcards</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>
          Read the question, answer it out loud, then flip. Rate yourself so the tricky ones come back around.
        </div>
      </div>

      {/* deck selector */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, marginBottom: 14 }}>
        {decks.map((d, i) => pill(i, `${d.name} (${d.cards.length})`, i === deckIdx, () => startDeck(i)))}
      </div>

      {card ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, fontSize: 12.5, color: "#6b7280" }}>
            <span>{queue.length} card{queue.length === 1 ? "" : "s"} left</span>
            <span><span style={{ color: "#16a34a", fontWeight: 700 }}>{stats.got} got</span> · <span style={{ color: "#d97706", fontWeight: 700 }}>{stats.shaky} shaky</span> · <span style={{ color: "#dc2626", fontWeight: 700 }}>{stats.missed} missed</span></span>
          </div>

          {/* card */}
          <div
            onClick={() => setFlipped((f) => !f)}
            style={{
              background: "#fff", borderRadius: 18, padding: 22, minHeight: 230,
              boxShadow: "0 4px 22px rgba(12,31,74,0.10)", cursor: "pointer",
              border: "1px solid #eef2f9", display: "flex", flexDirection: "column",
            }}
          >
            {!flipped ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {card.context ? (
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>{card.context}</div>
                ) : null}
                <div style={{ fontSize: 19, fontWeight: 700, color: NAVY, lineHeight: 1.4 }}>{card.front}</div>
                <div style={{ marginTop: 18, fontSize: 12.5, color: "#9aa6b8", fontWeight: 600 }}>Tap to reveal &darr;</div>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Say something like</div>
                <div style={{ fontSize: 16, color: "#111827", lineHeight: 1.5, fontWeight: 600 }}>{card.shortAnswer}</div>

                {card.keyScriptures && card.keyScriptures.length ? (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Scripture</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                      {card.keyScriptures.map((ref) => (
                        <a key={ref} href={nivLink(ref)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: 12.5, fontWeight: 700, color: "#1e3a8a", background: "#eff4ff", borderRadius: 8, padding: "5px 10px", textDecoration: "none" }}>
                          {ref} <span style={{ opacity: 0.6 }}>NIV &rarr;</span>
                        </a>
                      ))}
                    </div>
                  </div>
                ) : null}

                {card.deeper ? (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Why</div>
                    <div style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.55 }}>{card.deeper}</div>
                  </div>
                ) : null}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                  {card.teacher ? (
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#3730a3", background: "#e0e7ff", borderRadius: 8, padding: "4px 9px" }}>Go deeper: {card.teacher}</span>
                  ) : null}
                </div>

                {card.watchOut ? (
                  <div style={{ marginTop: 12, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 10, padding: "9px 12px", fontSize: 12.5, color: "#92400e" }}>
                    <strong>Watch out:</strong> {card.watchOut}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* controls */}
          {flipped ? (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => rate("missed")} style={rateBtn("#dc2626", "#fef2f2")}>Missed</button>
              <button onClick={() => rate("shaky")} style={rateBtn("#d97706", "#fffbeb")}>Shaky</button>
              <button onClick={() => rate("got")} style={rateBtn("#16a34a", "#f0fdf4")}>Got it</button>
            </div>
          ) : (
            <div style={{ marginTop: 12, textAlign: "center", fontSize: 12.5, color: "#9aa6b8" }}>
              Answer it in your head first, then tap the card.
            </div>
          )}
        </>
      ) : (
        <div style={{ background: "#fff", borderRadius: 18, padding: "40px 22px", textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <div style={{ fontWeight: 800, color: NAVY, fontSize: 18 }}>Deck complete!</div>
          <div style={{ fontSize: 13.5, color: "#6b7280", marginTop: 6 }}>
            You reviewed {started} card{started === 1 ? "" : "s"} — {stats.got} solid, {stats.shaky} shaky, {stats.missed} to revisit.
          </div>
          <button onClick={() => startDeck(deckIdx)} style={{ marginTop: 18, background: "linear-gradient(135deg,#0c1f4a,#1e3a8a)", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            Practice again →
          </button>
        </div>
      )}
    </div>
  );
}

function rateBtn(color, bg) {
  return {
    flex: 1, padding: "13px 0", borderRadius: 12, cursor: "pointer",
    border: `1.5px solid ${color}`, background: bg, color, fontWeight: 800, fontSize: 14,
  };
}
