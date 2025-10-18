import pino from "pino";

let environment = "local";
if (process.env.APP_ENV) {
  environment = process.env.APP_ENV;
}

let transport;
if (environment === "local") {
  transport = {
    target: "pino-pretty",
    options: {
      colorize: true,
      levelFirst: true,
      translateTime: "yyyy-mm-dd HH:MM:ss Z"
    }
  };
} else {
  transport = {
    target: "pino-logfmt",
    options: {
      flattenNestedObjects: true
    }
  };
}

const logger = pino({
  level: process.env.PINO_LOG_LEVEL || "info",
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  },
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: transport,
  redact: {
    paths: ["password"]
  }
});

export { logger };
