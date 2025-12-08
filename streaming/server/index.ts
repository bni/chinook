import { handle, streamHandle } from "hono/aws-lambda";
import { app } from "./app";

// Streaming not yet supported in dev mode
export const handler = process.env.SST_LIVE ? handle(app) : streamHandle(app);
