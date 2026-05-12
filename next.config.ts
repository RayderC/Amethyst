import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  transpilePackages: ["react-markdown", "remark-gfm"],
};

export default nextConfig;
