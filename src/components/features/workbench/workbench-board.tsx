import { Suspense, lazy, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { BrandButton } from "#/components/features/settings/brand-button";
import { useNavigation } from "#/context/navigation-context";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import {
  displayErrorToast,
  displaySuccessToast,
} from "#/utils/custom-toast-handlers";
import { LoadingSpinner } from "#/components/shared/loading-spinner";
import { ConfirmationModal } from "#/components/shared/modals/confirmation-modal";
import { WorkbenchColumnComponent } from "./workbench-column";
import { NewTaskModal, type NewTaskPayload } from "./new-task-modal";
import { ALL_REPOSITORIES, NO_REPOSITORY, type WorkbenchCard } from "./types";
import { IN_PROGRESS_COLUMN_ID } from "./conversation-mapper";
import { useWorkbenchArchiveStore } from "./use-workbench-archive-store";
import type { WorkbenchData } from "./use-workbench-data";

// The drawer pulls in the full live-chat provider stack; lazy-load it so the
// chat bundle stays out of the workbench route's eager graph until a card is
// actually opened.
const WorkbenchConversationDrawer = lazy(() =>
  import("./workbench-conversation-drawer").then((module) => ({
    default: module.WorkbenchConversationDrawer,
  })),
);

interface WorkbenchBoardProps extends WorkbenchData {
  activeRepo: string;
  isRailOpen: boolean;
  onToggleRail: () => void;
}

export function WorkbenchBoard({
  activeRepo,
  isRailOpen,
  onToggleRail,
  columns,
  repositories,
  repositoryProviders,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: WorkbenchBoardProps) {
  const { t } = useTranslation("openhands");
  const { navigate } = useNavigation();
  const isCloud = useActiveBackend().backend.kind === "cloud";
  const createConversation = useCreateConversation();
  const archiveConversation = useWorkbenchArchiveStore(
    (state) => state.archive,
  );
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<WorkbenchCard | null>(null);
  const [cardToArchive, setCardToArchive] = useState<WorkbenchCard | null>(
    null,
  );

  const isFiltered = activeRepo !== ALL_REPOSITORIES;

  const visibleColumns = useMemo(() => {
    if (!isFiltered) return columns;
    return columns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => card.repo === activeRepo),
    }));
  }, [columns, activeRepo, isFiltered]);

  const runningCount = useMemo(
    () =>
      visibleColumns.find((column) => column.id === IN_PROGRESS_COLUMN_ID)
        ?.cards.length ?? 0,
    [visibleColumns],
  );

  // Repositories the New Task flow can start against (those that report a
  // git provider), plus the "no repository" option.
  const startableRepos = useMemo(
    () => [
      NO_REPOSITORY,
      ...repositories.filter((repo) => repositoryProviders.has(repo)),
    ],
    [repositories, repositoryProviders],
  );

  const handleCreateTask = (payload: NewTaskPayload) => {
    const provider =
      payload.repo !== NO_REPOSITORY
        ? repositoryProviders.get(payload.repo)
        : undefined;
    createConversation.mutate(
      {
        query: payload.prompt,
        repository: provider
          ? { name: payload.repo, gitProvider: provider }
          : undefined,
      },
      {
        onSuccess: (result) => {
          setIsNewTaskOpen(false);
          displaySuccessToast(t(I18nKey.WORKBENCH$TASK_QUEUED));
          navigate(`/conversations/${result.conversation_id}`);
        },
        onError: () => {
          displayErrorToast(t(I18nKey.WORKBENCH$TASK_CREATE_ERROR));
        },
      },
    );
  };

  const handleConfirmArchive = () => {
    if (!cardToArchive) return;
    archiveConversation(cardToArchive.id);
    displaySuccessToast(t(I18nKey.WORKBENCH$ARCHIVED_TOAST));
    setCardToArchive(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-3 pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            data-testid="workbench-toggle-rail"
            onClick={onToggleRail}
            aria-expanded={isRailOpen}
            aria-label={t(
              isRailOpen
                ? I18nKey.WORKBENCH$HIDE_WORKSPACES
                : I18nKey.WORKBENCH$SHOW_WORKSPACES,
            )}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-tertiary-light transition-colors hover:bg-surface-raised hover:text-white"
          >
            {isRailOpen ? (
              <PanelLeftClose width={14} height={14} />
            ) : (
              <PanelLeftOpen width={14} height={14} />
            )}
          </button>
          <h2 className="truncate text-lg font-medium text-white">
            {activeRepo === ALL_REPOSITORIES
              ? t(I18nKey.WORKBENCH$ALL)
              : activeRepo === NO_REPOSITORY
                ? t(
                    isCloud
                      ? I18nKey.WORKBENCH$NO_REPOSITORY
                      : I18nKey.WORKBENCH$NO_WORKSPACE,
                  )
                : activeRepo}
          </h2>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {runningCount > 0 ? (
            <div className="hidden items-center gap-2 text-sm md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              <span className="text-tertiary-light">
                {t(I18nKey.WORKBENCH$AGENTS_ONLINE, { count: runningCount })}
              </span>
            </div>
          ) : null}
          <BrandButton
            type="button"
            variant="primary"
            testId="workbench-new-task"
            startContent={<Plus width={16} height={16} aria-hidden />}
            isDisabled={createConversation.isPending}
            onClick={() => setIsNewTaskOpen(true)}
          >
            {t(I18nKey.WORKBENCH$NEW_TASK)}
          </BrandButton>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : isError ? (
        <div className="flex flex-1 items-center justify-center px-4">
          <p className="text-sm text-tertiary-light">
            {t(I18nKey.WORKBENCH$LOAD_ERROR)}
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-stretch gap-4 overflow-x-auto px-4 pb-4 custom-scrollbar">
          {visibleColumns.map((column) => (
            <WorkbenchColumnComponent
              key={column.id}
              column={column}
              onCardClick={setSelectedCard}
              onArchiveCard={setCardToArchive}
            />
          ))}
          {hasNextPage ? (
            <div className="flex shrink-0 items-start pt-1">
              <button
                type="button"
                data-testid="workbench-load-more"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="rounded-lg border border-[var(--oh-border)] px-4 py-2 text-sm text-white transition-colors hover:bg-surface-raised disabled:opacity-50"
              >
                {t(I18nKey.WORKBENCH$LOAD_MORE)}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {isNewTaskOpen ? (
        <NewTaskModal
          repositories={startableRepos}
          isSubmitting={createConversation.isPending}
          onCreate={handleCreateTask}
          onClose={() => setIsNewTaskOpen(false)}
        />
      ) : null}

      <Suspense fallback={null}>
        <WorkbenchConversationDrawer
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      </Suspense>

      {cardToArchive ? (
        <ConfirmationModal
          text={t(I18nKey.WORKBENCH$ARCHIVE_CONFIRM, {
            title: cardToArchive.title,
          })}
          onConfirm={handleConfirmArchive}
          onCancel={() => setCardToArchive(null)}
        />
      ) : null}
    </div>
  );
}
