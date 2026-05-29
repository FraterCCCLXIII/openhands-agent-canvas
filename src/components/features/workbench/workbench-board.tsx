import {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useState,
  type UIEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { PanelLeftClose, PanelLeftOpen, Plus } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { BrandButton } from "#/components/features/settings/brand-button";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { useSettings } from "#/hooks/query/use-settings";
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
}: WorkbenchBoardProps) {
  const { t } = useTranslation("openhands");
  const isCloud = useActiveBackend().backend.kind === "cloud";
  const { data: settings } = useSettings();
  const createConversation = useCreateConversation();
  const archiveConversation = useWorkbenchArchiveStore(
    (state) => state.archive,
  );
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<WorkbenchCard | null>(null);
  const [cardToArchive, setCardToArchive] = useState<WorkbenchCard | null>(
    null,
  );
  // Tracks horizontal scroll so the board's left edge fades (rather than hard
  // cuts) once columns are scrolled out of view to the left.
  const [isBoardScrolled, setIsBoardScrolled] = useState(false);
  // Optimistic placeholder cards shown in the In Progress column the instant a
  // task is created, until the real conversation surfaces in the refetch.
  const [pendingCards, setPendingCards] = useState<
    { tempId: string; realId?: string; card: WorkbenchCard }[]
  >([]);

  const handleBoardScroll = (event: UIEvent<HTMLDivElement>) => {
    setIsBoardScrolled(event.currentTarget.scrollLeft > 8);
  };

  const presentIds = useMemo(
    () =>
      new Set(columns.flatMap((column) => column.cards.map((card) => card.id))),
    [columns],
  );

  // Clean up resolved placeholders from state once their real conversation is
  // loaded (keeps `pendingCards` from growing). Display correctness is handled
  // at render time below, so this is just housekeeping.
  useEffect(() => {
    setPendingCards((prev) => {
      const next = prev.filter(
        (pending) => !(pending.realId && presentIds.has(pending.realId)),
      );
      return next.length === prev.length ? prev : next;
    });
  }, [presentIds]);

  const isFiltered = activeRepo !== ALL_REPOSITORIES;

  const visibleColumns = useMemo(() => {
    // Hide any placeholder whose real conversation has already loaded — even if
    // the conversation arrived before `onSuccess` tagged the placeholder, or if
    // `columns` hasn't changed since it did.
    const placeholders = pendingCards
      .filter((pending) => !(pending.realId && presentIds.has(pending.realId)))
      .map((pending) => pending.card);
    return columns.map((column) => {
      const baseCards = isFiltered
        ? column.cards.filter((card) => card.repo === activeRepo)
        : column.cards;
      if (column.id !== IN_PROGRESS_COLUMN_ID || placeholders.length === 0) {
        return { ...column, cards: baseCards };
      }
      const relevant = isFiltered
        ? placeholders.filter((card) => card.repo === activeRepo)
        : placeholders;
      return { ...column, cards: [...relevant, ...baseCards] };
    });
  }, [columns, activeRepo, isFiltered, pendingCards, presentIds]);

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

    // Show a skeleton placeholder immediately so the new task is visible on the
    // board before the conversation list refetches.
    const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const nowIso = new Date().toISOString();
    setPendingCards((prev) => [
      ...prev,
      {
        tempId,
        card: {
          id: tempId,
          title: payload.prompt,
          repo: payload.repo,
          sourceType: "task",
          branch: "main",
          baseBranch: "main",
          createdAt: nowIso,
          updatedAt: nowIso,
          isPlaceholder: true,
        },
      },
    ]);

    createConversation.mutate(
      {
        query: payload.prompt,
        repository: provider
          ? { name: payload.repo, gitProvider: provider }
          : undefined,
      },
      {
        onSuccess: (result) => {
          // Stay on the workbench; the placeholder is replaced once the real
          // conversation surfaces in the refetched list (see the prune effect).
          setIsNewTaskOpen(false);
          displaySuccessToast(
            t(I18nKey.WORKBENCH$TASK_QUEUED, {
              model: settings?.llm_model ?? "",
            }),
          );
          setPendingCards((prev) =>
            prev.map((pending) =>
              pending.tempId === tempId
                ? { ...pending, realId: result.conversation_id }
                : pending,
            ),
          );
        },
        onError: () => {
          displayErrorToast(t(I18nKey.WORKBENCH$TASK_CREATE_ERROR));
          setPendingCards((prev) =>
            prev.filter((pending) => pending.tempId !== tempId),
          );
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
        <div
          onScroll={handleBoardScroll}
          style={
            isBoardScrolled
              ? {
                  maskImage:
                    "linear-gradient(to right, transparent 0, #000 1.25rem)",
                  WebkitMaskImage:
                    "linear-gradient(to right, transparent 0, #000 1.25rem)",
                }
              : undefined
          }
          className="flex min-h-0 flex-1 items-stretch gap-4 overflow-x-auto px-4 pb-4 custom-scrollbar"
        >
          {visibleColumns.map((column) => (
            <WorkbenchColumnComponent
              key={column.id}
              column={column}
              onCardClick={setSelectedCard}
              onArchiveCard={setCardToArchive}
            />
          ))}
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
