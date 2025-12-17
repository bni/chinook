import type { AllowedLanguage, ServerCommand } from "@lib/speak/types";
import { WebSocket } from "ws";
import { logger } from "@lib/util/logger";
import { secret } from "@lib/util/secrets";
import { speak } from "@lib/speak/polly";

export const converse = async (
  prompt: string,
  client: WebSocket,
  targetLanguage: AllowedLanguage
) => {
  const url = await secret("AGENT_BASE_URL");

  const response = await fetch(`${url}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: prompt })
  });

  if (!response.ok || !response.body) {
    const error  = `Error: ${response.status} ${response.statusText} ${response.body}`;

    logger.error(error);

    throw Error(error);
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

        const agentReplyType: string = message.type;

        const agentReplyContent: string | undefined = message.content;

        if (agentReplyType && agentReplyType === "assistant" && typeof agentReplyContent === "string") {
          const serverCommand: ServerCommand = {
            event: "translation",
            //transcript: prompt,
            translation: agentReplyContent,
            newLine: false
          };

          client.send(JSON.stringify(serverCommand));

          if (agentReplyContent) {
            await speak(agentReplyContent, client, targetLanguage);
          }
        } else if (agentReplyType && agentReplyType === "done") {
          const serverCommand: ServerCommand = {
            event: "translation",
            //transcript: prompt,
            translation: "DONE!",
            newLine: true
          };

          client.send(JSON.stringify(serverCommand));
        }
      }
    }
  }

  // Process any remaining data in the buffer
  if (buffer.trim()) {
    const message = JSON.parse(buffer);

    logger.warn(JSON.stringify(message));
  }
};
