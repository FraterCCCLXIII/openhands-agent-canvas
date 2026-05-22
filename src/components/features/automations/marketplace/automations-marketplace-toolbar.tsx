import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import type { MarketplaceSectionFilter } from "./marketplace-section-filter";
import { MarketplaceSectionFilterDropdown } from "./marketplace-section-filter-dropdown";

interface AutomationsMarketplaceToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sectionFilter: MarketplaceSectionFilter;
  onSectionFilterChange: (filter: MarketplaceSectionFilter) => void;
}

export function AutomationsMarketplaceToolbar({
  search,
  onSearchChange,
  sectionFilter,
  onSectionFilterChange,
}: AutomationsMarketplaceToolbarProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      data-testid="automations-marketplace-toolbar"
      className="flex items-stretch gap-2"
    >
      <div
        className={cn(
          "relative flex min-w-0 flex-1 items-center",
          "rounded-lg border border-[var(--oh-border)] bg-base-secondary",
          "transition-colors focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/20",
        )}
      >
        <Search
          className="ml-3 h-4 w-4 shrink-0 text-tertiary-alt"
          aria-hidden
        />
        <input
          data-testid="automations-marketplace-search-input"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t(I18nKey.AUTOMATIONS$SEARCH_PLACEHOLDER)}
          aria-label={t(I18nKey.AUTOMATIONS$SEARCH_PLACEHOLDER)}
          className={cn(
            "min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-tertiary-alt",
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label={t(I18nKey.MCP$SEARCH_CLEAR)}
            data-testid="automations-marketplace-search-clear"
            className="mr-2 cursor-pointer rounded p-1 text-tertiary-alt hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <MarketplaceSectionFilterDropdown
        value={sectionFilter}
        onChange={onSectionFilterChange}
      />
    </div>
  );
}
