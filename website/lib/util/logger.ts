import pino from "pino";

const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

const info = logger.info;
const warn = logger.warn;
const error = logger.error;

export { info, warn, error };
