import type { AllowedLanguage, Mode, ServerCommand } from "@lib/speak/types";
import {
  StartStreamTranscriptionCommand,
  type StartStreamTranscriptionCommandInput,
  TranscribeStreamingClient
} from "@aws-sdk/client-transcribe-streaming";
import type { PassThrough } from "stream";
import { WebSocket } from "ws";
import { converse } from "@lib/speak/converser";
import { logger } from "@lib/util/logger";
import { speak } from "@lib/speak/polly";
import { translate } from "./translator";

const handlePartial = async (
  serverCommand: ServerCommand,
  selectedMode: Mode,
  sourceLanguage: AllowedLanguage,
  targetLanguage: AllowedLanguage,
  client: WebSocket
) => {
  const partialTranscript = serverCommand.transcript || "";

  if (selectedMode === "translation") {
    const completeTranslation = await translate(partialTranscript, sourceLanguage, targetLanguage);

    const serverCommand: ServerCommand = {
      event: "translation",
      transcript: partialTranscript,
      translation: completeTranslation,
      newLine: false
    };

    client.send(JSON.stringify(serverCommand));
  } else if (selectedMode === "conversation") {
    const serverCommand: ServerCommand = {
      event: "transcript",
      transcript: partialTranscript,
      newLine: false
    };

    client.send(JSON.stringify(serverCommand));
  }
};

const handleComplete = async (
  transcriptionServerCommand: ServerCommand,
  selectedMode: Mode,
  sourceLanguage: AllowedLanguage,
  targetLanguage: AllowedLanguage,
  client: WebSocket
) => {
  const lastParagraphTranscription = transcriptionServerCommand.transcript || "";

  if (selectedMode === "translation") {
    const lastParagraphTranslation = await translate(lastParagraphTranscription, sourceLanguage, targetLanguage);

    const translationServerCommand: ServerCommand = {
      event: "translation",
      transcript: lastParagraphTranscription,
      translation: lastParagraphTranslation,
      newLine: true
    };

    client.send(JSON.stringify(translationServerCommand));

    if (lastParagraphTranslation) {
      await speak(lastParagraphTranslation, client, targetLanguage);
    }
  } else if (selectedMode === "conversation") {
    await converse(lastParagraphTranscription, client, targetLanguage);
  }
};

export const transcribe = async (
  audioStream: PassThrough,
  client: WebSocket,
  selectedMode: Mode,
  sourceLanguage: AllowedLanguage,
  targetLanguage: AllowedLanguage
) => {
  logger.info({ selectedMode, sourceLanguage, targetLanguage }, "Transcribing");

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
          const serverCommand: ServerCommand = {
            event: "transcript",
            transcript: alternative.Transcript
          };

          logger.debug(serverCommand, "Transcript ServerCommand");

          if (serverCommand.transcript) {
            // Filter out spurious transcripts (single punctuation, very short, etc.)
            const trimmedTranscript = serverCommand.transcript.trim();
            const isPunctuationOnly = /^[.,!?;:\s]+$/.test(trimmedTranscript);
            const isTooShort = trimmedTranscript.length < 2;

            if (isPunctuationOnly || isTooShort) {
              logger.debug({ transcript: trimmedTranscript }, "Skipping spurious transcript");

              continue;
            }

            if (result.IsPartial) {
              await handlePartial(
                serverCommand,
                selectedMode,
                sourceLanguage,
                targetLanguage,
                client
              );
            } else {
              await handleComplete(
                serverCommand,
                selectedMode,
                sourceLanguage,
                targetLanguage,
                client
              );
            }
          }
        }
      }
    }
  }
};
