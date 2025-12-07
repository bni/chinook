import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { printMessage } from "./util.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).options({
  prompt: { type: "string", demandOption: true }
}).parseSync();

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

// npm run start -- --prompt "Is it still possible to book for tomorrow?"
// npm run start -- --prompt "How many guests are there tomorrow?"
// npm run start -- --prompt "What's for lunch tomorrow?"
// npm run start -- --prompt "What's for lunch tomorrow? How many guests are there? Is it still possible to book?"
// npm run start -- --prompt "How is Bill the cat doing?"
// npm run start -- --prompt "I want to listen to some moody music"
// npm run start -- --prompt "Stream some notifications, and show them to me"

for await (const message of query({
  prompt: `${argv.prompt}`,
  options: {
    cwd: process.cwd(),
    settingSources: ["project"],
    mcpServers: {
      cats: {
        command: "node",
        args: ["../mcp/dist/cats.js"]
      },
      albums: {
        command: "node",
        args: ["../mcp/dist/albums.js"],
        env: {
          "CHINOOK_BASE_URL": process.env.CHINOOK_BASE_URL || "",
          "SHARED_SECRET_FOR_HMAC": process.env.SHARED_SECRET_FOR_HMAC || ""
        }
      },
      streaming: {
        type: "http",
        url: process.env.STREAMING_MCP_URL || ""
      }
    },
    allowedTools: [
      "Skill",
      "Read",
      "Write",
      "Bash",
      "mcp__cats__get-cat-status",
      "mcp__albums__search-artist-albums",
      "mcp__streaming__start-notification-stream"
    ],
    outputFormat: {
      type: "json_schema",
      schema: schema
    }
  }
})) {
  printMessage(message);
}
