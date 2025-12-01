import { SDKMessage } from "@anthropic-ai/claude-agent-sdk";

export const printMessage = (message: SDKMessage) => {
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
};
