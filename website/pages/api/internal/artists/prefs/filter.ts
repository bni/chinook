import { NextApiRequest, NextApiResponse } from "next";
import { logger, traceRequest } from "@lib/util/logger";
import { getPrefs, savePrefs } from "@lib/util/prefs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  traceRequest(req, res);

  if (req.method === "POST") {
    const { filter } = req.query;

    // Must allow empty string
    if (filter === undefined || filter === null || typeof filter !== "string") {
      return res.status(400).json({ error: "Filter is required, and to be string" });
    }

    logger.info({ filter }, "Saving filter");

    // Save pref
    const prefs = await getPrefs(req, res);
    prefs.artistsFilter = filter;
    await savePrefs(prefs);

    return res.status(200).json({ success: true });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
