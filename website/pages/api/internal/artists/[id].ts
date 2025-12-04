import type { NextApiRequest, NextApiResponse } from "next";
import { logger, traceRequest } from "@lib/util/logger";
import { deleteArtist } from "@lib/artists/deleteArtist";
import { getArtistDetail } from "@lib/artists/getArtistDetail";
import { updateArtist } from "@lib/artists/updateArtist";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  traceRequest(req, res);

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Artist id is required" });
  }

  if (req.method === "GET") {
    try {
      const artistDetail = await getArtistDetail(id);

      if (!artistDetail) {
        return res.status(404).json({ error: "Artist not found" });
      }

      res.status(200).json(artistDetail);
    } catch (error) {
      logger.error(error, "Failed to get artist detail");

      res.status(500).json({ error: "Failed to get artist detail" });
    }
  } else if (req.method === "PUT") {
    const { artistName } = req.body;
    if (!artistName || typeof artistName !== "string") {
      return res.status(400).json({ error: "Artist name is required" });
    }

    try {
      await updateArtist(id, artistName);

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(error, "Failed to update artist");

      res.status(500).json({ error: "Failed to update artist" });
    }
  } else if (req.method === "DELETE") {
    try {
      await deleteArtist(id);

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(error, "Failed to delete artist");

      res.status(500).json({ error: "Failed to delete artist" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
