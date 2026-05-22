import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { I18nKey } from "#/i18n/declaration";
import type { RecommendedAutomation } from "@openhands/extensions/automations";
import type { McpCatalogEntry as MarketplaceEntry } from "@openhands/extensions/mcps";
import { McpLogoBadge } from "#/components/features/mcp-logo-badge";
import {
  SkillCardPillRow,
  type SkillCardPill,
} from "#/components/features/skills/skill-card-pill-row";
import { CirclePlusBadge } from "#/components/shared/buttons/circle-plus-check-toggle";
import type { MCPServerConfig } from "#/types/mcp-server";
import { findInstalledMatch } from "#/utils/mcp-marketplace-utils";
import { cn } from "#/utils/utils";
import {
  extensionModuleCardGridClassName,
  extensionModuleCardGridContainerClassName,
  extensionModuleCardInteractiveClassName,
  extensionModuleCardPillClassName,
  extensionModuleCardSurfaceClassName,
} from "#/utils/extension-module-card-classes";
import ClockIcon from "#/icons/clock.svg?react";
import { StatusBadge } from "../status-badge";
import type { MarketplaceAutomationEntry } from "./marketplace-catalog";
import { MarketplaceAutomationIcon } from "./marketplace-automation-icon";
import type { MarketplaceSectionDefinition } from "./marketplace-sections";
import {
  countMissingMarketplaceConnections,
  getMarketplaceRequiredEntries,
} from "./marketplace-filter-utils";

function buildMarketplaceAutomationPills(
  automation: RecommendedAutomation,
  requiredEntries: MarketplaceEntry[],
  installedServers: MCPServerConfig[],
  missingCount: number,
  translate: TFunction,
): SkillCardPill[] {
  const pills: SkillCardPill[] = requiredEntries.map((entry) => {
    const installed = !!findInstalledMatch(entry.template, installedServers);

    return {
      id: `mcp-${entry.id}`,
      node: (
        <span className={cn(extensionModuleCardPillClassName, "gap-1")}>
          <McpLogoBadge entry={entry} size="xs" />
          {entry.name}
          {installed ? (
            <span className="text-white">
              {translate(I18nKey.RECOMMENDED_AUTOMATIONS$CONNECTED)}
            </span>
          ) : null}
        </span>
      ),
    };
  });

  pills.push({
    id: "setup-minutes",
    node: (
      <span className={cn(extensionModuleCardPillClassName, "gap-1")}>
        <ClockIcon className="size-3 shrink-0" />
        {translate(I18nKey.RECOMMENDED_AUTOMATIONS$MINUTES, {
          count: automation.estimatedSetupMinutes,
        })}
      </span>
    ),
  });

  if (missingCount > 0) {
    pills.push({
      id: "missing-connect",
      node: (
        <span className={extensionModuleCardPillClassName}>
          {translate(I18nKey.RECOMMENDED_AUTOMATIONS$MISSING_CONNECT, {
            count: missingCount,
          })}
        </span>
      ),
    });
  }

  return pills;
}

interface AutomationMarketplaceSectionProps {
  section: MarketplaceSectionDefinition;
  automations: MarketplaceAutomationEntry[];
  installedServers: MCPServerConfig[];
  onSelect: (automation: MarketplaceAutomationEntry) => void;
}

export function AutomationMarketplaceSection({
  section,
  automations,
  installedServers,
  onSelect,
}: AutomationMarketplaceSectionProps) {
  const { t } = useTranslation("openhands");

  if (automations.length === 0) return null;

  return (
    <section data-testid={`automation-marketplace-section-${section.id}`}>
      <div className="flex items-center">
        <h2 className="text-base font-semibold text-foreground">
          {t(section.labelKey)}
        </h2>
        <StatusBadge count={automations.length} />
      </div>

      <div className={cn("mt-3", extensionModuleCardGridContainerClassName)}>
        <div className={extensionModuleCardGridClassName}>
          {automations.map((automation) => {
            const requiredEntries = getMarketplaceRequiredEntries(automation);
            const missingCount = countMissingMarketplaceConnections(
              requiredEntries,
              installedServers,
            );

            return (
              <button
                key={automation.id}
                type="button"
                data-testid={`marketplace-automation-card-${automation.id}`}
                onClick={() => onSelect(automation)}
                className={cn(
                  "flex min-w-0 overflow-hidden p-4 text-left",
                  extensionModuleCardSurfaceClassName,
                  extensionModuleCardInteractiveClassName,
                )}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <MarketplaceAutomationIcon
                    automation={automation}
                    requiredEntries={requiredEntries}
                    testId={`marketplace-automation-icon-${automation.id}`}
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <header className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {automation.name}
                        </h3>
                        <p className="mt-0.5 truncate text-xs text-tertiary-alt">
                          {automation.category}
                        </p>
                      </div>
                      <CirclePlusBadge
                        testId={`marketplace-automation-plus-${automation.id}`}
                      />
                    </header>
                    <p className="line-clamp-2 text-xs leading-relaxed text-tertiary-light">
                      {automation.description}
                    </p>

                    <SkillCardPillRow
                      pills={buildMarketplaceAutomationPills(
                        automation,
                        requiredEntries,
                        installedServers,
                        missingCount,
                        t,
                      )}
                      testId={`marketplace-automation-pills-${automation.id}`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
