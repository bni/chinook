import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { printMessage } from "./util.js";

for await (const message of query({
  prompt: "Fate of Atlantis: How do I get the thing in the ice in Iceland?",
  options: {
    cwd: process.cwd(),
    settingSources: ["project"],
    allowedTools: ["Skill", "Read", "Write", "Bash"]
  }
})) {
  printMessage(message);
}
