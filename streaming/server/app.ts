import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { routing } from "./routing";

export const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Mcp-Session-Id", "mcp-session-id"],
    maxAge: 600,
    credentials: true
  })
);
app.use("*", logger());
app.use("*", compress());
app.use("*", async (c, next) => {
  await next();

  if (!c.res.headers.get("cache-control")) {
    c.header("cache-control", "no-store, max-age=0, must-revalidate, no-cache");
  }
});

app.route("/streaming", new Hono().route("/notifications", routing));
