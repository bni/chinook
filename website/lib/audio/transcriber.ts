import type { AllowedLanguage, Mode, ServerCommand, Transcript } from "@lib/audio/types";
import {
  StartStreamTranscriptionCommand,
  type StartStreamTranscriptionCommandInput,
  TranscribeStreamingClient
} from "@aws-sdk/client-transcribe-streaming";
import type { PassThrough } from "stream";
import { WebSocket } from "ws";
import { converse } from "@lib/audio/converser";
import { logger } from "@lib/util/logger";
import { speak } from "@lib/audio/polly";
import { translate } from "./translator";

export const transcribe = async (
  audioStream: PassThrough,
  client: WebSocket,
  selectedMode: Mode,
  sourceLanguage: AllowedLanguage,
  targetLanguage: AllowedLanguage
) => {
  let completeTranscription = "";

  logger.info({ selectedMode, sourceLanguage }, "Transcribing");

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

              if (selectedMode === "translation") {
                const completeTranslation = await translate(partialTranscript, sourceLanguage, targetLanguage);

                const serverCommand: ServerCommand = {
                  transcript: partialTranscript,
                  translation: completeTranslation
                };

                client.send(JSON.stringify(serverCommand));
              } else if (selectedMode === "conversation") {
                // Call agent
                const serverCommand: ServerCommand = {
                  transcript: partialTranscript
                };

                client.send(JSON.stringify(serverCommand));
              }
            } else {
              completeTranscription += transcript.transcript + "\n";

              const lastParagraphTranscription = transcript.transcript;

              if (selectedMode === "translation") {
                // We need both complete translation to display AND last paragraph for speech synthesis
                const [completeTranslation, lastParagraphTranslation] = await Promise.all([
                  translate(completeTranscription, sourceLanguage, targetLanguage),
                  translate(lastParagraphTranscription, sourceLanguage, targetLanguage)
                ]);

                const serverCommand: ServerCommand = {
                  transcript: completeTranscription,
                  translation: completeTranslation
                };

                client.send(JSON.stringify(serverCommand));

                if (lastParagraphTranslation) {
                  await speak(lastParagraphTranslation, client, targetLanguage);
                }
              } else if (selectedMode === "conversation") {
                const cenversationReply = await converse(lastParagraphTranscription);

                const serverCommand: ServerCommand = {
                  transcript: completeTranscription,
                  translation: cenversationReply
                };

                client.send(JSON.stringify(serverCommand));

                if (cenversationReply) {
                  await speak(cenversationReply, client, targetLanguage);
                }
              }
            }
          }
        }
      }
    }
  }
};
