# streaming-mcp-server

## Startup
- `npm run dev` dev mode (streaming does not work in dev mode yet)
- `npm run deploy` to deploy (needed for actual streaming to work)

## MCP Inspector
- `npm run inspect` to launch MCP Inspector
  - Select Transport Type: Streamable HTTP
  - Input the URL to the MCP server: ${CLOUDFRONT_URL}/streaming/notifications/mcp
  - Need to use 0.16.2 or older for now since we don't handle logging/setLoglevel
