/// <reference path="./.sst/platform/config.d.ts" />

// noinspection JSUnusedGlobalSymbols
export default $config({
  app(input) {
    return {
      name: "streaming-mcp-server",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws"
    };
  },
  async run() {
    const api = new sst.aws.Function("Api", {
      url: true,
      streaming: !$dev,
      handler: "./server/index.handler"
    });

    const apiRouter = new sst.aws.Router("ApiRouter", {
      routes: { "/*": api.url }
    });

    return {
      api: apiRouter.url
    };
  }
});
