import type { MetadataRoute } from "next";
import { siteConfig } from "@/shared/config";
import { getProjectSlugs } from "@/entities/project";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    ...getProjectSlugs().map((slug) => ({
      url: `${base}/projects/${slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
