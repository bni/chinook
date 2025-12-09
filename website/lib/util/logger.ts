import type { NextApiRequest, NextApiResponse } from "next";
import pino from "pino";
import pinoPretty from "pino-pretty";

const streams: (pino.DestinationStream | pino.StreamEntry<pino.Level>)[] = [];

// Only enable pretty printing and debug level for local development
const isLocal = process.env.APP_ENV === "local" && process.stdout.isTTY;

streams.push({
  level: isLocal ? "debug" : "info",
  stream: pinoPretty({
    colorize: isLocal,
    levelFirst: true,
    translateTime: "yyyy-mm-dd HH:MM:ss Z"
  })
});

const logger = pino(
  {
    level: process.env.PINO_LOG_LEVEL || "info",
    redact: {
      paths: ["password"]
    }
  },
  pino.multistream(streams)
);

const traceRequest = (req: NextApiRequest, res: NextApiResponse) => {
  req.headers["cookie"] = "REMOVED";

  if (req.method !== "GET") {
    logger.info(req.body);
  }

  logger.debug(req.headers);

  res.valueOf();
};

export { logger, traceRequest };
