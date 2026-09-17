// Real RAG: embeds the query with Gemini's embedding model and ranks the
// policy documents by cosine similarity against precomputed embeddings,
// instead of the offline demo's keyword-overlap search
// (src/data/policies.js#searchPolicies).

import { policies } from "../../src/data/policies.js";
import { policyEmbeddings } from "../../src/data/policy-embeddings.js";

const EMBEDDING_MODEL = "gemini-embedding-001";

function cosineSimilarity(a, b) {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export async function searchPoliciesSemantic(genAI, query, topK = 2) {
  if (policyEmbeddings.length === 0) {
    throw new Error(
      "No policy embeddings found — run `node --env-file=.env scripts/embed-policies.mjs` first."
    );
  }

  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const { embedding } = await model.embedContent(query);
  const queryVector = embedding.values;

  return policyEmbeddings
    .map(({ id, vector }) => ({
      ...policies.find((p) => p.id === id),
      score: cosineSimilarity(queryVector, vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
