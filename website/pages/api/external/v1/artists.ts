import type { NextApiRequest, NextApiResponse } from "next";
import { getRawBody, validateHMAC } from "@lib/util/utils";
import { logger, traceRequest } from "@lib/util/logger";
import { artistQueue } from "@lib/worker/queues";
import { broker } from "@lib/util/broker";

// noinspection JSUnusedGlobalSymbols
export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  traceRequest(req);

  try {
    if (req.method === "POST") {
      const sentInDigest = req?.headers["x-chinook-hmac-sha256"]?.toString() || "";

      const rawBody = await getRawBody(req);

      if (!await validateHMAC(sentInDigest, rawBody)) {
        logger.warn("Invalid HMAC digest");

        return res.status(401).json({ error: "Invalid HMAC digest" });
      }

      const body = JSON.parse(Buffer.from(rawBody).toString("utf8"));

      const artistName = body.artistName;

      if (!artistName || typeof artistName !== "string") {
        return res.status(400).json({ error: "Artist name is required" });
      }

      try {
        const id = await broker.send(artistQueue, { artistName: artistName });

        logger.info({ id: id, queue: artistQueue }, "Put artist on queue");

        res.status(200).json({ success: true });
      } catch (error) {
        logger.error(error, "Failed to receive artist");

        res.status(500).json({ error: "Failed to receive artist" });
      }
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    logger.error(error, "Unkown error");

    res.status(500).json({ error: "Unkown error" });
  }
}
