export type AllowedLanguage = "sv-SE" | "en-GB" | "fr-FR" | "de-DE" | "es-ES";

type AllowedEvents = "ping" | "selectLanguages";

export interface ClientCommand {
  event: AllowedEvents;
  sourceLanguage?: AllowedLanguage | undefined;
  targetLanguage?: AllowedLanguage | undefined;
}

export interface Transcript {
  transcript?: string | undefined
  isPartial?: boolean | undefined
}

export interface Translation {
  transcript?: string | undefined
  translation?: string | undefined,
  error?: string | undefined
}
