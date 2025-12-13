import {
  PollyClient,
  SynthesizeSpeechCommand,
  type VoiceId
} from "@aws-sdk/client-polly";
import type { AllowedLanguage } from "@lib/audio/types";
import { WebSocket } from "ws";

// Map languages to Polly neural voice IDs
const VOICE_MAP: Record<AllowedLanguage, VoiceId> = {
  "en-GB": "Amy",
  "sv-SE": "Astrid",
  "fr-FR": "Lea",
  "de-DE": "Vicki",
  "es-ES": "Lucia"
};

export const speak = async (
  completeTranslation: string,
  client: WebSocket,
  targetLanguage: AllowedLanguage
): Promise<void> => {
  try {
    const voiceId = VOICE_MAP[targetLanguage];

    if (!voiceId) {
      return;
    }

    console.log(`Synthesizing speech with voice: ${voiceId} for language: ${targetLanguage}`);

    const pollyClient = new PollyClient({
      region: "eu-west-1" // TODO Constant
    });

    const command = new SynthesizeSpeechCommand({
      Text: completeTranslation,
      OutputFormat: "mp3",
      VoiceId: voiceId,
      Engine: "neural"
    });

    const response = await pollyClient.send(command);

    if (response.AudioStream) {
      console.log("Audio stream received from Polly");

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
        console.log(`Sent ${completeAudio.length} bytes of audio to client`);
      } else {
        console.warn("WebSocket is not open, cannot send audio");
      }
    } else {
      console.error("No audio stream received from Polly");
    }
  } catch (error) {
    console.error("Error synthesizing speech with Polly:", error);

    throw error;
  }
};
