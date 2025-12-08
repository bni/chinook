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
    const streamingRouter = new sst.aws.Router("StreamingRouter");

    new sst.aws.Function("StreamingFunction", {
      streaming: !$dev,
      handler: "./server/index.handler",
      url: {
        router: {
          instance: streamingRouter
        }
      },
      link: [streamingRouter]
    });

    return {
      api: streamingRouter.url
    };
  }
});
