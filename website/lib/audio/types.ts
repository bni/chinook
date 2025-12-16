export type AllowedLanguage = "sv-SE" | "en-GB" | "fr-FR" | "de-DE" | "es-ES";

export type Mode = "translation" | "conversation";

type AllowedClientEvents = "ping" | "selectOptions";

export interface ClientCommand {
  event: AllowedClientEvents
  mode?: Mode | undefined
  sourceLanguage?: AllowedLanguage | undefined
  targetLanguage?: AllowedLanguage | undefined
}

type AllowedServerEvents = "pong" | "optionsSelected";

export interface ServerCommand {
  event?: AllowedServerEvents
  mode?: Mode | undefined
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
