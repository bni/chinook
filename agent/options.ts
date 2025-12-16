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
    "Skill",
    "Read",
    "Write",
    "Bash",
    "mcp__cats__get-cat-status",
    "mcp__albums__search-artist-albums"
  ],
  outputFormat: {
    type: "json_schema",
    schema: schema
  }
};
