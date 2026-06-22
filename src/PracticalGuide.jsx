import ReactMarkdown from "react-markdown";
import guide from "./data/practical-guide.md?raw";

const NAVY = "#0c1f4a";

export default function PracticalGuide() {
  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: NAVY, letterSpacing: "-0.3px" }}>Field Guide</div>
      </div>
      <div style={{ background: "#fff", borderRadius: 18, padding: "18px 18px 24px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
        <div className="md-guide">
          <ReactMarkdown>{guide}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
