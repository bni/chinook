import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { routing } from "./routing";
import { Resource } from "sst";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: Resource.StreamingRouter.url,
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    exposeHeaders: ["mcp-session-id"],
    maxAge: 600
  })
);
app.use("*", logger());
app.use("*", compress());
app.use("*", async (c, next) => {
  await next();

  // We don't want any caching for streaming real-time data
  c.header("cache-control", "no-store");
});

app.route("/streaming", new Hono().route("/notifications", routing));
