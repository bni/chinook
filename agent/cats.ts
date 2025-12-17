import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "cats",
  version: "0.0.1"
});

const Input = z.object({
  catName: z.string().optional().describe("The cats name")
});

type Input = z.infer<typeof Input>;

server.registerTool(
  "get-cat-status",
  {
    title: "Schrödinger's cats",
    description: "We are concerned with the cats health status here",
    inputSchema: Input
  },
  async ({ catName } : Input) => {
    let result: string = "The cats are alive and well!";

    if (catName && catName.toLowerCase() === "bill") {
      result = "Bill is not doing too well. He ate something bad.";
    } else if (catName && catName.toLowerCase() === "bull") {
      result = "Bull is healthy and happy. Nothing to report";
    }

    return {
      content: [
        {
          type: "text",
          text: result
        }
      ]
    };
  }
);

await server.connect(new StdioServerTransport());
