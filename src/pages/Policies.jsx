import { useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { policies } from "../data/policies";

const DEBOUNCE_MS = 350;

export default function Policies() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(policies);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setLoading(false);
      setError(null);
      setResults(policies);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/search-policies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(body?.error || "Something went wrong. Please try again.");
        }
        // Ignore stale responses from a superseded debounce cycle.
        if (requestId === requestIdRef.current) {
          setResults(body.results);
        }
      } catch (err) {
        if (requestId === requestIdRef.current) {
          setError(err.message);
          setResults([]);
        }
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <>
      <div className="page-head-row">
        <div>
          <div className="eyebrow">Academics</div>
          <h1 className="page-title">Policy Handbook</h1>
          <p className="page-sub">
            Search the student handbook for rules on attendance, grading, and
            academic policy. Type a question and get the most relevant
            sections instantly.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box" style={{ maxWidth: 420 }}>
          {loading ? <Loader2 size={15} className="spin" /> : <Search size={15} />}
          <input
            placeholder="Search policies — try 'exam leave' or 'plagiarism'…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="empty-state">{error}</p>}

      {!error && !loading && results.length === 0 && (
        <p className="empty-state">No policy matched that search.</p>
      )}

      {!error &&
        results.map((p) => (
          <div className="policy-card" key={p.id}>
            <div className="policy-head">
              <h4>{p.title}</h4>
              {"score" in p && (
                <span className="badge ok">
                  <span className="dot" /> match score {p.score.toFixed(2)}
                </span>
              )}
            </div>
            <p>{p.text}</p>
          </div>
        ))}
    </>
  );
}
