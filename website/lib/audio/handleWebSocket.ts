import * as fs from "node:fs";
import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { type RawData, WebSocketServer } from "ws";
import { Duplex } from "stream";
import { IncomingMessage } from "http";
import { auth } from "@lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { logger } from "@lib/util/logger";
import path from "node:path";

const wss = new WebSocketServer({ noServer: true });

const sendToTranscription = (pcmChunk: Buffer<ArrayBuffer>) => {
  console.log(pcmChunk.toString());
};

export const handleWebSocket = (req: IncomingMessage, socket: Duplex, head: Buffer) => {
  wss.handleUpgrade(req, socket, head, (client) => {
    let isAuthenticated = false;

    let ffmpegProcess: ChildProcessWithoutNullStreams | null;

    client.on("message", async (data: RawData, b: boolean) => {
      if (isAuthenticated && b) { // Binary, only accept after authenticated
        if (ffmpegProcess) {
          try {
            ffmpegProcess.stdin.write(data);
          } catch (error) {
            logger.error(`Error writing to FFmpeg stdin: ${error}`);
          }
        } else {
          logger.error("FFmpeg process not available. Dropping message.");
        }
      } else if (!isAuthenticated) { // First text message
        logger.info("Client connected");

        try {
          const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers)
          });

          if (!session) {
            const errorMessage = "User has no session";

            logger.error(errorMessage);

            throw new Error(errorMessage);
          } else {
            isAuthenticated = true;

            const userId = session.user.id;

            logger.info({ userId: userId }, "User is authenticated");

            const basePath = process.env.RECORDINGS_BASE_DIR || "./";

            const time = new Date().toISOString().replaceAll(":", ".");

            const fullPath = path.join(basePath, `${userId}_${time}`);

            fs.mkdir(fullPath, (err) => {
              if (err) {
                return logger.error(err);
              }

              logger.info("Working directory created");
            });

            ffmpegProcess = spawn("ffmpeg", [
              "-f", "webm",
              "-i", "pipe:0",
              "-ar", "16000",           // 16kHz sample rate
              "-ac", "1",               // Mono
              "-f", "s16le",            // Signed 16-bit PCM little-endian
              "pipe:1"                  // Stream to stdout
            ]);

            let pcmBuffer = Buffer.alloc(0);
            const SAMPLES_PER_CHUNK = 16000 * 3; // 3 seconds
            const BYTES_PER_CHUNK = SAMPLES_PER_CHUNK * 2; // 2 bytes per sample

            ffmpegProcess.stdout.on("data", (chunk: Buffer) => {
              pcmBuffer = Buffer.concat([pcmBuffer, chunk]);

              while (pcmBuffer.length >= BYTES_PER_CHUNK) {
                const pcmChunk = pcmBuffer.subarray(0, BYTES_PER_CHUNK);
                pcmBuffer = Buffer.from(pcmBuffer.subarray(BYTES_PER_CHUNK));

                sendToTranscription(pcmChunk);
              }
            });

            ffmpegProcess.stderr.on("data", (data) => {
              logger.debug(`FFmpeg: ${data.toString()}`);
            });

            ffmpegProcess.on("error", (error) => {
              logger.error(`FFmpeg error: ${error}`);
            });

            ffmpegProcess.on("close", (code) => {
              logger.info(`FFmpeg exited: ${code}`);
            });

            const message = JSON.parse(data.toString("utf8")) as {
              event: string;
            };

            logger.info(message);

            if (message.event === "ping") {
              client.send(JSON.stringify({ event: "pong" }));
            } else {
              client.send(JSON.stringify(message)); // Echo
            }
          }
        } catch (e) {
          logger.error(e);
        }
      } else { // Subsequent text messages
        const message = JSON.parse(data.toString("utf8")) as {
          event: string;
        };

        logger.info(message);

        client.send(JSON.stringify(message)); // Echo
      }
    });

    client.on("close", () => {
      logger.info("Client disconnected");

      if (ffmpegProcess) {
        ffmpegProcess.kill("SIGKILL");
        ffmpegProcess = null;

        logger.info("FFmpeg process terminated");
      }
    });
  });
};
