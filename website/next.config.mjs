const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  serverExternalPackages: ["pino"],
  output: "standalone",
  outputFileTracingIncludes: {
    "/search": [
      "./node_modules/onnxruntime-node/bin/**/*"
    ],
    "/api/internal/artists": [
      "./node_modules/pino-loki/dist/**/*",
      "./node_modules/pino-abstract-transport/**/*"
    ]
  }
};

export default nextConfig;
