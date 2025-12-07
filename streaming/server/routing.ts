import { type Context, Hono } from "hono";
import { toFetchResponse, toReqRes } from "fetch-to-node";
import { getOrCreateTransport } from "./transport";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { server } from "./server";

export const routing = new Hono();

// SSE is disabled, since it's deprecated
routing.get("/mcp", async (c: Context) => {
  return c.text("SSE Not supported", 405);
});

// Instead use Streaming HTTP
routing.post("/mcp", async (c) => {
  const { req, res } = toReqRes(c.req.raw);

  const headers = c.req.header();

  const sessionId = headers["mcp-session-id"] as string | undefined;

  const transport = await getOrCreateTransport({
    sessionId,
    server: server,
    isInitializeRequest: isInitializeRequest(await c.req.json())
  });

  res.on("close", () => {
    console.log("Request closed");
    transport.close();
    server.close();
  });

  await transport.handleRequest(req, res, await c.req.json());

  return toFetchResponse(res);
});

// Session termination
routing.delete("/mcp", async (c: Context) => {
  const { req, res } = toReqRes(c.req.raw);

  const headers = c.req.header();
  const sessionId = headers["mcp-session-id"] as string | undefined;

  const transport = await getOrCreateTransport({
    sessionId: sessionId,
    server: server
  });

  res.on("close", () => {
    console.log("Request closed");
    transport.close();
    server.close();
  });

  await transport.handleRequest(req, res);
});
