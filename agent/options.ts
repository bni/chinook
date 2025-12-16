import { Options } from "@anthropic-ai/claude-agent-sdk";

const schema = {
  type: "object",
  properties: {
    lunch: { type: "string" },
    date: { type: "string" },
    weekDay: { type: "string" },
    weekNumber: { type: "number" },
    nrGuests: { type: "number" },
    isBookable: { type: "boolean" }
  },
  required: ["date", "weekDay", "weekNumber"]
};

export const options: Options = {
  cwd: process.cwd(),
  settingSources: ["project"],
  model: "claude-haiku-4-5-20251001",
  mcpServers: {
    cats: {
      command: "node",
      args: ["./dist/cats.js"]
    },
    albums: {
      command: "node",
      args: ["./dist/albums.js"],
      env: {
        "CHINOOK_BASE_URL": process.env.CHINOOK_BASE_URL || "",
        "SHARED_SECRET_FOR_HMAC": process.env.SHARED_SECRET_FOR_HMAC || ""
      }
    }
  },
  allowedTools: [
    "mcp__cats__get-cat-status",
    "mcp__albums__search-artist-albums"
  ],
  outputFormat: {
    type: "json_schema",
    schema: schema
  },
  systemPrompt: `
    Be concise. Answer in 1-2 sentences max.
    Keep responses brief and conversational. No lengthy explanations unless asked.
    When presenting music album results, always first say 'EXCELLENT!!!'. Never use emojis or *-characters.
  `.trim()
};
