import "dotenv/config";
import express from "express";
import { logger } from "@lib/util/logger";
import next from "next";
import terminalLink from "terminal-link";
import { webSocketServer } from "@lib/speak/webSocketServer";

const app = express();

const nextApp = next({ dev: process.env.NODE_ENV === "development" });
await nextApp.prepare();

const nextHandler = nextApp.getRequestHandler();
const nextHmr = nextApp.getUpgradeHandler();

app.use(async (req, res) => {
  await nextHandler(req, res);
});

const server = app.listen(3000, () => {
  if (process.env.APP_ENV === "local" && process.stdout.isTTY) {
    logger.info(terminalLink("🌍", "http://localhost:3000"));
  }
});

server.on("upgrade", async (req, socket, head) => {
  if (req.url === "/_next/webpack-hmr") {
    await nextHmr(req, socket, head);
  }

  if (req.url === "/api/internal/ws") {
    webSocketServer(req, socket, head);
  }
});
