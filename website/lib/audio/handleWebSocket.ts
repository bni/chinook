import { type RawData, WebSocketServer } from "ws";
import { Duplex } from "stream";
import { IncomingMessage } from "http";
import { auth } from "@lib/auth";
import { fromNodeHeaders } from "better-auth/node";
import { logger } from "@lib/util/logger";

const wss = new WebSocketServer({ noServer: true });

export const handleWebSocket = (req: IncomingMessage, socket: Duplex, head: Buffer) => {
  wss.handleUpgrade(req, socket, head, (client) => {
    client.on("message", async (data: RawData, b: boolean) => {
      if (b) {
        return;
      }

      try {
        const message = JSON.parse(data.toString("utf8")) as {
          event: "ping";
        };

        logger.info(message);

        const session = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers)
        });

        if (!session) {
          const errorMessage = "User has no session";

          logger.error(errorMessage);

          throw new Error(errorMessage);
        } else {
          logger.info({ userId: session.user.id }, "userId");

          if (message.event === "ping") {
            client.send(JSON.stringify({ event: "pong" }));
          }
        }
      } catch (e) {
        logger.error(e);
      }
    });
  });
};
