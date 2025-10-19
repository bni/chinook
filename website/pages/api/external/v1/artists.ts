import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "@lib/util/logger";
import { broker } from "@lib/util/broker";
import { artistQueue } from "@lib/worker/queues";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { artistName } = req.body;

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
}
