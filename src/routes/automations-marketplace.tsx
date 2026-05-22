import { useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { AutomationsMarketplaceToolbar } from "#/components/features/automations/marketplace/automations-marketplace-toolbar";
import { AutomationMarketplaceLauncher } from "#/components/features/automations/marketplace/automation-marketplace-launcher";
import type { MarketplaceSectionFilter } from "#/components/features/automations/marketplace/marketplace-section-filter";

export default function AutomationsMarketplace() {
  const { t } = useTranslation("openhands");
  const [searchQuery, setSearchQuery] = useState("");
  const [sectionFilter, setSectionFilter] =
    useState<MarketplaceSectionFilter>("all");

  return (
    <div
      data-testid="automations-marketplace-page"
      className="flex flex-col gap-6"
    >
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-content">
          {t(I18nKey.AUTOMATIONS$MARKETPLACE)}
        </h1>
        <p className="text-sm text-muted">
          {t(I18nKey.AUTOMATIONS$MARKETPLACE_SUBTITLE)}
        </p>
      </header>

      <AutomationsMarketplaceToolbar
        search={searchQuery}
        onSearchChange={setSearchQuery}
        sectionFilter={sectionFilter}
        onSectionFilterChange={setSectionFilter}
      />

      <AutomationMarketplaceLauncher
        query={searchQuery}
        sectionFilter={sectionFilter}
      />
    </div>
  );
}
