import { describe, it, expect } from "vitest";
import { skillsSchema } from "./schema";

describe("skillsSchema", () => {
  it("accepts valid skill buckets", () => {
    const ok = skillsSchema.safeParse({
      core: ["React", "Next.js"],
      comfortable: ["Tailwind"],
      production: ["GraphQL"],
    });
    expect(ok.success).toBe(true);
  });

  it("allows comfortable/production to be empty (only core requires ≥1)", () => {
    const ok = skillsSchema.safeParse({
      core: ["React"],
      comfortable: [],
      production: [],
    });
    expect(ok.success).toBe(true);
  });

  it("rejects an empty core array", () => {
    const bad = skillsSchema.safeParse({
      core: [],
      comfortable: ["Tailwind"],
      production: [],
    });
    expect(bad.success).toBe(false);
  });

  it("rejects when core is missing", () => {
    const bad = skillsSchema.safeParse({
      comfortable: ["Tailwind"],
      production: [],
    });
    expect(bad.success).toBe(false);
  });
});
