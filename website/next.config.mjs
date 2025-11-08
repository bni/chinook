const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  serverExternalPackages: [
    "thread-stream",
    "pino",
    "pino-worker",
    "pino-pretty",
    "pino-http",
    "pino-loki"
  ],
  output: "standalone",
  outputFileTracingIncludes: {
    "/search": ["./node_modules/onnxruntime-node/bin/**/*"]
  }
};

export default nextConfig;
