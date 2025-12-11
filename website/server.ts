import "dotenv/config";
import express from "express";
import { handleWebSocket } from "@lib/audio/handleWebSocket";
import { logger } from "@lib/util/logger";
import next from "next";
import { parse } from "url";
import terminalLink from "terminal-link";

const app = express();

const nextApp = next({ dev: process.env.NODE_ENV === "development" });
await nextApp.prepare();

const nextHandler = nextApp.getRequestHandler();
const nextHmr = nextApp.getUpgradeHandler();

app.use(async (req, res) => {
  await nextHandler(req, res, parse(req.url, true));
});

const server = app.listen(3000, () => {
  if (process.env.APP_ENV === "local" && process.stdout.isTTY) {
    logger.info(terminalLink("🌍", "http://localhost:3000"));
  }
});

server.on("upgrade", async (req, socket, head) => {
  const { pathname } = parse(req.url || "/", true);

  if (pathname === "/_next/webpack-hmr") {
    await nextHmr(req, socket, head);
  }

  if (pathname === "/api/internal/ws") {
    handleWebSocket(req, socket, head);
  }
});
