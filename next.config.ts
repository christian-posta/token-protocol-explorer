import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: turbopackRoot,
  turbopack: {
    root: turbopackRoot,
  },
};

export default nextConfig;
