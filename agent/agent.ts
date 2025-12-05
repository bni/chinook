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

for await (const message of query({
  prompt: `${argv.prompt}`,
  options: {
    cwd: process.cwd(),
    settingSources: ["project"],
    mcpServers: {
      cats: {
        command: "node",
        args: ["./mcp/dist/cats.js"]
      }
    },
    allowedTools: ["Skill", "Read", "Write", "Bash", "mcp__cats__get-cat-status"],
    outputFormat: {
      type: "json_schema",
      schema: schema
    }
  }
})) {
  printMessage(message);
}
