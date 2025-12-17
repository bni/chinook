import {
  type Engine,
  PollyClient,
  SynthesizeSpeechCommand,
  type VoiceId
} from "@aws-sdk/client-polly";
import type { AllowedLanguage } from "@lib/speak/types";
import { WebSocket } from "ws";
import { logger } from "@lib/util/logger";

interface VoiceUsesEngine {
  voiceId: VoiceId,
  engine: Engine
}

const voiceEngineMap: Record<AllowedLanguage, VoiceUsesEngine> = {
  "sv-SE": { voiceId: "Elin", engine: "neural" },
  "en-GB": { voiceId: "Amy", engine: "generative" },
  "fr-FR": { voiceId: "Lea", engine: "generative" },
  "de-DE": { voiceId: "Vicki", engine: "generative" },
  "es-ES": { voiceId: "Lucia", engine: "generative" }
};

export const speak = async (
  textToSpeak: string,
  client: WebSocket,
  targetLanguage: AllowedLanguage
): Promise<void> => {
  const voiceEngine = voiceEngineMap[targetLanguage];

  logger.info({ targetLanguage, voiceEngine }, "Synthesizing speech");

  const pollyClient = new PollyClient();

  const command = new SynthesizeSpeechCommand({
    Text: textToSpeak,
    OutputFormat: "mp3",
    VoiceId: voiceEngine.voiceId,
    Engine: voiceEngine.engine
  });

  const response = await pollyClient.send(command);

  if (response.AudioStream) {
    logger.debug("Audio stream received from Polly");

    // Convert the audio stream to a buffer and send it to the client
    const audioBuffer: Uint8Array[] = [];

    for await (const chunk of response.AudioStream as AsyncIterable<Uint8Array>) {
      audioBuffer.push(chunk);
    }

    // Concatenate all chunks into a single buffer
    const totalLength = audioBuffer.reduce((acc, chunk) => acc + chunk.length, 0);
    const completeAudio = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of audioBuffer) {
      completeAudio.set(chunk, offset);
      offset += chunk.length;
    }

    // Send the complete audio buffer to the client via WebSocket
    if (client.readyState === WebSocket.OPEN) {
      client.send(completeAudio, { binary: true });
      logger.debug({ length: completeAudio.length }, "Sent bytes of audio to client");
    } else {
      logger.warn("WebSocket is not open, cannot send audio");
    }
  } else {
    logger.error("No audio stream received from Polly");
  }
};
