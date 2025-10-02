import type { NextApiRequest, NextApiResponse } from "next";
import { updateCustomerSupportRep } from "@lib/customers/updateCustomerSupportRep";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { supportRepId } = req.body;

    if (supportRepId === undefined || typeof supportRepId !== "number") {
      return res.status(400).json({ error: "Support rep ID is required" });
    }

    try {
      await updateCustomerSupportRep(Number(id), supportRepId);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating customer support rep:", error);

      res.status(500).json({ error: "Failed to update customer support rep" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
