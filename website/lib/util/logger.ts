import pino from "pino";
import { secret } from "@lib/util/secrets";

const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",
  base: undefined,
  mixin(_context, level): { desc: string } {
    return { desc: logger.levels.labels[level].toUpperCase() };
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: "yyyy-mm-dd HH:MM:ss Z",
          ignore: "desc"
        }
      },
      {
        target: "pino/file",
        options: {
          destination: await secret("LOG_FILE_DESTINATION")
        }
      }
    ]
  },
  redact: {
    paths: ["password"]
  }
});

export { logger };
