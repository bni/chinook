import { type Context, Hono } from "hono";
import { toFetchResponse, toReqRes } from "fetch-to-node";
import { findTransport } from "./transport";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { server } from "./server";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ServerResponse } from "http";

export const routing = new Hono();

const setupRequestClosedEvent = (res: ServerResponse, transport: StreamableHTTPServerTransport) => {
  res.on("close", async () => {
    console.info("Request closed");

    await transport.close();
    await server.close();
  });
};

// SSE is disabled, since it's deprecated
routing.get("/mcp", async (c: Context) => {
  return c.text("SSE Not supported", 405);
});

// Instead use Streaming HTTP
routing.post("/mcp", async (c) => {
  const { req, res } = toReqRes(c.req.raw);

  const headers = c.req.header();

  const sessionId = headers["mcp-session-id"] as string | undefined;

  const transport = await findTransport({
    sessionId: sessionId,
    server: server,
    isInitializeRequest: isInitializeRequest(await c.req.json())
  });

  setupRequestClosedEvent(res, transport);

  await transport.handleRequest(req, res, await c.req.json());

  return toFetchResponse(res);
});

// Session termination
routing.delete("/mcp", async (c: Context) => {
  const { req, res } = toReqRes(c.req.raw);

  const headers = c.req.header();
  const sessionId = headers["mcp-session-id"] as string | undefined;

  const transport = await findTransport({
    sessionId: sessionId,
    server: server
  });

  setupRequestClosedEvent(res, transport);

  await transport.handleRequest(req, res);
});
