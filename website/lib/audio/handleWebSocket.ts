import type { AllowedLanguage, ClientCommand, Mode, ServerCommand } from "@lib/audio/types";
import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { type RawData, WebSocket, WebSocketServer } from "ws";
import { Duplex } from "stream";
import { IncomingMessage } from "http";
import { PassThrough } from "stream";
import { auth } from "@lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { logger } from "@lib/util/logger";
import { transcribe } from "./transcriber";

const wss = new WebSocketServer({ noServer: true });

let ffmpegProcess: ChildProcessWithoutNullStreams | undefined;

let selectedMode: Mode = "translation";
let selectedSourceLanguage: AllowedLanguage = "sv-SE";
let selectedTargetLanguage: AllowedLanguage = "en-GB";

const spawnProcess = async (
  client: WebSocket,
  selectedSourceLanguage: AllowedLanguage,
  selectedTargetLanguage: AllowedLanguage
) => {
  logger.info("Spawning FFmpeg");

  ffmpegProcess = spawn("ffmpeg", [
    "-f", "webm",
    "-i", "pipe:0",
    "-ar", "16000",           // 16kHz sample rate
    "-ac", "1",               // Mono
    "-f", "s16le",            // Signed 16-bit PCM little-endian
    "pipe:1"                  // Stream to stdout
  ]);

  ffmpegProcess.on("spawn", async () => {
    logger.info("FFmpeg process spawned");

    // Create a PassThrough stream with controlled chunk size
    const audioStream = new PassThrough({
      highWaterMark: 1024  // 1KB chunks
    });

    // Pipe FFmpeg output to the stream
    if (ffmpegProcess) {
      logger.info("Piping audio stream");

      ffmpegProcess.stdout.pipe(audioStream);
    }

    logger.info("Setting up transcribing");

    // Send the stream to transcription, translation and finally speech synthesis
    try {
      await transcribe(audioStream, client, selectedMode, selectedSourceLanguage, selectedTargetLanguage);
    } catch (error) {
      logger.error({ error }, "Transcription, translation or speech synthesis error");
    }
  });
};

const terminateProcess = async () => {
  return new Promise<void>((resolve) => {
    if (ffmpegProcess) {
      ffmpegProcess.on("close", () => {
        logger.info("FFmpeg process closed");

        ffmpegProcess = undefined;

        resolve();
      });

      ffmpegProcess.kill("SIGKILL");
    }
  });
};

const respawnProcess = async (
  client: WebSocket,
  selectedSourceLanguage: AllowedLanguage,
  selectedTargetLanguage: AllowedLanguage
) => {
  if (ffmpegProcess) {
    await terminateProcess();
  }

  await spawnProcess(client, selectedSourceLanguage, selectedTargetLanguage);
};

export const handleWebSocket = (req: IncomingMessage, socket: Duplex, head: Buffer) => {
  wss.handleUpgrade(req, socket, head, async (client: WebSocket) => {
    logger.info("Upgrading to WebSocket");

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session) {
      const errorMessage = "User has no session";

      logger.error(errorMessage);

      const serverCommand: ServerCommand = {
        error: errorMessage
      };

      client.send(JSON.stringify(serverCommand));

      client.close(1008, errorMessage); // 1008 = Policy Violation

      return;
    }

    logger.info({ userId: session.user.id }, "User is authenticated");

    // Spawn FFmpeg immediately with default languages
    await spawnProcess(client, selectedSourceLanguage, selectedTargetLanguage);

    client.on("message", async (data: RawData, b: boolean) => {
      if (b) { // Binary
        logger.debug("Binary received");

        if (ffmpegProcess) {
          try {
            ffmpegProcess.stdin.write(data);
          } catch (error) {
            logger.error(`Error writing to FFmpeg stdin: ${error}`);
          }
        } else {
          logger.error("FFmpeg process not available. Dropping message.");
        }
      } else { // Text
        logger.debug("Text received");

        const clientCommand: ClientCommand = JSON.parse(data.toString("utf8")) as ClientCommand;

        if (clientCommand.event === "ping") {
          const serverCommand: ServerCommand = {
            event: "pong"
          };
          client.send(JSON.stringify(serverCommand));
        } else if (clientCommand.event === "selectOptions") {
          if (clientCommand.mode) {
            selectedMode = clientCommand.mode;
          }

          if (clientCommand.sourceLanguage) {
            selectedSourceLanguage = clientCommand.sourceLanguage;
          }

          if (clientCommand.targetLanguage) {
            selectedTargetLanguage = clientCommand.targetLanguage;
          }

          logger.info({ selectedSourceLanguage, selectedTargetLanguage }, "Respawning due to options change");

          await respawnProcess(client, selectedSourceLanguage, selectedTargetLanguage);

          const serverCommand: ServerCommand = {
            event: "optionsSelected",
            mode: selectedMode,
            selectedSourceLanguage,
            selectedTargetLanguage
          };

          client.send(JSON.stringify(serverCommand));
        } else {
          client.send(JSON.stringify(clientCommand)); // Echo
        }
      }
    });

    client.on("close", async () => {
      logger.info("Client disconnected");

      await terminateProcess();
    });
  });
};
