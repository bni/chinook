import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { printMessage } from "./util.js";

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

for await (const message of query({
  //prompt: "Is it still possible to book for tomorrow?",
  //prompt: "How many guests are there tomorrow?",
  //prompt: "What's for lunch tomorrow?",
  prompt: "What's for lunch tomorrow? How many guests are there? Is it still possible to book?",
  options: {
    cwd: process.cwd(),
    settingSources: ["project"],
    allowedTools: ["Skill", "Read", "Write", "Bash"],
    outputFormat: {
      type: "json_schema",
      schema: schema
    }
  }
})) {
  printMessage(message);
}
