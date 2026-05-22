import { describe, expect, it } from "vitest";
import {
  AUTOMATION_MARKETPLACE_CATALOG,
  ORIGINAL_AUTOMATION_CATALOG_IDS,
} from "#/components/features/automations/marketplace/marketplace-catalog";
import { groupMarketplaceAutomationsBySection } from "#/components/features/automations/marketplace/marketplace-filter-utils";
import { MARKETPLACE_SECTION_POPULAR } from "#/components/features/automations/marketplace/marketplace-section-ids";
import { MARKETPLACE_SECTIONS } from "#/components/features/automations/marketplace/marketplace-sections";

describe("AUTOMATION_MARKETPLACE_CATALOG", () => {
  it("includes a larger sample list grouped into marketplace sections", () => {
    expect(AUTOMATION_MARKETPLACE_CATALOG.length).toBeGreaterThanOrEqual(20);

    const grouped = groupMarketplaceAutomationsBySection(
      AUTOMATION_MARKETPLACE_CATALOG,
    );
    expect(grouped[0]?.section.id).toBe(MARKETPLACE_SECTION_POPULAR);
    expect(grouped[0]?.automations.length).toBeGreaterThan(0);
    expect(grouped.length).toBe(MARKETPLACE_SECTIONS.length);
  });

  it("uses MCP logo stacks for original catalog automations", () => {
    for (const automation of AUTOMATION_MARKETPLACE_CATALOG) {
      if (ORIGINAL_AUTOMATION_CATALOG_IDS.has(automation.id)) {
        expect(automation.iconSource).toBe("mcp");
      }
    }
  });

  it("assigns colored lucide icons to marketplace-only samples", () => {
    for (const automation of AUTOMATION_MARKETPLACE_CATALOG) {
      if (automation.iconSource !== "lucide") continue;

      expect(automation.icon).toBeTruthy();
      expect(automation.iconBg).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
