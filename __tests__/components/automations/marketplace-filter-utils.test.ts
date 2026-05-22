import { describe, expect, it } from "vitest";
import { AUTOMATION_MARKETPLACE_CATALOG } from "#/components/features/automations/marketplace/marketplace-catalog";
import { filterVisibleMarketplaceAutomations } from "#/components/features/automations/marketplace/marketplace-filter-utils";
import { MARKETPLACE_SECTION_CODE_QUALITY } from "#/components/features/automations/marketplace/marketplace-section-ids";

describe("filterVisibleMarketplaceAutomations", () => {
  it("limits results to a selected marketplace section", () => {
    const visible = filterVisibleMarketplaceAutomations({
      automations: AUTOMATION_MARKETPLACE_CATALOG,
      backendKind: "local",
      installedServers: [],
      query: "",
      sectionFilter: MARKETPLACE_SECTION_CODE_QUALITY,
    });

    expect(visible.length).toBeGreaterThan(0);
    expect(
      visible.every(
        (automation) => automation.sectionId === MARKETPLACE_SECTION_CODE_QUALITY,
      ),
    ).toBe(true);
  });
});
