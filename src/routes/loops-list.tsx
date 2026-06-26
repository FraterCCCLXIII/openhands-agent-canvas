import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isAxiosError } from "axios";
import { I18nKey } from "#/i18n/declaration";
import {
  displaySuccessToast,
  displayErrorToast,
} from "#/utils/custom-toast-handlers";
import {
  useLoops,
  useLoopHealth,
  useCreateLoop,
  useDispatchLoop,
} from "#/hooks/query/use-loops";
import { getLoopTemplateById, LOOP_TEMPLATES } from "#/data/loop-templates";
import { LoopCard } from "#/components/features/loops/loop-card";
import { LoopEmptyState } from "#/components/features/loops/loop-empty-state";
import { LoopTemplateCard } from "#/components/features/loops/loop-template-card";
import { CreateLoopModal } from "#/components/features/loops/create-loop-modal";
import { BackendNotConfigured } from "#/components/features/automations/backend-not-configured";
import { BrandButton } from "#/components/features/settings/brand-button";
import { useNavigation } from "#/context/navigation-context";
import {
  extensionModuleCardGridClassName,
  extensionModuleCardGridContainerClassName,
} from "#/utils/extension-module-card-classes";
import { cn } from "#/utils/utils";

export default function LoopsListRoute() {
  const { t } = useTranslation("openhands");
  const { navigate } = useNavigation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const {
    data: healthData,
    isLoading: isHealthLoading,
    refetch: refetchHealth,
  } = useLoopHealth();

  const isBackendHealthy = healthData?.status === "ok";

  const { data, isLoading, isError, refetch } = useLoops({
    enabled: isBackendHealthy,
  });

  const createMutation = useCreateLoop();
  const dispatchMutation = useDispatchLoop();

  const loops = useMemo(() => data?.loops ?? [], [data?.loops]);
  const hasLoops = loops.length > 0;

  const handleCreate = (templateId: string, name: string) => {
    const template = getLoopTemplateById(templateId);
    if (!template) return;

    createMutation.mutate(template.buildDefinition({ name }), {
      onSuccess: (loop) => {
        setIsCreateOpen(false);
        displaySuccessToast(t(I18nKey.LOOPS$CREATE_SUCCESS));
        navigate?.(`/loops/${loop.id}`);
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? ((error.response?.data as { message?: string } | undefined)
              ?.message ?? error.message)
          : t(I18nKey.ERROR$GENERIC);
        displayErrorToast(message);
      },
    });
  };

  const handleRunTurn = (id: string) => {
    setDispatchingId(id);
    dispatchMutation.mutate(id, {
      onSuccess: () => {
        displaySuccessToast(t(I18nKey.LOOPS$RUN_TURN_SUCCESS));
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? ((error.response?.data as { message?: string } | undefined)
              ?.message ?? error.message)
          : t(I18nKey.ERROR$GENERIC);
        displayErrorToast(message);
      },
      onSettled: () => setDispatchingId(null),
    });
  };

  if (isHealthLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="h-8 w-48 animate-pulse rounded bg-surface-raised" />
      </div>
    );
  }

  if (!isBackendHealthy) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <BackendNotConfigured onRetry={refetchHealth} />
      </div>
    );
  }

  return (
    <div
      data-testid="loops-list-screen"
      className="min-h-full p-6 max-w-5xl mx-auto flex flex-col gap-8"
    >
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-medium text-content">
            {t(I18nKey.LOOPS$TITLE)}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-tertiary-light">
            {t(I18nKey.LOOPS$SUBTITLE)}
          </p>
        </div>
        <BrandButton
          type="button"
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
        >
          {t(I18nKey.LOOPS$CREATE_FROM_TEMPLATE)}
        </BrandButton>
      </header>

      {!hasLoops && !isLoading ? (
        <>
          <LoopEmptyState onCreate={() => setIsCreateOpen(true)} />
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-foreground">
              {t(I18nKey.LOOPS$TEMPLATES_TITLE)}
            </h2>
            <div className={cn(extensionModuleCardGridContainerClassName)}>
              <div className={extensionModuleCardGridClassName}>
                {LOOP_TEMPLATES.map((template) => (
                  <LoopTemplateCard
                    key={template.id}
                    template={template}
                    onSelect={() => setIsCreateOpen(true)}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-48 animate-pulse rounded-lg bg-surface-raised" />
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-200">
          {t(I18nKey.ERROR$GENERIC)}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => void refetch()}
          >
            {t(I18nKey.AUTOMATIONS$ERROR_RETRY)}
          </button>
        </div>
      ) : null}

      {hasLoops ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-foreground">
            {t(I18nKey.LOOPS$YOUR_LOOPS)}
          </h2>
          <div className={extensionModuleCardGridClassName}>
            {loops.map((loop) => (
              <LoopCard
                key={loop.id}
                loop={loop}
                onRunNow={handleRunTurn}
                isRunPending={dispatchingId === loop.id}
              />
            ))}
          </div>
        </section>
      ) : null}

      <CreateLoopModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreate}
        isPending={createMutation.isPending}
      />
    </div>
  );
}
