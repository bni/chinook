import * as fs from "node:fs";
import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { type RawData, WebSocketServer } from "ws";
import { Duplex } from "stream";
import { IncomingMessage } from "http";
import { auth } from "@lib/auth";
import chokidar from "chokidar";
import { fromNodeHeaders } from "better-auth/node";
import { logger } from "@lib/util/logger";
import path from "node:path";

const wss = new WebSocketServer({ noServer: true });

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
              "-ar", "16000",           // 16kHz sample rate (optimal for speech)
              "-ac", "1",               // Mono audio (speech doesn't need stereo)
              "-c:a", "pcm_s16le",      // PCM 16-bit (uncompressed, easy to decode)
              "-f", "segment",          // Output as segments
              "-segment_time", "3",     // 3-second segments (balance latency vs overhead)
              "-segment_format", "wav", // Each segment is a complete WAV file
              "-reset_timestamps", "1", // Reset timestamps for each segment
              path.join(fullPath, "segment_%03d.wav")
            ]);

            const watcher = chokidar.watch(fullPath, {
              ignoreInitial: false,
              awaitWriteFinish: {
                stabilityThreshold: 500,
                pollInterval: 100
              }
            });

            watcher.on("add", async (segmentPath: string) => {
              logger.info(`New segment: ${segmentPath}`);
              // Send segmentPath for transcription
              // Then optionally delete: fs.unlinkSync(segmentPath);
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
