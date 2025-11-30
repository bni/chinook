import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";

const schema = {
  type: "object",
  properties: {
    lunch: { type: "string" },
    date: { type: "string" },
    weekDay: { type: "string" },
    nrGuests: { type: "number" },
    isBookable: { type: "boolean" }
  },
  required: ["date", "weekDay"]
};

for await (const message of query({
  //prompt: "Is it still possible to book on monday?",
  //prompt: "How many guests are there on tuesday?",
  //prompt: "What's for lunch on tuesday?",
  prompt: "What's for lunch on tuesday? How many guests are there? Is it still possible to book?",
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
  if (message.type === "assistant") {
    const firstContent = message.message.content[0];

    if (firstContent.type === "text") {
      console.log(firstContent.text);
    } else if (firstContent.type === "tool_use") {
      console.log(JSON.stringify(firstContent.input));
    }
  } else if (message.type === "result") {
    if (message.subtype === "success" && message.structured_output) {
      console.log(message.structured_output);
    } else if (message.subtype === "error_max_structured_output_retries") {
      console.error("Could not produce valid output");
    }
  }
}
