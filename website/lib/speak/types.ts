export type Mode = "translation" | "conversation";

export type AllowedLanguage = "sv-SE" | "en-GB" | "fr-FR" | "de-DE" | "es-ES";

type AllowedClientEvents = "ping" | "selectOptions";

export interface ClientCommand {
  event: AllowedClientEvents
  mode?: Mode | undefined
  sourceLanguage?: AllowedLanguage | undefined
  targetLanguage?: AllowedLanguage | undefined
}

type AllowedServerEvents = "pong" | "optionsSelected"| "transcript" | "translation"| "error";

export interface ServerCommand {
  event: AllowedServerEvents
  mode?: Mode | undefined
  selectedSourceLanguage?: AllowedLanguage | undefined
  selectedTargetLanguage?: AllowedLanguage | undefined
  transcript?: string | undefined
  translation?: string | undefined // Used for both translation reply and conversation reply
  newLine?: boolean | undefined
  error?: string | undefined
}
