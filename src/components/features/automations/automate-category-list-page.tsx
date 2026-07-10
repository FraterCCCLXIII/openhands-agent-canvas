import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { I18nKey } from "#/i18n/declaration";
import {
  displayErrorToast,
  displaySuccessToast,
} from "#/utils/custom-toast-handlers";
import {
  useAutomations,
  useToggleAutomation,
  useDeleteAutomation,
  useDispatchAutomation,
} from "#/hooks/query/use-automations";
import { useAutomationHealth } from "#/hooks/query/use-automation-health";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { SearchInput } from "#/components/features/automations/search-input";
import { AutomationGroup } from "#/components/features/automations/automation-group";
import { AutomationViewToggle } from "#/components/features/automations/automation-view-toggle";
import {
  readStoredAutomationViewMode,
  writeStoredAutomationViewMode,
  type AutomationViewMode,
} from "#/components/features/automations/automation-view-mode";
import { AutomationCardSkeleton } from "#/components/features/automations/automation-card-skeleton";
import { ErrorState } from "#/components/features/automations/error-state";
import { BackendNotConfigured } from "#/components/features/automations/backend-not-configured";
import { DeleteConfirmationModal } from "#/components/features/automations/delete-confirmation-modal";
import { EditAutomationModal } from "#/components/features/automations/detail/edit-automation-modal";
import { AutomatePageHeader } from "#/components/features/automations/automate-page-header";
import { AutomateCategoryEmptyState } from "#/components/features/automations/automate-category-empty-state";
import { useAutomateAddAutomation } from "#/components/features/automations/automate-add-automation-provider";
import { LocalScheduleNotice } from "#/components/features/automations/local-schedule-notice";
import { ScheduledTasksIntroModal } from "#/components/features/automations/scheduled-tasks-intro-modal";
import { useTracking } from "#/hooks/use-tracking";
import type { Automation } from "#/types/automation";
import {
  getAutomationKind,
  type AutomationKind,
} from "#/utils/automation-kind";

const PAGE_SIZE = 50;

export interface AutomateCategoryListPageConfig {
  kind: AutomationKind;
  testId: string;
  titleKey: I18nKey;
  subtitleKey: I18nKey;
  createLabelKey: I18nKey;
  createTestId: string;
  emptyTitleKey: I18nKey;
  emptyDescriptionKey: I18nKey;
  emptyTestId: string;
  /** Routines-only: intro modal + local schedule awake notice. */
  showScheduleExtras?: boolean;
}

function matchesSearchQuery(automation: Automation, query: string) {
  const q = query.toLowerCase();
  return (
    automation.name.toLowerCase().includes(q) ||
    (automation.prompt ?? "").toLowerCase().includes(q) ||
    automation.repository?.toLowerCase().includes(q) ||
    automation.model?.toLowerCase().includes(q)
  );
}

interface AutomateCategoryListPageProps {
  config: AutomateCategoryListPageConfig;
}

