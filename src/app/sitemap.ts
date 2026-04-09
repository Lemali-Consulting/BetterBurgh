import type { MetadataRoute } from "next";
import { getAllServiceSlugs, getCategories } from "@/lib/db";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://betterburgh.org";
  const slugs = getAllServiceSlugs();
  const categories = getCategories();

  const entries: MetadataRoute.Sitemap = [];

  // Static pages for each locale
  for (const locale of ["en", "es"]) {
    entries.push(
      { url: `${baseUrl}/${locale}`, changeFrequency: "weekly", priority: 1.0 },
      { url: `${baseUrl}/${locale}/services`, changeFrequency: "weekly", priority: 0.9 },
      { url: `${baseUrl}/${locale}/crisis`, changeFrequency: "monthly", priority: 0.9 },
      { url: `${baseUrl}/${locale}/map`, changeFrequency: "weekly", priority: 0.7 },
      { url: `${baseUrl}/${locale}/about`, changeFrequency: "monthly", priority: 0.3 }
    );

    // Category pages
    for (const cat of categories) {
      entries.push({
        url: `${baseUrl}/${locale}/services?category=${cat.slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    // Service detail pages
    for (const slug of slugs) {
      entries.push({
        url: `${baseUrl}/${locale}/services/${slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
