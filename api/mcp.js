// A real MCP server exposing the registrar's tools over the Model Context
// Protocol (Streamable HTTP transport, stateless mode). This is what
// api/ask.js's Gemini client actually talks to in Live AI mode — tool
// execution goes through MCP's JSON-RPC "tools/call", not a local switch
// statement. Runs as its own Vercel serverless function, and can also be
// pointed at directly from an MCP inspector or Claude Desktop.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import {
  getAttendance,
  getGrades,
  getLowAttendanceStudents,
  getEnrollment,
  getPerformanceTrend,
} from "../src/lib/tools.js";
import { searchPoliciesSemantic } from "./lib/rag.js";

function textResult(value) {
  return { content: [{ type: "text", text: JSON.stringify(value) }] };
}

function buildServer() {
  const server = new McpServer({
    name: "college-cms-registrar",
    version: "1.0.0",
  });

  server.registerTool(
    "get_attendance",
    {
      title: "Get attendance",
      description: "Get a specific student's attendance percentage by name.",
      inputSchema: {
        name: z.string().describe("Student's name, or part of it"),
      },
    },
    async ({ name }) => textResult(getAttendance(name))
  );

  server.registerTool(
    "get_grades",
    {
      title: "Get grades",
      description: "Get a specific student's GPA and course grades by name.",
      inputSchema: {
        name: z.string().describe("Student's name, or part of it"),
      },
    },
    async ({ name }) => textResult(getGrades(name))
  );

  server.registerTool(
    "get_low_attendance_students",
    {
      title: "Get low-attendance students",
      description:
        "List all students whose attendance is below a threshold percentage.",
      inputSchema: {
        threshold: z
          .number()
          .optional()
          .describe("Attendance percentage cutoff, default 75"),
      },
    },
    async ({ threshold }) => textResult(getLowAttendanceStudents(threshold ?? 75))
  );

  server.registerTool(
    "get_enrollment",
    {
      title: "Get enrollment",
      description: "Get enrollment and capacity for a course by its code, e.g. CS301.",
      inputSchema: { courseCode: z.string() },
    },
    async ({ courseCode }) => textResult(getEnrollment(courseCode))
  );

  server.registerTool(
    "get_performance_trend",
    {
      title: "Get performance trend",
      description:
        "Get an analysis correlating attendance and GPA trends across all students.",
      inputSchema: {},
    },
    async () => textResult(getPerformanceTrend())
  );

  server.registerTool(
    "search_policy_docs",
    {
      title: "Search policy documents",
      description:
        "Search the student handbook / policy documents for rules on leave, attendance, probation, plagiarism, fees, or holidays. Uses real semantic (embedding) search, not keyword matching.",
      inputSchema: { query: z.string().max(300) },
    },
    async ({ query }) => {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY not set on the MCP server.");

      const genAI = new GoogleGenerativeAI(apiKey);
      const results = await searchPoliciesSemantic(genAI, query, 2);
      const relevant = results.filter((r) => r.score > 0.5);
      return textResult(
        relevant.length > 0 ? relevant : "No matching policy found for that query."
      );
    }
  );

  return server;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.writeHead(405, {
      Allow: "POST",
      "Content-Type": "application/json",
    });
    res.end(JSON.stringify({ error: "MCP endpoint only accepts POST (stateless mode)" }));
    return;
  }

  // Stateless mode: a fresh server + transport per request, no session
  // tracking — the simplest shape for a serverless deployment.
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, req.body);
}
