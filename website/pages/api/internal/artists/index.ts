import { NextApiRequest, NextApiResponse } from "next";
import { createArtist } from "@lib/artists/createArtist";
import { logger, traceRequest } from "@lib/util/logger";
import { listArtists } from "@lib/artists/listArtists";
import { getPrefs, savePrefs } from "@lib/util/prefs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  traceRequest(req, res);

  if (req.method === "GET") {
    const { fromYear, toYear } = req.query;

    if (!fromYear || typeof fromYear !== "string" || Number.isNaN(fromYear)) {
      return res.status(400).json({ error: "From year is required, and to be numeric" });
    }

    if (!toYear || typeof toYear !== "string" || Number.isNaN(toYear)) {
      return res.status(400).json({ error: "To year is required, and to be numeric" });
    }

    // Save Prefs
    const prefs = await getPrefs(req, res);

    prefs.fromYear = parseInt(fromYear, 10);
    prefs.toYear = parseInt(toYear, 10);

    await savePrefs(prefs);

    const artists = await listArtists(prefs.fromYear, prefs.toYear);

    return res.status(200).json(artists);
  } else if (req.method === "POST") {
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
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
