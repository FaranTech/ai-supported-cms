// Lightweight, no-infra abuse guardrails for the public /api/ask and
// /api/search-policies endpoints. These don't stop a determined attacker
// who spoofs headers — real protection needs auth + a rate limiter (e.g.
// Upstash Redis) in front of these routes. This just raises the bar above
// "anyone can curl our Gemini key for free" and caps cost per request.

export const MAX_QUERY_LENGTH = 300;

// Real browsers send Origin and/or Referer on same-origin fetch POSTs.
// Scripts/curl/Postman usually send neither. Rejecting "neither present"
// blocks naive scripted abuse without touching legitimate UI traffic; a
// present-but-mismatched host blocks other sites embedding this API.
export function isSameOrigin(req) {
  const host = req.headers.host;
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  if (referer) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  return false;
}

export function validateQuery(query) {
  if (!query || typeof query !== "string" || !query.trim()) {
    return "Missing query";
  }
  if (query.length > MAX_QUERY_LENGTH) {
    return `Query too long (max ${MAX_QUERY_LENGTH} characters)`;
  }
  return null;
}
