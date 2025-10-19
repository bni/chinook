import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@lib/util/logger";
import { broker } from "@lib/util/broker";
import { artistQueue } from "@lib/worker/queues";
import { secret } from "@lib/util/secrets";

import crypto from "crypto";
import { Readable } from "node:stream";

// noinspection JSUnusedGlobalSymbols
export const config = {
  api: {
    bodyParser: false
  }
};

const getRawBody = async (readable: Readable): Promise<Buffer> => {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "POST") {
      const sentInDigest = req?.headers["x-chinook-hmac-sha256"]?.toString() || "";

      const rawBody = await getRawBody(req);

      const body = JSON.parse(Buffer.from(rawBody).toString("utf8"));

      const ourDigest = crypto
        .createHmac("sha256", await secret("SHARED_SECRET_FOR_HMAC"))
        .update(rawBody)
        .digest("base64");

      if (!sentInDigest || sentInDigest !== ourDigest) {
        logger.warn("Invalid HMAC digest");

        return res.status(401).json({ error: "Invalid HMAC digest" });
      }

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
