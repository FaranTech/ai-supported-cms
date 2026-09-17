// This function runs on Vercel's server, never in the browser.
// GEMINI_API_KEY lives only here, as a server environment variable — it is
// never sent to or readable by the React app.
//
// Live AI mode is a real MCP client: Gemini decides which tool to call and
// fills in the arguments, but the tool itself runs behind a separate MCP
// server (api/mcp.js), reached over the Model Context Protocol's Streamable
// HTTP transport — not a local switch statement.

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { isSameOrigin, validateQuery } from "./lib/guard.js";

// Keeps Gemini's free-text fallback (when no tool matches) scoped to this
// app's purpose, instead of letting the search bar double as a general
// Gemini relay for unrelated questions.
const SYSTEM_INSTRUCTION =
  "You are the registrar's office assistant for this college's CMS demo. " +
  "Only help with questions about this college's students, courses, " +
  "attendance, grades, enrollment, or academic policies, using the " +
  "available tools when relevant. If asked something unrelated to the " +
  "college (general knowledge, coding help, creative writing, other " +
  "topics), politely decline and say you can only help with registrar " +
  "topics here.";

// MCP tool input schemas are plain JSON Schema; Gemini's function-calling
// schema is the same shape but with SchemaType enum values instead of
// lowercase JSON Schema type strings. Convert one to the other so the tool
// list can come straight from the MCP server instead of being hand-written.
function toGeminiSchema(jsonSchema) {
  const typeMap = {
    object: SchemaType.OBJECT,
    string: SchemaType.STRING,
    number: SchemaType.NUMBER,
    integer: SchemaType.INTEGER,
    boolean: SchemaType.BOOLEAN,
    array: SchemaType.ARRAY,
  };

  if (!jsonSchema || typeof jsonSchema !== "object") {
    return { type: SchemaType.OBJECT, properties: {} };
  }

  const schema = { type: typeMap[jsonSchema.type] ?? SchemaType.STRING };
  if (jsonSchema.description) schema.description = jsonSchema.description;
  if (jsonSchema.properties) {
    schema.properties = Object.fromEntries(
      Object.entries(jsonSchema.properties).map(([key, value]) => [
        key,
        toGeminiSchema(value),
      ])
    );
  }
  if (jsonSchema.items) schema.items = toGeminiSchema(jsonSchema.items);
  if (jsonSchema.required?.length) schema.required = jsonSchema.required;
  return schema;
}

function mcpUrlFromRequest(req) {
  const proto = req.headers["x-forwarded-proto"] || "http";
  const host = req.headers.host;
  return new URL(`${proto}://${host}/api/mcp`);
}

// The model provider's errors carry a clean numeric `status`, but `message`
// is a giant single-line dump of its raw response (often a nested JSON blob
// of quota/violation details, naming the provider and model). None of that
// is something an end user asking the registrar a question should see — map
// it to a short, in-character message instead. The real error is still
// logged server-side (see the catch block below) for actual debugging.
function friendlyErrorMessage(err) {
  switch (err.status) {
    case 429:
      return "The registrar's line is busy right now — please try again in a minute.";
    case 503:
      return "The registrar's office is a bit overwhelmed at the moment. Please try again shortly.";
    default:
      return "Sorry, I couldn't get an answer to that just now. Please try again.";
  }
}

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

  const client = new Client({ name: "ask-the-registrar", version: "1.0.0" });

  try {
    const transport = new StreamableHTTPClientTransport(mcpUrlFromRequest(req));
    await client.connect(transport);

    const { tools } = await client.listTools();
    const toolDeclarations = tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: toGeminiSchema(t.inputSchema),
    }));

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      // "gemini-flash-latest" resolves to a preview model with a 20
      // requests/day free-tier cap. The "lite" alias tracks a much cheaper
      // model with a far higher free daily quota — plenty for this demo.
      model: "gemini-flash-lite-latest",
      tools: [{ functionDeclarations: toolDeclarations }],
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent(query);
    const call = result.response.functionCalls()?.[0];

    if (!call) {
      return res.status(200).json({ tool: null, result: result.response.text() });
    }

    const mcpResult = await client.callTool({
      name: call.name,
      arguments: call.args,
    });
    if (mcpResult.isError) {
      throw new Error(mcpResult.content?.[0]?.text || "MCP tool call failed");
    }
    const toolResult = JSON.parse(mcpResult.content?.[0]?.text ?? "null");

    return res.status(200).json({ tool: call.name, result: toolResult });
  } catch (err) {
    console.error("[api/ask] request failed:", err);
    return res.status(500).json({ error: friendlyErrorMessage(err) });
  } finally {
    await client.close();
  }
}
