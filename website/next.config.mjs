const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  serverExternalPackages: ["pino"],
  output: "standalone",
  outputFileTracingIncludes: {
    "/search": [
      "./node_modules/onnxruntime-node/bin/**/*",
      "./node_modules/pino-loki/dist/*"
    ]
  }
};

export default nextConfig;
