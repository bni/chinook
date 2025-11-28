import "dotenv/config";
import { query } from "@anthropic-ai/claude-agent-sdk";

const schema = {
  type: "object",
  properties: {
    company_name: { type: "string" },
    founded_year: { type: "number" },
    headquarters: { type: "string" }
  },
  required: ["company_name"]
};

for await (const message of query({
  prompt: "Research Apple and provide key company information",
  options: {
    outputFormat: {
      type: "json_schema",
      schema: schema
    }
  }
})) {
  if (message.type === "result") {
    if (message.subtype === "success" && message.structured_output) {
      console.log(message.structured_output);
    } else if (message.subtype === "error_max_structured_output_retries") {
      console.error("Could not produce valid output");
    }
  }
}
