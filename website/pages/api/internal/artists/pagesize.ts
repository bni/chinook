import { NextApiRequest, NextApiResponse } from "next";
import { logger, traceRequest } from "@lib/util/logger";
import { getPrefs, savePrefs } from "@lib/util/prefs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  traceRequest(req, res);

  if (req.method === "POST") {
    const { pageSize } = req.query;

    if (!pageSize || typeof pageSize !== "string" || Number.isNaN(pageSize)) {
      return res.status(400).json({ error: "Page Size is required, and to be numeric" });
    }

    logger.info({ pageSize }, "Saving pagesize");

    const prefs = await getPrefs(req, res);

    prefs.pageSize = parseInt(pageSize, 10);

    await savePrefs(prefs);

    return res.status(200).json({ success: true });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
