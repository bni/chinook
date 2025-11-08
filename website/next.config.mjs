const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  serverExternalPackages: ["pino", "pino-http", "pino-loki"],
  output: "standalone",
  outputFileTracingIncludes: {
    "/search": ["./node_modules/onnxruntime-node/bin/**/*"]
  }
};

export default nextConfig;
