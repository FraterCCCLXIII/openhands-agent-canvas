import type { MCPServerConfig } from "#/types/mcp-server";
import { AUTOMATION_MARKETPLACE_CATALOG } from "./marketplace-catalog";
import { AutomationMarketplaceSection } from "./automation-marketplace-section";
import {
  filterVisibleMarketplaceAutomations,
  groupMarketplaceAutomationsBySection,
} from "./marketplace-filter-utils";
import type { MarketplaceAutomationEntry } from "./marketplace-catalog";
import type { MarketplaceSectionFilter } from "./marketplace-section-filter";

interface AutomationMarketplaceGridProps {
  backendKind: "local" | "cloud";
  installedServers: MCPServerConfig[];
  query?: string;
  sectionFilter?: MarketplaceSectionFilter;
  onSelect: (automation: MarketplaceAutomationEntry) => void;
}

export function AutomationMarketplaceGrid({
  backendKind,
  installedServers,
  query = "",
  sectionFilter = "all",
  onSelect,
}: AutomationMarketplaceGridProps) {
  const visibleAutomations = filterVisibleMarketplaceAutomations({
    automations: AUTOMATION_MARKETPLACE_CATALOG,
    backendKind,
    installedServers,
    query,
    sectionFilter,
  });

  const groupedSections =
    groupMarketplaceAutomationsBySection(visibleAutomations);

  if (groupedSections.length === 0) {
    return null;
  }

  return (
    <div
      data-testid="automation-marketplace-grid"
      className="flex flex-col gap-8"
    >
      {groupedSections.map(({ section, automations }) => (
        <AutomationMarketplaceSection
          key={section.id}
          section={section}
          automations={automations}
          installedServers={installedServers}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
