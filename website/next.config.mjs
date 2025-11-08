const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  serverExternalPackages: ["pino"],
  output: "standalone",
  outputFileTracingIncludes: {
    "/search": ["./node_modules/onnxruntime-node/bin/**/*"]
  }
};

export default nextConfig;
