import { NextApiRequest, NextApiResponse } from "next";
import { createArtist } from "@lib/artists/createArtist";
import { logger, traceRequest } from "@lib/util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  traceRequest(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { artistName } = req.body;

    if (!artistName || typeof artistName !== "string" || !artistName.trim()) {
      return res.status(400).json({ error: "Artist name is required" });
    }

    await createArtist(artistName.trim());

    return res.status(201).json({ success: true });
  } catch (error) {
    logger.error(error, "Failed to create artist");

    return res.status(500).json({ error: "Failed to create artist" });
  }
}
