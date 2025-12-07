import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { randomUUID } from "node:crypto";

// Store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

export async function getOrCreateTransport({
  sessionId,
  server,
  isInitializeRequest = false
}: {
  sessionId?: string;
  server: McpServer;
  isInitializeRequest?: boolean;
}) {
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    // Reuse existing transport
    console.log("Reuse existing transport!");
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest) {
    // New initialization request
    console.log("New initialization request");
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        // Store the transport by session ID
        transports[sessionId] = transport;
      }
    });

    // Clean up transport when closed
    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };

    try {
      // Connect transport to the MCP server
      await server.connect(transport);

      // Added for extra debuggability
      transport.onerror = console.error.bind(console);
    } catch (error) {
      console.error(error);

      throw new Error("Internal server error");
    }
  } else {
    console.error("No valid session ID provided");

    throw new Error("No valid session ID provided");
  }

  return transport;
}
