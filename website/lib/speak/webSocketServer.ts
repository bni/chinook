import type { AllowedLanguage, ClientCommand, Mode, ServerCommand } from "@lib/speak/types";
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

interface ConnectionState {
  ffmpegProcess: ChildProcessWithoutNullStreams | undefined;
  selectedMode: Mode;
  selectedSourceLanguage: AllowedLanguage;
  selectedTargetLanguage: AllowedLanguage;
}

const spawnProcess = async (
  state: ConnectionState,
  client: WebSocket
) => {
  logger.info("Spawning FFmpeg");

  state.ffmpegProcess = spawn("ffmpeg", [
    "-f", "webm",
    "-i", "pipe:0",
    "-ar", "16000",           // 16kHz sample rate
    "-ac", "1",               // Mono
    "-f", "s16le",            // Signed 16-bit PCM little-endian
    "pipe:1"                  // Stream to stdout
  ]);

  state.ffmpegProcess.on("spawn", async () => {
    logger.info("FFmpeg process spawned");

    // Create a PassThrough stream with controlled chunk size
    const audioStream = new PassThrough({
      highWaterMark: 1024  // 1KB chunks
    });

    // Pipe FFmpeg output to the stream
    if (state.ffmpegProcess) {
      logger.info("Piping audio stream");

      state.ffmpegProcess.stdout.pipe(audioStream);
    }

    logger.info("Setting up transcribing");

    // Send the stream to transcription, translation and finally speech synthesis
    try {
      await transcribe(
        audioStream,
        client,
        state.selectedMode,
        state.selectedSourceLanguage,
        state.selectedTargetLanguage
      );
    } catch (error) {
      logger.error({ error }, "Transcription, translation or speech synthesis error");
    }
  });
};

const terminateProcess = async (state: ConnectionState) => {
  return new Promise<void>((resolve) => {
    if (state.ffmpegProcess) {
      // Add listener BEFORE killing to avoid race condition
      state.ffmpegProcess.on("close", () => {
        logger.info("FFmpeg process closed");

        state.ffmpegProcess = undefined;

        resolve();
      });

      state.ffmpegProcess.kill("SIGKILL");
    } else {
      // No process to terminate, resolve immediately
      resolve();
    }
  });
};

const respawnProcess = async (
  state: ConnectionState,
  client: WebSocket
) => {
  logger.info("Terminating FFmpeg");
  await terminateProcess(state);

  logger.info("Spawning FFmpeg");
  await spawnProcess(state, client);

  logger.info("FFmpeg spawn complete");
};

export const webSocketServer = (req: IncomingMessage, socket: Duplex, head: Buffer) => {
  wss.handleUpgrade(req, socket, head, async (client: WebSocket) => {
    logger.info("Upgrading to WebSocket");

    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session) {
      const errorMessage = "User has no session";

      logger.error(errorMessage);

      const serverCommand: ServerCommand = {
        event: "error",
        error: errorMessage
      };

      client.send(JSON.stringify(serverCommand));

      client.close(1008, errorMessage); // 1008 = Policy Violation

      return;
    }

    logger.info({ userId: session.user.id }, "User is authenticated");

    // Per-connection state
    const state: ConnectionState = {
      ffmpegProcess: undefined,
      selectedMode: "translation",
      selectedSourceLanguage: "sv-SE",
      selectedTargetLanguage: "en-GB"
    };

    // Spawn FFmpeg immediately with default languages
    await spawnProcess(state, client);

    client.on("message", async (data: RawData, b: boolean) => {
      if (b) { // Binary
        logger.debug("Binary received");

        if (state.ffmpegProcess) {
          try {
            state.ffmpegProcess.stdin.write(data);
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
            state.selectedMode = clientCommand.mode;
          }

          if (clientCommand.sourceLanguage) {
            state.selectedSourceLanguage = clientCommand.sourceLanguage;
          }

          if (clientCommand.targetLanguage) {
            state.selectedTargetLanguage = clientCommand.targetLanguage;
          }

          logger.info({ selectedSourceLanguage: state.selectedSourceLanguage, selectedTargetLanguage: state.selectedTargetLanguage }, "Respawning due to options change");

          await respawnProcess(state, client);

          const serverCommand: ServerCommand = {
            event: "optionsSelected",
            mode: state.selectedMode,
            selectedSourceLanguage: state.selectedSourceLanguage,
            selectedTargetLanguage: state.selectedTargetLanguage
          };

          client.send(JSON.stringify(serverCommand));
        } else {
          client.send(JSON.stringify(clientCommand)); // Echo
        }
      }
    });

    client.on("close", async () => {
      logger.info("Client disconnected");

      await terminateProcess(state);
    });
  });
};
