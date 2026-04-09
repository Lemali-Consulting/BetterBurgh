import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],

  outputFileTracingIncludes: {
    "/": ["./betterburgh.db"],
    "/[locale]": ["./betterburgh.db"],
    "/[locale]/services": ["./betterburgh.db"],
    "/[locale]/services/[slug]": ["./betterburgh.db"],
    "/[locale]/crisis": ["./betterburgh.db"],
    "/[locale]/map": ["./betterburgh.db"],
    "/[locale]/about": ["./betterburgh.db"],
    "/[locale]/categories/[category]": ["./betterburgh.db"],
    "/api/offline-data": ["./betterburgh.db"],
    "/api/event": ["./betterburgh.db"],
  },
};

export default nextConfig;
