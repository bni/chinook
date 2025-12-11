import type { NextApiRequest, NextApiResponse } from "next";

interface HealthCheckResponse {
  status: "healthy";
  timestamp: string;
  uptime: number;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse>
) {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
