import { WebSocketServer } from "ws";
import type { ChildProcessWithoutNullStreams } from "node:child_process";

export type AllowedLanguage = "en-GB" | "sv-SE" | "fr-FR" | "de-DE" | "es-ES";

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
