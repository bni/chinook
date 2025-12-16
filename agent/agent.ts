import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { printMessage } from "./util.js";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { options } from "./options.js";

const argv = yargs(hideBin(process.argv)).options({
  prompt: { type: "string", demandOption: true }
}).parseSync();

// npm run start -- --prompt "How is Bill the cat doing?"
// npm run start -- --prompt "I want to listen to some moody music"

for await (const message of query({prompt: `${argv.prompt}`, options})) {
  printMessage(message);
}
