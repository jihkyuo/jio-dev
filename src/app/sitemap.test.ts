import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { siteConfig } from "@/shared/config";
import { getProjectSlugs } from "@/entities/project";

describe("sitemap", () => {
  it("includes the home url and exactly one detail url per project", () => {
    const base = siteConfig.url.replace(/\/$/, "");
    const urls = sitemap().map((e) => e.url);
    const expected = [
      base,
      ...getProjectSlugs().map((slug) => `${base}/projects/${slug}`),
    ];
    expect([...urls].sort()).toEqual([...expected].sort());
  });
});
