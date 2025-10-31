const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  experimental: {
    largePageDataBytes: 2000000
  },
  serverExternalPackages: ["pino"],
  output: "standalone"
};

export default nextConfig;
