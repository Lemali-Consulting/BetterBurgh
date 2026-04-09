import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle better-sqlite3 as a server external so it works in serverless
  serverExternalPackages: ["better-sqlite3"],

  // Ensure the .db file is included in the serverless function bundle
  outputFileTracingIncludes: {
    "/**": ["./betterburgh.db"],
  },
};

export default nextConfig;
