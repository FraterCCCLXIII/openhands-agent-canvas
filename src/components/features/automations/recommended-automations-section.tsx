import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { I18nKey } from "#/i18n/declaration";
import {
  AUTOMATION_CATALOG,
  type RecommendedAutomation,
} from "@openhands/extensions/automations";
import {
  INTEGRATION_CATALOG as INTEGRATION_MARKETPLACE,
  type IntegrationCatalogEntry as MarketplaceEntry,
} from "@openhands/extensions/integrations";
import { McpLogoStackBadge } from "#/components/features/mcp-page/mcp-logo-stack-badge";
import { McpLogoBadge } from "#/components/features/mcp-logo-badge";
import {
  SkillCardPillRow,
  type SkillCardPill,
} from "#/components/features/skills/skill-card-pill-row";
import { CirclePlusBadge } from "#/components/shared/buttons/circle-plus-check-toggle";
import { MCPServerConfig } from "#/types/mcp-server";
import {
  findInstalledMatch,
  getInstallableTemplate,
  getMarketplaceEntryById,
  isMarketplaceEntryAvailable,
} from "#/utils/mcp-marketplace-utils";
import { cn } from "#/utils/utils";
import {
  extensionModuleCardInteractiveClassName,
  extensionModuleCardElevatedSurfaceClassName,
  extensionModuleCardGridClassName,
  extensionModuleCardGridContainerClassName,
  extensionModuleCardPillClassName,
  extensionModuleCardSurfaceClassName,
} from "#/utils/extension-module-card-classes";
import ClockIcon from "#/icons/clock.svg?react";
import { StatusBadge } from "./status-badge";

export type RecommendedAutomationsSectionVariant = "default" | "home";

export const HOME_RECOMMENDED_AUTOMATIONS_PREVIEW_LIMIT = 4;

interface RecommendedAutomationsSectionProps {
  backendKind: "local" | "cloud";
  installedServers: MCPServerConfig[];
  query?: string;
  onSelect: (automation: RecommendedAutomation) => void;
  variant?: RecommendedAutomationsSectionVariant;
  limit?: number;
  onViewMore?: () => void;
}

export function getAutomationsByPopularity(
  catalog: RecommendedAutomation[],
): RecommendedAutomation[] {
  return catalog
    .map((automation, index) => ({ automation, index }))
    .sort((a, b) => {
      const byPopularity =
        (b.automation.popularityRank ?? 0) - (a.automation.popularityRank ?? 0);
      return byPopularity || a.index - b.index;
    })
    .map(({ automation }) => automation);
}

const RECOMMENDED_AUTOMATIONS = getAutomationsByPopularity(AUTOMATION_CATALOG);

function getRequiredEntries(automation: RecommendedAutomation) {
  return automation.requiredIntegrationIds
    .map((id) => getMarketplaceEntryById(id, INTEGRATION_MARKETPLACE))
    .filter((entry): entry is MarketplaceEntry => !!entry);
}

