import prayers from "./data/prayer.json";

const NAVY = "#0c1f4a";
const nivLink = (ref) =>
  "https://www.biblegateway.com/passage/?search=" + encodeURIComponent(ref) + "&version=NIV";

export default function Prayer() {
  // group verses by theme, preserving order
  const themes = [];
  const byTheme = {};
  for (const v of prayers) {
    if (!byTheme[v.theme]) { byTheme[v.theme] = []; themes.push(v.theme); }
    byTheme[v.theme].push(v);
  }

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: NAVY, letterSpacing: "-0.3px" }}>Pray the Scripture</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3, lineHeight: 1.5 }}>
          Before you go, pray. Evangelism is spiritual warfare, and God is faithful to His own Word. Pray these Scriptures back to Him.
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#0c1f4a,#1e3a8a)", borderRadius: 14, padding: "14px 16px", marginBottom: 18 }}>
        <div style={{ color: "#dbeafe", fontSize: 13.5, lineHeight: 1.55, fontStyle: "italic" }}>
          “Not by might, nor by power, but by my Spirit,” says the LORD. — Zechariah 4:6
        </div>
      </div>

      {themes.map((theme) => (
        <div key={theme} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#1e3a8a", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>{theme}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {byTheme[theme].map((v) => (
              <div key={v.reference} style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 2px 16px rgba(12,31,74,0.07)", border: "1px solid #eef2f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <div style={{ fontWeight: 800, color: NAVY, fontSize: 15.5 }}>{v.reference}</div>
                  <a href={nivLink(v.reference)} target="_blank" rel="noreferrer" style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: "#1e3a8a", textDecoration: "none" }}>
                    Read in NIV &rarr;
                  </a>
                </div>

                <div style={{ marginTop: 8, fontSize: 14.5, color: "#374151", lineHeight: 1.55, fontStyle: "italic" }}>
                  “{v.verseText}”
                  <span style={{ fontStyle: "normal", color: "#9aa6b8", fontSize: 11.5, fontWeight: 600 }}> &nbsp;({v.translation})</span>
                </div>

                <div style={{ marginTop: 12, background: "#eff4ff", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Pray it</div>
                  <div style={{ fontSize: 13.5, color: "#0c1f4a", lineHeight: 1.5 }}>{v.prayerModel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ fontSize: 11.5, color: "#9aa6b8", textAlign: "center", marginTop: 4, lineHeight: 1.5 }}>
        Verse text shown in the public-domain World English Bible (WEB). Tap “Read in NIV” for the NIV.
      </div>
    </div>
  );
}
