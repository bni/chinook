import pino from "pino";
//import "pino-pretty";
import PinoHttp from "pino-http";
//import { secret } from "@lib/util/secrets";

// Define the transport configuration only when the output stream is connected to a TTY
//const transport = process.stdout.isTTY ? { transport: { target: "pino-pretty" } } : {};

const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",
  /*transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: "yyyy-mm-dd HH:MM:ss Z"
        }
      },
      {
        target: "pino-loki",
        options: {
          batching: false,
          labels: {
            app: "chinook",
            namespace: process.env.APP_ENV || "local",
            source: "pino",
            runtime: `nodejs/${process.version}`
          },
          host: await secret("LOKI_HOST")
        }
      }
    ]
  },*/
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
  customLogLevel: (() => {
    return process.env.APP_ENV === "local" ? "silent" : "info";
  })
});

export { logger, traceRequest };
