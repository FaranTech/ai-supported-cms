// Serverless endpoint for the Policy Handbook page's search bar. Wraps the
// same real RAG path (embeddings + cosine similarity) that the "Ask the
// Registrar" chat reaches via the search_policy_docs MCP tool
// (api/mcp.js), so the two search experiences use identical retrieval.

import { GoogleGenerativeAI } from "@google/generative-ai";
import { searchPoliciesSemantic } from "./lib/rag.js";
import { isSameOrigin, validateQuery } from "./lib/guard.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  if (!isSameOrigin(req)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not set on server" });
  }

  const { query } = req.body || {};
  const queryError = validateQuery(query);
  if (queryError) return res.status(400).json({ error: queryError });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const results = await searchPoliciesSemantic(genAI, query, 6);
    const relevant = results.filter((r) => r.score > 0.5);
    return res.status(200).json({ results: relevant });
  } catch (err) {
    console.error("[api/search-policies] request failed:", err);
    return res.status(500).json({ error: "Couldn't search policies right now. Please try again." });
  }
}
