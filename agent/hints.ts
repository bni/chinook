import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { printMessage } from "./util.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// npm run hints -- --question "How do I get the thing in the ice in Iceland?"
// npm run hints -- --question "What is scribbled on page 20?"

const argv = yargs(hideBin(process.argv)).options({
  question: { type: "string", demandOption: true }
}).parseSync();

for await (const message of query({
  prompt: `${argv.question} in Fate of Atlantis`,
  options: {
    cwd: process.cwd(),
    settingSources: ["project"],
    allowedTools: ["Skill", "Read"]
  }
})) {
  printMessage(message);
}
