import type { NextApiRequest, NextApiResponse } from "next";
import { getRawBody, validateHMAC } from "@lib/util/utils";
import { logger, traceRequest } from "@lib/util/logger";
import type { AlbumSearchResult } from "@lib/albums/types";
import { searchAlbums } from "@lib/albums/searchAlbums";

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

      const searchQuery = body.query;

      if (!searchQuery || typeof searchQuery !== "string") {
        return res.status(400).json({ error: "Query is required" });
      }

      try {
        logger.info({ searchQuery: searchQuery }, "Search Query");

        const albumSearchResults: AlbumSearchResult[] = await searchAlbums(searchQuery);

        res.status(200).json({ results: albumSearchResults });
      } catch (error) {
        logger.error(error, "Failed to query");

        res.status(500).json({ error: "Failed to query" });
      }
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    logger.error(error, "Unkown error");

    res.status(500).json({ error: "Unkown error" });
  }
}
