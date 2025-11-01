const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  experimental: {
    largePageDataBytes: 500000
  },
  serverExternalPackages: ["pino"],
  output: "standalone"
};

export default nextConfig;
