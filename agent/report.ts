import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { printMessage } from "./util.js";

for await (const message of query({
  prompt: "Generate a report for the restaurant",
  options: {
    cwd: process.cwd(),
    settingSources: ["project"],
    allowedTools: ["Skill", "Read", "Write", "Bash"]
  }
})) {
  printMessage(message);
}
