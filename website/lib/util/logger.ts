import pinoLoki, { type LokiOptions } from "pino-loki";
import PinoHttp from "pino-http";
import pino from "pino";
import pinoPretty from "pino-pretty";
import { secret } from "@lib/util/secrets";

const streams: (pino.DestinationStream | pino.StreamEntry<pino.Level>)[] = [];

// Only enable pretty printing for local development
if (process.env.APP_ENV === "local" && process.stdout.isTTY) {
  streams.push({
    level: "debug",
    stream: pinoPretty({
      colorize: true,
      levelFirst: true,
      translateTime: "yyyy-mm-dd HH:MM:ss Z"
    })
  });
} else {
  streams.push({
    level: "info",
    stream: pinoPretty({
      colorize: false,
      levelFirst: true,
      translateTime: "yyyy-mm-dd HH:MM:ss Z"
    })
  });
}

const lokiHost = await secret("LOKI_HOST");
const lokiUsername = await secret("LOKI_USERNAME");
const lokiToken = await secret("LOKI_TOKEN");

if (lokiHost) {
  let headers = undefined;
  if (lokiUsername && lokiToken) {
    headers = {
      Authorization: `Bearer ${lokiUsername}:${lokiToken}`
    };
  }

  streams.push({
    level: "info",
    stream: pinoLoki({
      batching: false,
      labels: {
        app: "chinook",
        namespace: process.env.APP_ENV || "local",
        source: "pino",
        runtime: `nodejs/${process.version}`
      },
      host: lokiHost,
      headers: headers ? headers : {}
    } satisfies LokiOptions)
  });
}

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || "info",
    redact: {
      paths: ["password"]
    }
  },
  pino.multistream(streams)
);

const traceRequest = PinoHttp({
  logger: logger,
  serializers: {
    req(req) {
      req.headers["cookie"] = "REMOVED";
      req.body = req.raw.body;

      return req;
    },
    res(res) {
      res.headers["set-cookie"] = "REMOVED";

      return res;
    }
  },
  customLogLevel: (() => {
    return process.env.APP_ENV === "local" ? "silent" : "info";
  })
});

export { logger, traceRequest };
