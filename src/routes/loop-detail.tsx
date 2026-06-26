import { useRef, useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { I18nKey } from "#/i18n/declaration";
import {
  displaySuccessToast,
  displayErrorToast,
} from "#/utils/custom-toast-handlers";
import {
  useLoopDetail,
  useLoopHealth,
  useLoopRuns,
  useToggleLoop,
  useDeleteLoop,
  useDispatchLoop,
} from "#/hooks/query/use-loops";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { useNavigation } from "#/context/navigation-context";
import { BackNavButton } from "#/components/shared/buttons/back-nav-button";
import { BackendNotConfigured } from "#/components/features/automations/backend-not-configured";
import { LoopMovesChecklist } from "#/components/features/loops/loop-moves-checklist";
import { LoopStatusBadge } from "#/components/features/loops/loop-status-badge";
import { ToggleSwitch } from "#/components/features/automations/toggle-switch";
import { DeleteConfirmationModal } from "#/components/features/automations/delete-confirmation-modal";
import { BrandButton } from "#/components/features/settings/brand-button";
import { LoopRunStatus } from "#/types/loop";
import { cn } from "#/utils/utils";

export default function LoopDetailRoute() {
  const { t } = useTranslation("openhands");
  const { loopId } = useParams();
  const { navigate } = useNavigation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const active = useActiveBackend();
  const mountedBackendId = useRef(active.backend.id);
  const backendChanged = mountedBackendId.current !== active.backend.id;

  const {
    data: healthData,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useLoopHealth();

  const isBackendHealthy = healthData?.status === "ok";

  const {
    data: loop,
    isLoading,
    isError,
    error,
  } = useLoopDetail(loopId ?? "", {
    enabled: isBackendHealthy && !backendChanged && Boolean(loopId),
  });

  const { data: runsData } = useLoopRuns(loopId ?? "", {
    enabled: Boolean(loop) && isBackendHealthy,
  });

  const toggleMutation = useToggleLoop();
  const deleteMutation = useDeleteLoop();
  const dispatchMutation = useDispatchLoop();

  const is404 =
    isError && isAxiosError(error) && error.response?.status === 404;

  const handleToggle = () => {
    if (!loop) return;
    toggleMutation.mutate({ id: loop.id, enabled: !loop.enabled });
  };

  const handleDelete = () => {
    if (!loop) return;
    deleteMutation.mutate(loop.id, {
      onSuccess: () => {
        displaySuccessToast(t(I18nKey.LOOPS$DELETE_SUCCESS));
        navigate?.("/loops");
      },
    });
  };

  const handleRunTurn = () => {
    if (!loop) return;
    dispatchMutation.mutate(loop.id, {
      onSuccess: () => displaySuccessToast(t(I18nKey.LOOPS$RUN_TURN_SUCCESS)),
      onError: () => displayErrorToast(t(I18nKey.ERROR$GENERIC)),
    });
  };

  if (isHealthLoading || isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="h-8 w-64 animate-pulse rounded bg-surface-raised" />
      </div>
    );
  }

  if (!isBackendHealthy) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <BackendNotConfigured onRetry={refetchHealth} />
      </div>
    );
  }

  if (is404 || !loop) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <BackNavButton to="/loops">
          {t(I18nKey.LOOPS$BACK_TO_LIST)}
        </BackNavButton>
        <p className="mt-4 text-sm text-tertiary-light">
          {t(I18nKey.LOOPS$NOT_FOUND)}
        </p>
      </div>
    );
  }

  const runs = runsData?.runs ?? [];

  return (
    <div
      data-testid="loop-detail-screen"
      className="min-h-full p-6 max-w-4xl mx-auto"
    >
      <BackNavButton to="/loops">{t(I18nKey.LOOPS$BACK_TO_LIST)}</BackNavButton>

      <header className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-medium text-content">{loop.name}</h1>
            <LoopStatusBadge enabled={loop.enabled} />
          </div>
          {loop.description ? (
            <p className="mt-2 text-sm text-tertiary-light">
              {loop.description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BrandButton
            type="button"
            variant="secondary"
            isDisabled={!loop.enabled || dispatchMutation.isPending}
            onClick={handleRunTurn}
          >
            {dispatchMutation.isPending
              ? t(I18nKey.LOOPS$RUNNING_TURN)
              : t(I18nKey.LOOPS$RUN_TURN_NOW)}
          </BrandButton>
          <ToggleSwitch
            enabled={loop.enabled}
            label={
              loop.enabled
                ? t(I18nKey.LOOPS$STATUS_ACTIVE)
                : t(I18nKey.LOOPS$STATUS_PAUSED)
            }
            onToggle={handleToggle}
          />
          <BrandButton
            type="button"
            variant="ghost-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            {t(I18nKey.LOOPS$DELETE)}
          </BrandButton>
        </div>
      </header>

      <section className="mt-8 flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">
          {t(I18nKey.LOOPS$MOVES_TITLE)}
        </h2>
        <LoopMovesChecklist moves={loop.moves} />
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[var(--oh-border)] p-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-tertiary-light">
            {t(I18nKey.LOOPS$DISCOVERY_SKILL)}
          </h3>
          <p className="mt-2 font-mono text-sm text-foreground">
            {loop.discovery.skillId}
          </p>
          <p className="mt-2 text-xs text-tertiary-light">
            {loop.discovery.sources.join(", ")}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--oh-border)] p-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-tertiary-light">
            {t(I18nKey.LOOPS$STATE_FILE)}
          </h3>
          <p className="mt-2 break-all font-mono text-sm text-foreground">
            {loop.persistence.stateFilePath}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--oh-border)] p-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-tertiary-light">
            {t(I18nKey.LOOPS$STOP_CONDITION)}
          </h3>
          <p className="mt-2 text-sm text-foreground">
            {loop.verification.stopCondition}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--oh-border)] p-4">
          <h3 className="text-xs font-medium uppercase tracking-wide text-tertiary-light">
            {t(I18nKey.LOOPS$SCHEDULE)}
          </h3>
          <p className="mt-2 text-sm text-foreground">
            {loop.trigger.schedule_human ?? loop.trigger.schedule ?? "—"}
          </p>
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-3">
        <h2 className="text-sm font-medium text-foreground">
          {t(I18nKey.LOOPS$RUN_HISTORY)}
        </h2>
        {runs.length === 0 ? (
          <p className="text-sm text-tertiary-light">
            {t(I18nKey.LOOPS$NO_RUNS)}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {runs.map((run) => (
              <li
                key={run.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--oh-border)] px-3 py-2 text-sm"
              >
                <span>
                  {t(I18nKey.LOOPS$RUN_TURN_LABEL, { turn: run.turn_number })}
                </span>
                <span
                  className={cn(
                    "text-xs uppercase",
                    run.status === LoopRunStatus.COMPLETED &&
                      "text-emerald-300",
                    run.status === LoopRunStatus.FAILED && "text-red-300",
                    run.status === LoopRunStatus.PENDING &&
                      "text-tertiary-light",
                  )}
                >
                  {run.status}
                </span>
                <span className="text-xs text-tertiary-light">
                  {t(I18nKey.LOOPS$RUN_FINDINGS, { count: run.findings_count })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        automationName={loop.name}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
