import pino from "pino";
import PinoHttp from "pino-http";
import { secret } from "@lib/util/secrets";

const targets = [];

// Only enable this for local development
if (process.env.NODE_ENV === "development" && process.stdout.isTTY) {
  targets.push({
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "yyyy-mm-dd HH:MM:ss Z"
    }
  });
}

const lokiHost = await secret("LOKI_HOST");
const lokiUsername = await secret("LOKI_USERNAME");
const lokiToken = await secret("LOKI_TOKEN");

if (lokiHost && lokiUsername && lokiToken) {
  targets.push({
    target: "pino-loki",
    options: {
      batching: false,
      labels: {
        app: "chinook",
        namespace: process.env.APP_ENV || "local",
        source: "pino",
        runtime: `nodejs/${process.version}`
      },
      host: lokiHost,
      headers: {
        Authorization: `Bearer ${lokiUsername}:${lokiToken}`
      }
    }
  });
}

const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",
  transport: {
    targets: targets
  },
  redact: {
    paths: ["password"]
  }
});

const traceRequest = PinoHttp({
  logger: logger,
  serializers: {
    req(req) {
      req.body = req.raw.body;
      return req;
    }
  },
  /*customLogLevel: (() => {
    return process.env.APP_ENV === "local" ? "silent" : "info";
  })*/
});

export { logger, traceRequest };
