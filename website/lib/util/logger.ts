import pino, { type DestinationStream, type LoggerOptions } from "pino";
import type { NextApiRequest } from "next";
import { createGcpLoggingPinoConfig } from "@google-cloud/pino-logging-gcp-config";
import pinoPretty from "pino-pretty";

// When ran in unit tests (NODE_ENV === "test") disable logging. This is done by setting log level to "fatal"
// If no PINO_LOG_LEVEL was set, use "info"
const level = process.env.NODE_ENV === "test" ? "fatal" : process.env.PINO_LOG_LEVEL || "info";

const baseConfig: LoggerOptions = {
  level: level,
  redact: {
    paths: ["password", "cookie"]
  }
};

let config: LoggerOptions;

let stream: DestinationStream;

// Only enable pretty printing and debug level for local development
const isLocal = process.env.APP_ENV === "local" && process.stdout.isTTY;

if (isLocal) {
  config = baseConfig;

  stream = pinoPretty({
    colorize: true,
    levelFirst: true,
    translateTime: "yyyy-mm-dd HH:MM:ss Z"
  });
} else {
  config = createGcpLoggingPinoConfig(
    {
      serviceContext: {
        service: `chinook-${process.env.APP_ENV}`,
        version: "0.0.1"
      },
      inihibitDiagnosticMessage: true
    },
    baseConfig
  );

  stream = pino.destination();
}

const logger = pino(config, stream);

const traceRequest = (req: NextApiRequest) => {
  logger.debug(req.headers);

  const path = req.url ? req.url.split("?")[0] : undefined;
  const query = req.query && Object.keys(req.query).length > 0 ? req.query : undefined;
  const body = req.body && Object.keys(req.body).length > 0 ? req.body : undefined;

  logger.info({ method: req.method, path: path, query: query, body: body }, "Request");
};

export { logger, traceRequest };
