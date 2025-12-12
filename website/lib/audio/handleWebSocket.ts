import { type ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { type RawData, WebSocket, WebSocketServer } from "ws";
import {
  StartStreamTranscriptionCommand,
  type StartStreamTranscriptionCommandInput,
  TranscribeStreamingClient
} from "@aws-sdk/client-transcribe-streaming";
import { Duplex } from "stream";
import { IncomingMessage } from "http";
import { PassThrough } from "stream";
import { auth } from "@lib/auth";
import { fromNodeHeaders } from "better-auth/node";

import { logger } from "@lib/util/logger";

const wss = new WebSocketServer({ noServer: true });

const transcribe = async (audioStream: PassThrough, client: WebSocket) => {
  const LanguageCode = "en-US";
  const MediaEncoding = "pcm";
  const MediaSampleRateHertz = 16000;

  const transcribeStreamingClient = new TranscribeStreamingClient({
    region: "eu-west-1"
  });

  const params: StartStreamTranscriptionCommandInput = {
    LanguageCode,
    MediaEncoding,
    MediaSampleRateHertz,
    AudioStream: (async function* () {
      for await (const chunk of audioStream) {
        yield { AudioEvent: { AudioChunk: chunk } };
      }
    })()
  };

  const command = new StartStreamTranscriptionCommand(params);

  // Send transcription request
  const response = await transcribeStreamingClient.send(command);

  // Start to print response
  try {
    if (response && response.TranscriptResultStream) {
      for await (const event of response.TranscriptResultStream) {
        const results = event?.TranscriptEvent?.Transcript?.Results || [];

        for (const result of results) {
          //logger.info(result);

          const alternatives = result.Alternatives || [];

          for (const alternative of alternatives) {
            logger.info({ transcript: alternative.Transcript, isPartial: result.IsPartial }, "Transcription");

            client.send(JSON.stringify({ transcript: alternative.Transcript }));
          }
        }
      }
    }
  } catch (err) {
    console.log("error");
    console.log(err);
  }
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

            ffmpegProcess = spawn("ffmpeg", [
              "-f", "webm",
              "-i", "pipe:0",
              "-ar", "16000",           // 16kHz sample rate
              "-ac", "1",               // Mono
              "-f", "s16le",            // Signed 16-bit PCM little-endian
              "pipe:1"                  // Stream to stdout
            ]);

            // Create a PassThrough stream with controlled chunk size
            const audioStream = new PassThrough({
              highWaterMark: 1024  // 1KB chunks
            });

            // Pipe FFmpeg output to the stream
            ffmpegProcess.stdout.pipe(audioStream);

            // Send the stream to transcription service
            await transcribe(audioStream, client);

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
