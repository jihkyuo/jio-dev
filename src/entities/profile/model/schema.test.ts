import { describe, it, expect } from "vitest";
import { profileSchema } from "./schema";

const valid = {
  eyebrow: "Frontend Engineer",
  name: "지오현",
  role: "Senior Frontend Engineer",
  tagline: "복잡한 UI를 단순한 시스템으로.",
  snapshot: { years: 8, domains: ["결제"], headline: "임팩트 한 줄" },
  resumePdf: "/resume.pdf",
  links: {
    email: "a@b.com",
    github: "https://github.com/x",
    linkedin: "https://linkedin.com/in/x",
  },
};

describe("profileSchema", () => {
  it("accepts a fully valid profile", () => {
    expect(profileSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a profile with links.linkedin omitted (optional field)", () => {
    const ok = profileSchema.safeParse({
      ...valid,
      links: { email: valid.links.email, github: valid.links.github },
    });
    expect(ok.success).toBe(true);
  });

  it("rejects a resumePdf that is not a root-relative path", () => {
    const bad = profileSchema.safeParse({ ...valid, resumePdf: "resume.pdf" });
    expect(bad.success).toBe(false);
  });

  it("rejects a non-email links.email", () => {
    const bad = profileSchema.safeParse({
      ...valid,
      links: { ...valid.links, email: "not-an-email" },
    });
    expect(bad.success).toBe(false);
  });

  it("rejects a non-positive snapshot.years", () => {
    const bad = profileSchema.safeParse({
      ...valid,
      snapshot: { ...valid.snapshot, years: 0 },
    });
    expect(bad.success).toBe(false);
  });
});
