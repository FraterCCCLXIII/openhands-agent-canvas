import type { LucideIcon } from "lucide-react";
import type { McpCatalogEntry as MarketplaceEntry } from "@openhands/extensions/mcps";
import { McpLogoStackBadge } from "#/components/features/mcp-page/mcp-logo-stack-badge";
import { MarketplaceAutomationIconBadge } from "./marketplace-automation-icon-badge";
import type { MarketplaceAutomationEntry } from "./marketplace-catalog";

interface MarketplaceAutomationIconProps {
  automation: MarketplaceAutomationEntry;
  requiredEntries: MarketplaceEntry[];
  testId?: string;
}

export function MarketplaceAutomationIcon({
  automation,
  requiredEntries,
  testId,
}: MarketplaceAutomationIconProps) {
  if (automation.iconSource === "mcp") {
    return <McpLogoStackBadge entries={requiredEntries} testId={testId} />;
  }

  return (
    <MarketplaceAutomationIconBadge
      icon={automation.icon}
      iconBg={automation.iconBg}
      iconColor={automation.iconColor}
      testId={testId}
    />
  );
}

export type { LucideIcon };
