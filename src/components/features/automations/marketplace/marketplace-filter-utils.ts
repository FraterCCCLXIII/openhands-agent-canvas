import {
  MCP_CATALOG as MCP_MARKETPLACE,
  type McpCatalogEntry as MarketplaceEntry,
} from "@openhands/extensions/mcps";
import type { RecommendedAutomation } from "@openhands/extensions/automations";
import {
  findInstalledMatch,
  getMarketplaceEntryById,
  isMarketplaceEntryAvailable,
} from "#/utils/mcp-marketplace-utils";
import type { MCPServerConfig } from "#/types/mcp-server";
import type { MarketplaceAutomationEntry } from "./marketplace-catalog";
import type { MarketplaceSectionFilter } from "./marketplace-section-filter";
import { MARKETPLACE_SECTIONS } from "./marketplace-sections";

export function getMarketplaceRequiredEntries(
  automation: RecommendedAutomation,
) {
  return automation.requiredMcpIds
    .map((id) => getMarketplaceEntryById(id, MCP_MARKETPLACE))
    .filter((entry): entry is MarketplaceEntry => !!entry);
}

export function marketplaceAutomationMatchesQuery(
  automation: RecommendedAutomation,
  entries: MarketplaceEntry[],
  rawQuery: string,
) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    automation.name,
    automation.category,
    automation.description,
    automation.prompt,
    ...entries.map((entry) => entry.name),
    ...entries.flatMap((entry) => entry.keywords ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function isMarketplaceAutomationAvailable(
  automation: RecommendedAutomation,
  backendKind: "local" | "cloud",
) {
  return getMarketplaceRequiredEntries(automation).every((entry) =>
    isMarketplaceEntryAvailable(entry, backendKind),
  );
}

export function groupMarketplaceAutomationsBySection(
  automations: MarketplaceAutomationEntry[],
) {
  return MARKETPLACE_SECTIONS.map((section) => ({
    section,
    automations: automations.filter(
      (automation) => automation.sectionId === section.id,
    ),
  })).filter(
    ({ automations: sectionAutomations }) => sectionAutomations.length > 0,
  );
}

export function filterVisibleMarketplaceAutomations({
  automations,
  backendKind,
  installedServers: _installedServers,
  query,
  sectionFilter = "all",
}: {
  automations: MarketplaceAutomationEntry[];
  backendKind: "local" | "cloud";
  installedServers: MCPServerConfig[];
  query: string;
  sectionFilter?: MarketplaceSectionFilter;
}) {
  return automations.filter((automation) => {
    const requiredEntries = getMarketplaceRequiredEntries(automation);
    const matchesSection =
      sectionFilter === "all" || automation.sectionId === sectionFilter;

    return (
      matchesSection &&
      isMarketplaceAutomationAvailable(automation, backendKind) &&
      marketplaceAutomationMatchesQuery(automation, requiredEntries, query)
    );
  });
}

export function countMissingMarketplaceConnections(
  requiredEntries: MarketplaceEntry[],
  installedServers: MCPServerConfig[],
) {
  return requiredEntries.filter(
    (entry) => !findInstalledMatch(entry.template, installedServers),
  ).length;
}
