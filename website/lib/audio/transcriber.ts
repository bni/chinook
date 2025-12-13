import type { AllowedLanguage, Transcript, Translation } from "@lib/audio/types";
import {
  StartStreamTranscriptionCommand,
  type StartStreamTranscriptionCommandInput,
  TranscribeStreamingClient
} from "@aws-sdk/client-transcribe-streaming";
import type { PassThrough } from "stream";
import { WebSocket } from "ws";
import { logger } from "@lib/util/logger";
import { speak } from "@lib/audio/polly";
import { translate } from "./translator";

export const transcribe = async (
  audioStream: PassThrough,
  client: WebSocket,
  sourceLanguage: AllowedLanguage,
  targetLanguage: AllowedLanguage
) => {
  let completeTranscription = "";

  const transcribeStreamingClient = new TranscribeStreamingClient({
    region: "eu-west-1"
  });

  const params: StartStreamTranscriptionCommandInput = {
    LanguageCode: sourceLanguage,
    MediaEncoding: "pcm",
    MediaSampleRateHertz: 16000,
    AudioStream: (async function* () {
      for await (const chunk of audioStream) {
        yield { AudioEvent: { AudioChunk: chunk } };
      }
    })()
  };

  const command = new StartStreamTranscriptionCommand(params);

  // Send transcription request
  const response = await transcribeStreamingClient.send(command);

  // Process response
  if (response && response.TranscriptResultStream) {
    for await (const event of response.TranscriptResultStream) {
      const results = event?.TranscriptEvent?.Transcript?.Results || [];

      for (const result of results) {
        const alternatives = result.Alternatives || [];

        for (const alternative of alternatives) {
          const transcript: Transcript = {
            transcript: alternative.Transcript,
            isPartial: result.IsPartial
          };

          logger.debug(transcript, "Transcript");

          if (transcript.transcript) {
            if (transcript.isPartial) {
              const partialTranscript = completeTranscription + transcript.transcript;

              const completeTranslation = await translate(partialTranscript, sourceLanguage, targetLanguage);

              const translation: Translation = {
                transcript: partialTranscript,
                translation: completeTranslation
              };

              client.send(JSON.stringify(translation));
            } else {
              let ending = transcript.transcript;

              const regex = /[.?!]$/g;

              ending += regex.test(ending) ? "\n" : ".\n";

              completeTranscription += ending;

              const completeTranslation = await translate(completeTranscription, sourceLanguage, targetLanguage);

              const translation: Translation = {
                transcript: completeTranscription,
                translation: completeTranslation
              };

              client.send(JSON.stringify(translation));

              if (completeTranslation) {
                await speak(completeTranslation, client, targetLanguage);
              }
            }
          }
        }
      }
    }
  }
};
