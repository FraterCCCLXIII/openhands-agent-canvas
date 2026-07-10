import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { useAutomations } from "#/hooks/query/use-automations";
import { useAutomationHealth } from "#/hooks/query/use-automation-health";
import { AutomationCardSkeleton } from "#/components/features/automations/automation-card-skeleton";
import { BackendNotConfigured } from "#/components/features/automations/backend-not-configured";
import { ErrorState } from "#/components/features/automations/error-state";
import { AddAutomationMenu } from "#/components/features/automations/add-automation-menu";
import { AddAutomationModal } from "#/components/features/automations/add-automation-modal";
import { CreateAutomationWizardModal } from "#/components/features/automations/create-automation-wizard/create-automation-wizard-modal";
import { groupAutomationsByKind } from "#/utils/automation-kind";
import { AutomateDashboardStatCard } from "./automate-dashboard-stat-card";
import { AutomateDashboardCategoryCard } from "./automate-dashboard-category-card";
import { AutomateDashboardRecentActivity } from "./automate-dashboard-recent-activity";
import { AUTOMATE_DASHBOARD_CATEGORIES } from "./automate-dashboard.constants";

export function AutomateDashboard() {
  const { t } = useTranslation("openhands");
  const [isAddAutomationOpen, setIsAddAutomationOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const {
    data: healthData,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useAutomationHealth();
  const isBackendHealthy = healthData?.status === "ok";

  const { data, isLoading, isError, refetch } = useAutomations({
    enabled: isBackendHealthy,
  });

  const automations = data?.automations ?? [];
  const grouped = useMemo(
    () => groupAutomationsByKind(automations),
    [automations],
  );
  const activeCount = useMemo(
    () => automations.filter((automation) => automation.enabled).length,
    [automations],
  );

  const openCreateFlow = () => setIsWizardOpen(true);

  if (isHealthLoading || (isBackendHealthy && isLoading)) {
    return (
      <div
        data-testid="automations-dashboard-screen"
        className="flex flex-col gap-6 pb-8"
      >
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-content">
            {t(I18nKey.AUTOMATE$NAV_DASHBOARD)}
          </h1>
          <p className="text-sm text-muted">
            {t(I18nKey.AUTOMATE$PAGE_DASHBOARD_SUBTITLE)}
          </p>
        </header>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <AutomationCardSkeleton
              key={`dashboard-skeleton-${String(index)}`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!isBackendHealthy) {
    return (
      <div
        data-testid="automations-dashboard-screen"
        className="flex flex-col gap-6 pb-8"
      >
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-content">
            {t(I18nKey.AUTOMATE$NAV_DASHBOARD)}
          </h1>
          <p className="text-sm text-muted">
            {t(I18nKey.AUTOMATE$PAGE_DASHBOARD_SUBTITLE)}
          </p>
        </header>
        <BackendNotConfigured onRetry={refetchHealth} />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-testid="automations-dashboard-screen"
        className="flex flex-col gap-6 pb-8"
      >
        <header className="space-y-1">
          <h1 className="text-xl font-semibold text-content">
            {t(I18nKey.AUTOMATE$NAV_DASHBOARD)}
          </h1>
          <p className="text-sm text-muted">
            {t(I18nKey.AUTOMATE$PAGE_DASHBOARD_SUBTITLE)}
          </p>
        </header>
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  return (
    <div
      data-testid="automations-dashboard-screen"
      className="flex flex-col gap-6 pb-8"
    >
      <div className="flex items-start justify-between gap-4">
        <header className="min-w-0 space-y-1">
          <h1 className="text-xl font-semibold text-content">
            {t(I18nKey.AUTOMATE$NAV_DASHBOARD)}
          </h1>
          <p className="text-sm text-muted">
            {t(I18nKey.AUTOMATE$PAGE_DASHBOARD_SUBTITLE)}
          </p>
        </header>
        <AddAutomationMenu
          onSetupManually={() => setIsAddAutomationOpen(true)}
          onUseWizard={() => setIsWizardOpen(true)}
        />
      </div>

      <div
        data-testid="automate-dashboard-stats"
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        <AutomateDashboardStatCard
          testId="automate-dashboard-stat-total"
          label={t(I18nKey.AUTOMATE$DASHBOARD_STAT_TOTAL)}
          value={automations.length}
        />
        <AutomateDashboardStatCard
          testId="automate-dashboard-stat-active"
          label={t(I18nKey.AUTOMATIONS$ACTIVE)}
          value={activeCount}
        />
        <AutomateDashboardStatCard
          testId="automate-dashboard-stat-routines"
          label={t(I18nKey.AUTOMATE$NAV_ROUTINES)}
          value={grouped.routine.length}
        />
        <AutomateDashboardStatCard
          testId="automate-dashboard-stat-responders"
          label={t(I18nKey.AUTOMATE$NAV_RESPONDERS)}
          value={grouped.responder.length}
        />
      </div>

      <div
        data-testid="automate-dashboard-categories"
        className="grid grid-cols-1 gap-3 lg:grid-cols-3"
      >
        {AUTOMATE_DASHBOARD_CATEGORIES.map((config) => (
          <AutomateDashboardCategoryCard
            key={config.kind}
            config={config}
            count={grouped[config.kind].length}
            onCreate={openCreateFlow}
          />
        ))}
      </div>

      <AutomateDashboardRecentActivity automations={automations} />

      <AddAutomationModal
        isOpen={isAddAutomationOpen}
        onClose={() => setIsAddAutomationOpen(false)}
      />
      <CreateAutomationWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
