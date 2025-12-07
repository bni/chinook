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

export type Input = z.infer<typeof Input>;

const Output = z.object({
  result: z.string(),
  catData: z.any().optional()
});

export type Output = z.infer<typeof Output>;

server.registerTool(
  "get-cat-status",
  {
    title: "Schrödinger's cats",
    description: "We are concerned with the cats health status here",
    inputSchema: Input,
    outputSchema: Output
  },
  async ({ catName } : Input) => {
    const output: Output = {
      result: "The cats are alive and well!"
    };

    if (catName && catName.toLowerCase() === "bill") {
      output.result = "Bill is not doing too well";
      output.catData = {
        whatsWrong: "Dunno"
      }
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(output, null, 2)
        }
      ],
      structuredContent: output
    };
  }
);

const main = async () => {
  await server.connect(new StdioServerTransport());

  console.error("Schrödinger's cats MCP Server running on stdio");
};

try {
  await main();
} catch (error) {
  console.error("Fatal error in main():", error);

  process.exit(1);
}
