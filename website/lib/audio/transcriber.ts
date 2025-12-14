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

  logger.info({ sourceLanguage }, "Translating");

  const transcribeStreamingClient = new TranscribeStreamingClient();

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
            // Filter out spurious transcripts (single punctuation, very short, etc.)
            const trimmedTranscript = transcript.transcript.trim();
            const isPunctuationOnly = /^[.,!?;:\s]+$/.test(trimmedTranscript);
            const isTooShort = trimmedTranscript.length < 2;

            if (isPunctuationOnly || isTooShort) {
              logger.debug({ transcript: trimmedTranscript }, "Skipping spurious transcript");

              continue;
            }

            if (transcript.isPartial) {
              const partialTranscript = completeTranscription + transcript.transcript;

              const completeTranslation = await translate(partialTranscript, sourceLanguage, targetLanguage);

              const translation: Translation = {
                transcript: partialTranscript,
                translation: completeTranslation
              };

              client.send(JSON.stringify(translation));
            } else {
              completeTranscription += transcript.transcript + "\n";

              // We need both complete translation to display AND last paragraph for speech synthesis
              const [completeTranslation, lastParagraphTranslation] = await Promise.all([
                translate(completeTranscription, sourceLanguage, targetLanguage),
                translate(transcript.transcript, sourceLanguage, targetLanguage)
              ]);

              const translation: Translation = {
                transcript: completeTranscription,
                translation: completeTranslation
              };

              client.send(JSON.stringify(translation));

              if (lastParagraphTranslation) {
                await speak(lastParagraphTranslation, client, targetLanguage);
              }
            }
          }
        }
      }
    }
  }
};
