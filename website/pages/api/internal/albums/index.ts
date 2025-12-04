import type { NextApiRequest, NextApiResponse } from "next";
import { createAlbum } from "@lib/albums/createAlbum";
import type { CreateAlbumParams } from "@lib/albums/createAlbum";
import { logger, traceRequest } from "@lib/util/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  traceRequest(req, res);

  if (req.method === "POST") {
    try {
      const { albumTitle, artistId, artistName, releaseYear, label, genre, criticScore, userScore } = req.body;

      if (!albumTitle || typeof albumTitle !== "string" || !albumTitle.trim()) {
        return res.status(400).json({ error: "Album title is required" });
      }

      if (!artistId || typeof artistId !== "string") {
        return res.status(400).json({ error: "Artist ID is required" });
      }

      if (!artistName || typeof artistName !== "string") {
        return res.status(400).json({ error: "Artist name is required" });
      }

      const params: CreateAlbumParams = {
        albumTitle: albumTitle.trim(),
        artistId,
        artistName,
        releaseYear,
        label,
        genre,
        criticScore,
        userScore
      };

      const albumId = await createAlbum(params);

      return res.status(201).json({ success: true, albumId });
    } catch (error) {
      logger.error(error, "Failed to create album");

      return res.status(500).json({ error: "Failed to create album" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
