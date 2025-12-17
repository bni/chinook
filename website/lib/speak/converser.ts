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

  let fullContent = "";

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

        logger.info(message, "LINE!!!");

        const agentReplyType = message.type;

        if (agentReplyType && agentReplyType === "assistant" && typeof message.content === "string") {
          const agentReplyContent = message.content;

          if (agentReplyContent) {
            if (fullContent.length > 0) {
              fullContent += " " + agentReplyContent;
            } else {
              fullContent += agentReplyContent;
            }
          }

          const serverCommand: ServerCommand = {
            event: "translation",
            transcript: prompt,
            translation: agentReplyContent,
            newLine: false
          };

          client.send(JSON.stringify(serverCommand));
        } else if (agentReplyType && agentReplyType === "done") {
          const serverCommand: ServerCommand = {
            event: "translation",
            transcript: prompt,
            translation: fullContent,
            newLine: true
          };

          client.send(JSON.stringify(serverCommand));

          await speak(fullContent, client, targetLanguage);
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