function automationMatchesQuery(
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

function isAutomationAvailable(
  automation: RecommendedAutomation,
  backendKind: "local" | "cloud",
) {
  return getRequiredEntries(automation).every((entry) =>
    isMarketplaceEntryAvailable(entry, backendKind),
  );
}

function buildRecommendedAutomationPills(
  automation: RecommendedAutomation,
  requiredEntries: MarketplaceEntry[],
  installedServers: MCPServerConfig[],
  missingCount: number,
  translate: TFunction,
  includeSetupDuration: boolean,
): SkillCardPill[] {
  const pills: SkillCardPill[] = requiredEntries.map((entry) => {
    const template = getInstallableTemplate(entry);
    const installed = template
      ? !!findInstalledMatch(template, installedServers)
      : false;

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

  if (includeSetupDuration) {
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
  }

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

export function RecommendedAutomationsSection({
  backendKind,
  installedServers,
  query = "",
  onSelect,
  variant = "default",
  limit,
  onViewMore,
}: RecommendedAutomationsSectionProps) {
  const { t } = useTranslation("openhands");
  const isHomeVariant = variant === "home";
  const showPlusBadge = !isHomeVariant;
  const showSetupDuration = !isHomeVariant;
  const cardSurfaceClassName = isHomeVariant
    ? extensionModuleCardElevatedSurfaceClassName
    : extensionModuleCardSurfaceClassName;

  const visibleAutomations = RECOMMENDED_AUTOMATIONS.filter((automation) => {
    const requiredEntries = getRequiredEntries(automation);
    return (
      isAutomationAvailable(automation, backendKind) &&
      automationMatchesQuery(automation, requiredEntries, query)
    );
  });

  if (visibleAutomations.length === 0) return null;

  const displayedAutomations =
    limit != null ? visibleAutomations.slice(0, limit) : visibleAutomations;
  const hasMore =
    limit != null && onViewMore != null && visibleAutomations.length > limit;
  const isHomeStrip = isHomeVariant && limit != null;

  const renderAutomationCard = (automation: RecommendedAutomation) => {
    const requiredEntries = getRequiredEntries(automation);
    const missingCount = requiredEntries.filter((entry) => {
      const template = getInstallableTemplate(entry);
      return !template || !findInstalledMatch(template, installedServers);
    }).length;

    if (isHomeStrip) {
      return (
        <button
          key={automation.id}
          type="button"
          data-testid={`recommended-automation-card-${automation.id}`}
          onClick={() => onSelect(automation)}
          className={cn(
            "flex min-w-0 flex-1 flex-col items-start gap-2 p-3 text-left",
            cardSurfaceClassName,
            extensionModuleCardInteractiveClassName,
          )}
        >
          <McpLogoStackBadge
            entries={requiredEntries}
            size="sm"
            testId={`recommended-automation-icon-${automation.id}`}
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-white">
              {automation.name}
            </h3>
            <p className="truncate text-[11px] text-tertiary-alt">
              {automation.category}
            </p>
          </div>
        </button>
      );
    }

    return (
      <button
        key={automation.id}
        type="button"
        data-testid={`recommended-automation-card-${automation.id}`}
        onClick={() => onSelect(automation)}
        className={cn(
          "flex min-w-0 overflow-hidden p-4 text-left",
          cardSurfaceClassName,
          extensionModuleCardInteractiveClassName,
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <McpLogoStackBadge
            entries={requiredEntries}
            testId={`recommended-automation-icon-${automation.id}`}
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
              {showPlusBadge ? (
                <CirclePlusBadge
                  testId={`recommended-automation-plus-${automation.id}`}
                />
              ) : null}
            </header>
            <p className="line-clamp-2 text-xs leading-relaxed text-tertiary-light">
              {automation.description}
            </p>

            <SkillCardPillRow
              pills={buildRecommendedAutomationPills(
                automation,
                requiredEntries,
                installedServers,
                missingCount,
                t,
                showSetupDuration,
              )}
              testId={`recommended-automation-pills-${automation.id}`}
            />
          </div>
        </div>
      </button>
    );
  };

  return (
    <section data-testid="recommended-automations-section">
      {!isHomeVariant ? (
        <>
          <div className="flex items-center">
            <h2 className="text-base font-semibold text-foreground">
              {t(I18nKey.RECOMMENDED_AUTOMATIONS$SECTION_TITLE)}
            </h2>
            <StatusBadge count={visibleAutomations.length} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {t(I18nKey.RECOMMENDED_AUTOMATIONS$SECTION_DESCRIPTION)}
          </p>
        </>
      ) : null}

      {isHomeStrip ? (
        <div className="mb-2 flex w-full items-center justify-between gap-3">
          <h2
            data-testid="recommended-automations-home-label"
            className="text-left text-xs font-normal text-tertiary-alt"
          >
            {t(I18nKey.RECOMMENDED_AUTOMATIONS$SECTION_LABEL)}
          </h2>
          {hasMore ? (
            <button
              type="button"
              data-testid="recommended-automations-view-more"
              onClick={onViewMore}
              className="shrink-0 cursor-pointer text-xs text-tertiary-alt transition-colors hover:text-white"
            >
              {t(I18nKey.COMMON$VIEW_MORE)}
            </button>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          isHomeStrip
            ? "w-full min-w-0"
            : cn(
                !isHomeVariant && "mt-3",
                extensionModuleCardGridContainerClassName,
              ),
        )}
      >
        <div
          data-testid={
            isHomeStrip ? "recommended-automations-home-strip" : undefined
          }
          className={
            isHomeStrip
              ? "flex w-full min-w-0 gap-2"
              : extensionModuleCardGridClassName
          }
        >
          {displayedAutomations.map((automation) =>
            renderAutomationCard(automation),
          )}
        </div>
      </div>
    </section>
  );
}
