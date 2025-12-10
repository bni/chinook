const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  serverExternalPackages: ["pino"],
  outputFileTracingIncludes: {
    "/search": [
      "./node_modules/onnxruntime-node/bin/**/*"
    ]
  },
  logging: {
    incomingRequests: false
  }
};

export default nextConfig;
