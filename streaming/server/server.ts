import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export const server = new McpServer(
  {
    name: "notification-server",
    version: "0.0.1"
  },
  {
    capabilities: {
      logging: {}, // Needed for streaming to work
      tools: {}
    }
  }
);

const InputSchema = {
  interval: z
    .number()
    .describe("Interval in milliseconds between notifications")
    .default(100),
  count: z
    .number()
    .describe("Number of notifications to send (0 for 100)")
    .default(10)
};

// Register a tool specifically for testing resumability
server.registerTool(
  "start-notification-stream",
  {
    description: "Starts sending periodic notifications for testing resumability",
    inputSchema: InputSchema
  },
  async ({ interval, count }, { sendNotification }): Promise<CallToolResult> => {
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    let counter = 0;

    while (count === 0 || counter < count) {
      counter++;

      console.info("Sending notification!", counter);

      try {
        await sendNotification({
          method: "notifications/message",
          params: {
            level: "info",
            data: `Periodic notification #${counter} at ${new Date().toISOString()}`
          }
        });
      } catch (error) {
        console.error("Error sending notification:", error);
      }

      // Wait for the specified interval
      await sleep(interval);
    }

    return {
      content: [
        {
          type: "text",
          text: `Sent periodic notifications every ${interval}ms`
        }
      ]
    };
  }
);
