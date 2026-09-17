import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

function attendanceClass(pct) {
  if (pct < 75) return "bad";
  if (pct >= 90) return "ok";
  return "warn";
}

function AttendanceBadge({ value }) {
  return (
    <span className={"badge " + attendanceClass(value)}>
      <span className="dot" /> {value}%
    </span>
  );
}

// Renders each MCP-style tool's result in a shape that matches how the rest
// of the app displays that data (course rows, attendance bars, badges),
// instead of dumping the raw JSON payload.
function ResultView({ trace }) {
  const { tool, result } = trace;

  if (result === null || result === undefined) {
    return <div className="trace-result">No matching record found.</div>;
  }

  if (typeof result === "string") {
    return <div className="trace-result">{result}</div>;
  }

  if (tool === "get_attendance" && "attendance" in result) {
    return (
      <div className="result-card">
        <div className="result-title-row">
          <div className="result-title">{result.name}</div>
          <AttendanceBadge value={result.attendance} />
        </div>
      </div>
    );
  }

  if (tool === "get_grades" && Array.isArray(result.courses)) {
    return (
      <div className="result-card">
        <div className="result-title-row">
          <div className="result-title">{result.name}</div>
          <span className="info-pill">GPA {result.gpa}</span>
        </div>
        <div className="student-detail" style={{ margin: "10px 0 0" }}>
          {result.courses.map((c) => (
            <div className="course-row" key={c.code}>
              <span>
                {c.code} — {c.title}
              </span>
              <span style={{ fontWeight: 600 }}>{c.grade}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tool === "get_low_attendance_students" && Array.isArray(result)) {
    if (result.length === 0) {
      return (
        <div className="trace-result">No students below the threshold.</div>
      );
    }
    return (
      <div className="result-list">
        {result.map((s) => (
          <div className="bar-row" key={s.name}>
            <span className="bar-name">{s.name}</span>
            <AttendanceBadge value={s.attendance} />
          </div>
        ))}
      </div>
    );
  }

  if (tool === "get_enrollment" && "capacity" in result) {
    const pct = Math.round((result.enrolled / result.capacity) * 100);
    return (
      <div className="result-card">
        <div className="result-title-row">
          <div className="result-title">
            {result.code} — {result.title}
          </div>
          <span className="info-pill">
            {result.enrolled}/{result.capacity} seats
          </span>
        </div>
        <div className="bar-track" style={{ marginTop: 10 }}>
          <div
            className={"bar-fill" + (pct >= 95 ? " low" : "")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  if (tool === "get_performance_trend" && Array.isArray(result.students)) {
    return (
      <div className="result-card">
        <p style={{ margin: "0 0 10px", lineHeight: 1.6 }}>
          {result.summary}
        </p>
        {result.students.map((s) => (
          <div className="bar-row" key={s.name}>
            <span className="bar-name">{s.name}</span>
            <div className="bar-track">
              <div
                className={"bar-fill" + (s.attendance < 75 ? " low" : "")}
                style={{ width: `${s.attendance}%` }}
              />
            </div>
            <span className="bar-value">{s.attendance}%</span>
            <span className="info-pill" style={{ marginLeft: 8 }}>
              GPA {s.gpa}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (tool === "search_policy_docs" && Array.isArray(result)) {
    return (
      <div className="result-list">
        {result.map((p) => (
          <div className="policy-card" key={p.id}>
            <div className="policy-title">{p.title}</div>
            <div className="policy-text">{p.text}</div>
          </div>
        ))}
      </div>
    );
  }

  // Unrecognized shape (e.g. live-mode free-text or a future tool) — still
  // avoid a raw single-line JSON dump, keep it readable.
  return (
    <pre className="trace-result-json">{JSON.stringify(result, null, 2)}</pre>
  );
}

const SUGGESTIONS = [
  "What's Hamza's attendance?",
  "Show Fatima's grades",
  "Which students are below 75% attendance?",
  "What's the policy on medical leave for exams?",
  "Is CS301 full?",
  "Why is performance falling for some students?",
];

export default function Ask() {
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingQuery, setPendingQuery] = useState(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log, pendingQuery]);

  async function runQuery(text) {
    if (!text.trim() || loading) return;
    setLoading(true);
    setPendingQuery(text);
    setInput("");

    // Calls our serverless function, which acts as an MCP client and an
    // MCP server (api/mcp.js) behind it — keeps the Gemini key server-side.
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error || "Something went wrong. Please try again.");
      }
      setLog((l) => [...l, { query: text, trace: body }]);
    } catch (err) {
      // The server already returns a plain, in-character message (see
      // api/ask.js's friendlyErrorMessage) — no provider/technical details
      // ever reach this trace.
      setLog((l) => [
        ...l,
        { query: text, trace: { tool: null, result: err.message } },
      ]);
    } finally {
      setLoading(false);
      setPendingQuery(null);
    }
  }

  return (
    <div className="ask-page">
      <div className="page-head-row">
        <div>
          <div className="eyebrow">Assistant</div>
          <h1 className="page-title">Ask the Registrar</h1>
          <p className="page-sub">
            Type a question in plain English and get an answer — grades,
            attendance, enrollment, or policy lookups.
          </p>
        </div>
      </div>

      <div className="card card-pad">
        {log.length === 0 && !pendingQuery && (
          <>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="suggestion-chip"
                  onClick={() => runQuery(s)}
                >
                  {s}
                </button>
              ))}
            </div>
            <p className="empty-state">
              Pick a suggestion above or type your own question below.
            </p>
          </>
        )}

        <div className="trace-log">
          {log.map((entry, i) => (
            <div className="trace-entry" key={i}>
              <div className="trace-q">{entry.query}</div>
              <div className="trace-body">
                <div className="trace-result">
                  <ResultView trace={entry.trace} />
                </div>
              </div>
            </div>
          ))}
          {pendingQuery && (
            <div className="trace-entry">
              <div className="trace-q">{pendingQuery}</div>
              <div className="trace-body">
                <div className="trace-tool-line pending-line">
                  <Loader2 size={13} className="spin" />
                  Looking that up for you — this can take a little while,
                  hang tight.
                </div>
              </div>
            </div>
          )}
          <div ref={logEndRef} />
        </div>

        <div className="ask-input-row">
          <input
            placeholder="Ask a question…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runQuery(input)}
            disabled={loading}
          />
          <button onClick={() => runQuery(input)} disabled={loading}>
            {loading ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
