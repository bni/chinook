import type { AllowedLanguage, ServerCommand } from "@lib/audio/types";
import { WebSocket } from "ws";
import { logger } from "@lib/util/logger";
import { secret } from "@lib/util/secrets";
import { speak } from "@lib/audio/polly";

export const converse = async (
  completeTranscription: string,
  lastParagraphTranscription: string,
  client: WebSocket,
  targetLanguage: AllowedLanguage
) => {
  const url = await secret("AGENT_BASE_URL");

  const response = await fetch(`${url}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt: lastParagraphTranscription })
  });

  if (!response.ok || !response.body) {
    const error  = `Error: ${response.status} ${response.statusText} ${response.body}`;

    console.error(error);

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

        const reply = message.content;

        if (typeof reply === "string") {
          const serverCommand: ServerCommand = {
            transcript: completeTranscription,
            translation: reply
          };

          client.send(JSON.stringify(serverCommand));

          if (reply) {
            await speak(reply, client, targetLanguage);
          }
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
