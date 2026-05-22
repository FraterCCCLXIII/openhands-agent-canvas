import { describe, expect, it } from "vitest";
import {
  EXTENSION_MODULE_CARD_GRID_SINGLE_COLUMN_MAX_PX,
  extensionModuleCardGridClassName,
  extensionModuleCardGridContainerClassName,
} from "#/utils/extension-module-card-classes";

describe("extensionModuleCardGrid classes", () => {
  it("uses a container query breakpoint at 600px column width", () => {
    expect(EXTENSION_MODULE_CARD_GRID_SINGLE_COLUMN_MAX_PX).toBe(599);
    expect(extensionModuleCardGridContainerClassName).toContain("@container");
    expect(extensionModuleCardGridClassName).toContain("@min-[600px]:grid-cols-2");
    expect(extensionModuleCardGridClassName).not.toContain("md:grid-cols-2");
  });
});
