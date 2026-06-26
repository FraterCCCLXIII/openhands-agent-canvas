import { describe, expect, it } from "vitest";
import { formatMemoryContextSuffix } from "#/apps/odysseus-client";

describe("memory context", () => {
  it("formats memory suffix block", () => {
    const suffix = formatMemoryContextSuffix([
      { id: "1", text: "Prefers morning meetings", category: "preference" },
    ]);
    expect(suffix).toContain("<USER_MEMORY>");
    expect(suffix).toContain("morning meetings");
    expect(suffix).toContain("Notes");
  });

  it("returns empty string when no memories", () => {
    expect(formatMemoryContextSuffix([])).toBe("");
  });
});
