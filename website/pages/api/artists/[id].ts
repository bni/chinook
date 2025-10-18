import type { NextApiRequest, NextApiResponse } from "next";
import { updateArtist } from "@lib/artists/updateArtist";
import { deleteArtist } from "@lib/artists/deleteArtist";
import { logger } from "@lib/util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { artistName } = req.body;

    if (!artistName || typeof artistName !== "string") {
      return res.status(400).json({ error: "Artist name is required" });
    }

    try {
      await updateArtist(Number(id), artistName);

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(error, "Failed to update artist");

      res.status(500).json({ error: "Failed to update artist" });
    }
  } else if (req.method === "DELETE") {
    try {
      await deleteArtist(Number(id));

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(error, "Failed to delete artist");

      res.status(500).json({ error: "Failed to delete artist" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
