import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { search } from "./search.js";
import { InputSchema, OutputSchema, type Input, type Output } from "./types.js";

const server = new McpServer({
  name: "albums",
  version: "0.0.1"
});

server.registerTool(
  "search-artist-albums",
  {
    title: "Search music, artist, albums by feeling",
    inputSchema: InputSchema,
    outputSchema: OutputSchema
  },
  async ({ query } : Input) => {
    const output: Output = await search(query);

    return {
      content: [
        {
          type: "text",
          text: "See the structured content"
        }
      ],
      structuredContent: output
    };
  }
);

await server.connect(new StdioServerTransport());
