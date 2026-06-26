import { describe, it, expect } from "vitest";
import { getProfile } from "./getProfile";

describe("getProfile", () => {
  it("returns a schema-valid profile with a resume PDF and snapshot", () => {
    const p = getProfile();
    expect(p.resumePdf.startsWith("/")).toBe(true);
    expect(p.snapshot.years).toBeGreaterThan(0);
    expect(p.snapshot.domains.length).toBeGreaterThan(0);
    expect(p.name.length).toBeGreaterThan(0);
  });
});
