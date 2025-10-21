import pino from "pino";
import { secret } from "@lib/util/secrets";

const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",
  transport: {
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
        target: "pino/file",
        options: {
          destination: await secret("LOG_FILE_DESTINATION")
        }
      },
      {
        target: "pino-loki",
        options: {
          batching: false,
          labels: {
            app: "chinook",
            namespace: process.env.NODE_ENV || "development",
            source: "pino",
            runtime: `nodejs/${process.version}`
          },
          host: await secret("LOKI_HOST"),
          headers: {
            Authorization: `Bearer ${await secret("LOKI_USERNAME")}:${await secret("LOKI_TOKEN")}`
          }
        }
      }
    ]
  },
  redact: {
    paths: ["password"]
  }
});

export { logger };
