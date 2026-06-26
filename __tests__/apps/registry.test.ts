import { describe, expect, it } from "vitest";
import {
  getDefaultEnabledWorkAppIds,
  getWorkApps,
  isKnownAppId,
  resolveAgentToolNamesForApps,
  serializeEnabledAppIds,
} from "#/apps/registry";

describe("apps registry", () => {
  it("includes core work apps", () => {
    const ids = getWorkApps().map((app) => app.id);
    expect(ids).toContain("notes");
    expect(ids).toContain("email");
    expect(ids).toContain("calendar");
    expect(ids).toContain("browser");
  });

  it("resolves agent tool names for enabled apps", () => {
    const names = resolveAgentToolNamesForApps(["notes", "calendar"]);
    expect(names).toContain("notes");
    expect(names).toContain("calendar");
  });

  it("serializes enabled app ids uniquely", () => {
    expect(serializeEnabledAppIds(["notes", "notes", "browser"])).toBe(
      "notes,browser",
    );
  });

  it("knows built-in app ids", () => {
    expect(isKnownAppId("memory")).toBe(true);
    expect(isKnownAppId("unknown_app")).toBe(false);
  });

  it("provides default enabled work apps", () => {
    const defaults = getDefaultEnabledWorkAppIds();
    expect(defaults.length).toBeGreaterThan(0);
    expect(defaults).toContain("notes");
  });
});
