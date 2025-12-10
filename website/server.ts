import "dotenv/config";
import { type RawData, WebSocketServer } from "ws";
import express from "express";
import { logger } from "@lib/util/logger";
import next from "next";
import { parse } from "url";
import terminalLink from "terminal-link";

const app = express();

const nextApp = next({ dev: process.env.NODE_ENV === "development" });
await nextApp.prepare();

const nextHandler = nextApp.getRequestHandler();
const nextHmr = nextApp.getUpgradeHandler();

app.use((req, res) => {
  nextHandler(req, res, parse(req.url, true)).then();
});

const server = app.listen(3000, () => {
  if (process.env.APP_ENV === "local" && process.stdout.isTTY) {
    logger.info(terminalLink("🌍", "http://localhost:3000"));
  }
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const { pathname } = parse(req.url || "/", true);

  if (pathname === "/_next/webpack-hmr") {
    nextHmr(req, socket, head).then();
  }

  if (pathname === "/api/ws") {
    wss.handleUpgrade(req, socket, head, (client) => {
      client.on("message", (data: RawData, b: boolean) => {
        if (b) {
          return;
        }

        try {
          const message = JSON.parse(data.toString("utf8")) as {
            event: "ping";
          };

          logger.info(message);

          if (message.event === "ping") {
            client.send(JSON.stringify({ event: "pong" }));
          }
        } catch (e) {
          logger.error(e);
        }
      });
    });
  }
});
