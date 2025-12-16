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
  } else if (message.type === "tool_progress") {
    console.log(message.tool_name);
  }
};

export const formatMessage = (message: SDKMessage): string | null => {
  if (message.type === "assistant") {
    const firstContent = message.message.content[0];
    if (firstContent.type === "text") {
      return firstContent.text;
    } else if (firstContent.type === "tool_use") {
      return firstContent.input;
    }
  } else if (message.type === "result") {
    if (message.subtype === "success" && message.structured_output) {
      return JSON.stringify(message.structured_output);
    } else if (message.subtype === "error_max_structured_output_retries") {
      return "Error: Could not produce valid output";
    }
  } else if (message.type === "tool_progress") {
    return `[Tool: ${message.tool_name}]`;
  }

  return null;
};
