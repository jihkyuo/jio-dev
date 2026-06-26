import { describe, it, expect } from "vitest";
import {
  getProfile,
  getExperience,
  getSkills,
  getProjects,
  getProjectSlugs,
} from "@/content";

describe("content barrel", () => {
  it("re-exports all loaders", () => {
    expect(getProfile().name.length).toBeGreaterThan(0);
    expect(getExperience().length).toBeGreaterThan(0);
    expect(getSkills().core.length).toBeGreaterThan(0);
    expect(getProjects().length).toBeGreaterThan(0);
    expect(getProjectSlugs().length).toBeGreaterThan(0);
  });
});
