import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { search } from "./search.js";
import type { Input, Output } from "./types.js";
import { InputZod, OutputZod } from "./types.js";

const server = new McpServer({
  name: "albums",
  version: "0.0.1"
});

server.registerTool(
  "search-artist-albums",
  {
    title: "Search music, artist, albums by feeling",
    inputSchema: InputZod,
    outputSchema: OutputZod
  },
  async ({ query } : Input) => {
    const output: Output = await search(query);

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
};

await main();
