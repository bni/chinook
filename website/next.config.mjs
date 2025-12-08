import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  serverExternalPackages: ["pino"],
  output: "standalone",
  outputFileTracingIncludes: {
    "/search": [
      "./node_modules/onnxruntime-node/bin/**/*"
    ]
  },
  turbopack: {
    root: __dirname
  }
};

export default nextConfig;
