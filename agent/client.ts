import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv)).options({
  prompt: { type: "string", demandOption: true }
}).parseSync();

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000";

// npm run client -- --prompt "How is Bill the cat doing?"

const main = async () => {
  const response = await fetch(`${SERVER_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: argv.prompt })
  });

  if (!response.ok) {
    console.error(`Error: ${response.status} ${response.statusText}`);

    process.exit(1);
  }

  if (!response.body) {
    console.error("No response body");

    process.exit(1);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        const message = JSON.parse(line);

        console.log(message);
      }
    }
  }

  // Process any remaining data in the buffer
  if (buffer.trim()) {
    const message = JSON.parse(buffer);

    console.log(message);
  }
};

await main();
