import type { NextApiRequest, NextApiResponse } from "next";
import { updateAlbum, UpdateAlbumParams } from "@lib/albums/updateAlbum";
import { deleteAlbum } from "@lib/albums/deleteAlbum";
import { logger, traceRequest } from "@lib/util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  traceRequest(req, res);

  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Album id is required" });
  }

  if (req.method === "PUT") {
    const { albumTitle, artistName, releaseYear, label, genre, criticScore, userScore } = req.body;

    if (!albumTitle || typeof albumTitle !== "string") {
      return res.status(400).json({ error: "Album title is required" });
    }

    if (!artistName || typeof artistName !== "string") {
      return res.status(400).json({ error: "Artist name is required" });
    }

    try {
      const params: UpdateAlbumParams = {
        albumId: id,
        albumTitle,
        artistName,
        releaseYear,
        label,
        genre,
        criticScore,
        userScore
      };

      await updateAlbum(params);

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(error, "Failed to update album");

      res.status(500).json({ error: "Failed to update album" });
    }
  } else if (req.method === "DELETE") {
    try {
      await deleteAlbum(id);

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error(error, "Failed to delete album");

      res.status(500).json({ error: "Failed to delete album" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
