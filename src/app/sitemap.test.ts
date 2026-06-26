import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("includes home and all project detail urls", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain("https://jio.dev");
    expect(urls.some((u) => u.endsWith("/projects/payment-widget-rearchitecture"))).toBe(true);
    expect(urls.length).toBeGreaterThanOrEqual(3);
  });
});
