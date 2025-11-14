import { NextApiRequest, NextApiResponse } from "next";
import { createArtist } from "@lib/artists/createArtist";
import { logger, traceRequest } from "@lib/util/logger";
import { listArtists } from "@lib/artists/listArtists";
import { getPrefs, savePrefs } from "@lib/util/prefs";
import { ArtistSearchResult } from "@lib/artists/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  traceRequest(req, res);

  if (req.method === "GET") {
    const { fromYear, toYear, searchFilter, sortColumn, sortDirection, page, pageSize } = req.query;

    if (!fromYear || typeof fromYear !== "string" || Number.isNaN(fromYear)) {
      return res.status(400).json({ error: "From year is required, and to be numeric" });
    }

    if (!toYear || typeof toYear !== "string" || Number.isNaN(toYear)) {
      return res.status(400).json({ error: "To year is required, and to be numeric" });
    }

    if (typeof searchFilter !== "string") {
      return res.status(400).json({ error: "Search filter is required to be string" });
    }

    if (typeof sortColumn !== "string") {
      return res.status(400).json({ error: "Sort column is required to be string" });
    }

    if (typeof sortDirection !== "string") {
      return res.status(400).json({ error: "Sort direction is required to be string" });
    }

    if (!page || typeof page !== "string" || Number.isNaN(page)) {
      return res.status(400).json({ error: "Page is required, and to be numeric" });
    }

    if (!pageSize || typeof pageSize !== "string" || Number.isNaN(pageSize)) {
      return res.status(400).json({ error: "Page size is required, and to be numeric" });
    }

    // Save prefs
    const prefs = await getPrefs(req, res);
    prefs.artistsFromYear = parseInt(fromYear, 10);
    prefs.artistsToYear = parseInt(toYear, 10);
    prefs.artistsFilter = searchFilter;
    prefs.artistsSortColumn = sortColumn;
    prefs.artistsSortDirection = sortDirection;
    prefs.artistsPage = parseInt(page, 10);
    prefs.artistsPageSize = parseInt(pageSize, 10);
    await savePrefs(prefs);

    const searchResult: ArtistSearchResult = await listArtists(
      prefs.artistsFromYear,
      prefs.artistsToYear,
      prefs.artistsFilter,
      prefs.artistsSortColumn,
      prefs.artistsSortDirection,
      prefs.artistsPage,
      prefs.artistsPageSize
    );

    return res.status(200).json(searchResult);
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