export function AutomateCategoryListPage({
  config,
}: AutomateCategoryListPageProps) {
  const { t } = useTranslation("openhands");
  const addAutomation = useAutomateAddAutomation();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<AutomationViewMode>(() =>
    readStoredAutomationViewMode(),
  );
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editTarget, setEditTarget] = useState<Automation | null>(null);

  const active = useActiveBackend();
  const canEdit = active.backend.kind === "local";

  const {
    data: healthData,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useAutomationHealth();
  const isBackendHealthy = healthData?.status === "ok";

  const { data, isLoading, isError, refetch } = useAutomations({
    limit,
    offset: 0,
    enabled: isBackendHealthy,
  });
  const { trackPrebuiltAutomationEnabled } = useTracking();
  const toggleMutation = useToggleAutomation();
  const deleteMutation = useDeleteAutomation();
  const dispatchMutation = useDispatchAutomation();

  const categoryAutomations = useMemo(
    () =>
      (data?.automations ?? []).filter(
        (automation) => getAutomationKind(automation) === config.kind,
      ),
    [config.kind, data?.automations],
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return categoryAutomations;
    return categoryAutomations.filter((automation) =>
      matchesSearchQuery(automation, searchQuery),
    );
  }, [categoryAutomations, searchQuery]);

  const activeAutomations = useMemo(
    () => filtered.filter((automation) => automation.enabled),
    [filtered],
  );
  const inactive = useMemo(
    () => filtered.filter((automation) => !automation.enabled),
    [filtered],
  );

  const handleToggle = (id: string, currentEnabled: boolean) => {
    const willEnable = !currentEnabled;
    toggleMutation.mutate({ id, enabled: willEnable });
    if (willEnable) {
      const automation = categoryAutomations.find(
        (candidate) => candidate.id === id,
      );
      trackPrebuiltAutomationEnabled({
        automationId: id,
        automationName: automation?.name ?? id,
      });
    }
  };

  const handleRunNow = (id: string) => {
    dispatchMutation.mutate(id, {
      onSuccess: () => {
        displaySuccessToast(t(I18nKey.AUTOMATIONS$RUN_NOW_SUCCESS));
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? (error.response?.data as { message?: string } | undefined)
              ?.message ||
            error.message ||
            t(I18nKey.AUTOMATIONS$RUN_NOW_ERROR)
          : (error as Error).message || t(I18nKey.AUTOMATIONS$RUN_NOW_ERROR);
        displayErrorToast(message);
      },
    });
  };

  const handleDeleteRequest = (id: string) => {
    const automation = categoryAutomations.find(
      (candidate) => candidate.id === id,
    );
    if (automation) {
      setDeleteTarget({ id, name: automation.name });
    }
  };

  const handleEditRequest = (id: string) => {
    const automation = categoryAutomations.find(
      (candidate) => candidate.id === id,
    );
    if (automation) {
      setEditTarget(automation);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleViewModeChange = useCallback((view: AutomationViewMode) => {
    setViewMode(view);
    writeStoredAutomationViewMode(view);
  }, []);

  const openCreateFlow = () => addAutomation?.openWizard();

  const hasMore = data ? data.total > data.automations.length : false;
  const hasNoCategoryAutomations =
    !isLoading && !isError && categoryAutomations.length === 0;

  const pageHeader = (
    <AutomatePageHeader
      titleKey={config.titleKey}
      subtitleKey={config.subtitleKey}
      createLabelKey={config.createLabelKey}
      createTestId={config.createTestId}
    />
  );

  if (isHealthLoading) {
    return (
      <div data-testid={config.testId} className="flex flex-col gap-6 pb-8">
        {pageHeader}
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <AutomationCardSkeleton key={`skeleton-${String(index)}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!isBackendHealthy) {
    return (
      <div data-testid={config.testId} className="flex flex-col gap-6 pb-8">
        {pageHeader}
        <BackendNotConfigured onRetry={refetchHealth} />
      </div>
    );
  }

  return (
    <div data-testid={config.testId} className="flex flex-col gap-6 pb-8">
      {config.showScheduleExtras ? <ScheduledTasksIntroModal /> : null}
      {pageHeader}

      <div className="flex items-stretch gap-2">
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
        <AutomationViewToggle
          view={viewMode}
          onChange={handleViewModeChange}
          disabled={hasNoCategoryAutomations}
        />
      </div>

      {config.showScheduleExtras ? <LocalScheduleNotice /> : null}

      <div className="flex flex-col gap-6">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <AutomationCardSkeleton key={`skeleton-${String(index)}`} />
            ))}
          </div>
        )}

        {isError && !isLoading && <ErrorState onRetry={refetch} />}

        {hasNoCategoryAutomations && (
          <AutomateCategoryEmptyState
            testId={config.emptyTestId}
            titleKey={config.emptyTitleKey}
            descriptionKey={config.emptyDescriptionKey}
            createLabelKey={config.createLabelKey}
            onCreate={() => openCreateFlow?.()}
          />
        )}

        {!isLoading && !isError && categoryAutomations.length > 0 && (
          <>
            <AutomationGroup
              title={t(I18nKey.AUTOMATIONS$ACTIVE)}
              count={activeAutomations.length}
              automations={activeAutomations}
              view={viewMode}
              onToggle={handleToggle}
              onRunNow={handleRunNow}
              runPendingId={
                dispatchMutation.isPending
                  ? (dispatchMutation.variables ?? null)
                  : null
              }
              onDelete={handleDeleteRequest}
              onEdit={canEdit ? handleEditRequest : undefined}
            />
            <AutomationGroup
              title={t(I18nKey.AUTOMATIONS$INACTIVE)}
              count={inactive.length}
              automations={inactive}
              view={viewMode}
              onToggle={handleToggle}
              onRunNow={handleRunNow}
              runPendingId={
                dispatchMutation.isPending
                  ? (dispatchMutation.variables ?? null)
                  : null
              }
              onDelete={handleDeleteRequest}
              onEdit={canEdit ? handleEditRequest : undefined}
            />

            {hasMore && (
              <button
                type="button"
                onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
                className="self-center rounded-lg border border-[var(--oh-border)] px-6 py-2 text-sm text-white hover:bg-surface-raised"
              >
                {t(I18nKey.AUTOMATIONS$LOAD_MORE)}
              </button>
            )}
          </>
        )}
      </div>

      <DeleteConfirmationModal
        automationName={deleteTarget?.name ?? ""}
        isOpen={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {editTarget && (
        <EditAutomationModal
          automation={editTarget}
          isOpen={editTarget !== null}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
