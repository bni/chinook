import { Readable } from "node:stream";
import crypto from "crypto";
import { secret } from "@lib/util/secrets";

export const getRawBody = async (readable: Readable): Promise<Buffer> => {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

export const validateHMAC = async (sentInDigest: string, rawBody: Buffer) => {
  const ourDigest = crypto
    .createHmac("sha256", await secret("SHARED_SECRET_FOR_HMAC"))
    .update(rawBody)
    .digest("base64");

  return sentInDigest && sentInDigest === ourDigest;
};
