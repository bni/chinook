import {
  TranslateClient,
  TranslateTextCommand,
  type TranslateTextCommandInput
} from "@aws-sdk/client-translate";
import type { AllowedLanguage } from "@lib/audio/types";
import { logger } from "@lib/util/logger";

export const translate = async (
  transcript: string,
  sourceLanguage: AllowedLanguage,
  targetLanguage: AllowedLanguage
): Promise<string | undefined> => {
  const translateClient = new TranslateClient();

  logger.info({ sourceLanguage, targetLanguage }, "Translating");

  const params: TranslateTextCommandInput = {
    SourceLanguageCode: sourceLanguage.substring(0, 2),
    TargetLanguageCode: targetLanguage.substring(0, 2),
    Text: transcript
  };

  const command = new TranslateTextCommand(params);

  // Send transcription request
  const response = await translateClient.send(command);

  // Process response
  if (response && response.TranslatedText) {
    return response.TranslatedText;
  }

  return undefined;
};
