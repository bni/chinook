export type AllowedLanguage = "sv-SE" | "en-GB" | "fr-FR" | "de-DE" | "es-ES";

type AllowedClientEvents = "ping" | "selectLanguages";

export interface ClientCommand {
  event: AllowedClientEvents
  sourceLanguage?: AllowedLanguage | undefined
  targetLanguage?: AllowedLanguage | undefined
}

type AllowedServerEvents = "pong" | "languagesSelected";

export interface ServerCommand {
  event?: AllowedServerEvents
  selectedSourceLanguage?: AllowedLanguage | undefined
  selectedTargetLanguage?: AllowedLanguage | undefined
  error?: string | undefined
  transcript?: string | undefined
  translation?: string | undefined
}

export interface Transcript {
  transcript?: string | undefined
  isPartial?: boolean | undefined
}

export interface Translation {
  transcript?: string | undefined
  translation?: string | undefined
}
