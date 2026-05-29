import React from "react";
import { useTranslation } from "react-i18next";
import { GitBranch, Maximize2, X } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  NavigationProvider,
  useNavigation,
} from "#/context/navigation-context";
import { WebSocketProviderWrapper } from "#/contexts/websocket-provider-wrapper";
import { EventHandler } from "#/wrapper/event-handler";
import { ChatInterface } from "#/components/features/chat/chat-interface";
import { useActiveConversation } from "#/hooks/query/use-active-conversation";
import { useConversationDiffStat } from "#/hooks/query/use-conversation-diff-stat";
import { useCommandStore } from "#/stores/command-store";
import { useConversationStore } from "#/stores/conversation-store";
import { useConversationStateStore } from "#/stores/conversation-state-store";
import { useAgentStore } from "#/stores/agent-store";
import { useErrorMessageStore } from "#/stores/error-message-store";
import { AgentState } from "#/types/agent-state";
import { ExecutionStatus } from "#/types/agent-server/core/base/common";
import { executionStatusToColumnId } from "./conversation-mapper";
import { formatTimeAgo } from "./format-time-ago";
import { DiffStat } from "./diff-stat";
import type { WorkbenchCard } from "./types";

const TRANSITION_MS = 250;

// Reuse the column dot palette so the drawer's live status indicator matches
// the board card the user clicked.
const STATUS_DOT_CLASSES: Record<string, string> = {
  "in-progress": "bg-success animate-pulse",
  waiting: "bg-warning",
  done: "bg-success",
  failed: "bg-danger",
};

function statusDotClass(status: ExecutionStatus | null | undefined): string {
  return (
    STATUS_DOT_CLASSES[executionStatusToColumnId(status)] ??
    "bg-[var(--oh-muted)]"
  );
}

interface DrawerBodyProps {
  card: WorkbenchCard;
  onOpenFull: () => void;
  onClose: () => void;
}

/**
 * Inner panel content. Rendered *inside* the conversation providers so it can
 * read live conversation status and host the chat. Mirrors the per-conversation
 * store resets the `/conversations/:id` route performs on conversation switch.
 */
function DrawerBody({ card, onOpenFull, onClose }: DrawerBodyProps) {
  const { t } = useTranslation("openhands");
  const { data: conversation } = useActiveConversation();

  const clearTerminal = useCommandStore((state) => state.clearTerminal);
  const resetConversationState = useConversationStore(
    (state) => state.resetConversationState,
  );
  const resetConversationRuntimeState = useConversationStateStore(
    (state) => state.reset,
  );
  const setCurrentAgentState = useAgentStore(
    (state) => state.setCurrentAgentState,
  );
  const removeErrorMessage = useErrorMessageStore(
    (state) => state.removeErrorMessage,
  );

  React.useEffect(() => {
    clearTerminal();
    resetConversationState();
    resetConversationRuntimeState();
    setCurrentAgentState(AgentState.LOADING);
    removeErrorMessage();
  }, [
    card.id,
    clearTerminal,
    resetConversationState,
    resetConversationRuntimeState,
    setCurrentAgentState,
    removeErrorMessage,
  ]);

  const title = conversation?.title?.trim() || card.title;
  const branch = conversation?.selected_branch ?? card.branch;
  const repo = conversation?.selected_repository ?? card.repo;
  const model = conversation?.llm_model ?? card.model;
  const updatedAt = conversation?.updated_at ?? card.updatedAt;

  const { data: diffStat } = useConversationDiffStat({
    conversationId: card.id,
    conversationUrl: conversation?.conversation_url,
    sessionApiKey: conversation?.session_api_key,
    selectedRepository: conversation?.selected_repository,
    workingDir: conversation?.workspace?.working_dir,
    enabled: Boolean(conversation),
  });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-2 px-4 pb-2 pt-4">
        <span
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            statusDotClass(conversation?.execution_status),
          )}
          aria-hidden
        />
        <h2 className="min-w-0 flex-1 truncate text-base font-medium text-white">
          {title}
        </h2>
        <button
          type="button"
          data-testid="workbench-drawer-open-full"
          onClick={onOpenFull}
          aria-label={t(I18nKey.WORKBENCH$OPEN_CONVERSATION)}
          className="shrink-0 rounded-md p-1 text-tertiary-light transition-colors hover:bg-surface-raised hover:text-white"
        >
          <Maximize2 width={16} height={16} aria-hidden />
        </button>
        <button
          type="button"
          data-testid="workbench-drawer-close"
          onClick={onClose}
          aria-label={t(I18nKey.BUTTON$CLOSE)}
          className="shrink-0 rounded-md p-1 text-tertiary-light transition-colors hover:bg-surface-raised hover:text-white"
        >
          <X width={16} height={16} aria-hidden />
        </button>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-[var(--oh-border)] px-4 pb-3 text-xs text-tertiary-light">
        <span className="truncate">{repo}</span>
        <span className="inline-flex items-center gap-1">
          <GitBranch width={12} height={12} aria-hidden />
          {branch}
        </span>
        {model ? <span className="truncate">{model}</span> : null}
        <span className="ml-auto flex shrink-0 items-center gap-3">
          {diffStat ? (
            <DiffStat
              additions={diffStat.additions}
              deletions={diffStat.deletions}
            />
          ) : null}
          <span>{formatTimeAgo(t, updatedAt)}</span>
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}

interface WorkbenchConversationDrawerProps {
  /** The clicked card, or null to dismiss the drawer. */
  card: WorkbenchCard | null;
  onClose: () => void;
}

/**
 * Right-side drawer that hosts a live, interactive agent chat for the selected
 * conversation. Composes the same provider stack as the conversation route —
 * a nested `NavigationProvider` override feeds the drawer's conversationId to
 * every chat hook without changing the browser URL.
 */
export function WorkbenchConversationDrawer({
  card,
  onClose,
}: WorkbenchConversationDrawerProps) {
  const { currentPath, navigate } = useNavigation();
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  // Keep the last card during the slide-out so content doesn't blank out.
  const [displayCard, setDisplayCard] = React.useState<WorkbenchCard | null>(
    null,
  );

  React.useEffect(() => {
    if (card) {
      setDisplayCard(card);
      setMounted(true);
      // Next frame: flip to visible so the transform animates in.
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = setTimeout(() => {
      setMounted(false);
      setDisplayCard(null);
    }, TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [card]);

  React.useEffect(() => {
    if (!mounted) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  if (!mounted || !displayCard) return null;

  const handleOpenFull = () => {
    navigate(`/conversations/${displayCard.id}`);
    onClose();
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50",
          "transition-opacity ease-in-out motion-reduce:transition-none",
          visible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={displayCard.title}
        data-testid="workbench-conversation-drawer"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex min-h-0 w-[min(640px,100vw)] flex-col",
          "border-l border-[var(--oh-border)] bg-base shadow-2xl",
          "transition-transform ease-in-out motion-reduce:transition-none",
          visible ? "translate-x-0" : "translate-x-full",
        )}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      >
        <NavigationProvider
          value={{
            currentPath,
            conversationId: displayCard.id,
            isNavigating: false,
            navigate,
          }}
        >
          <WebSocketProviderWrapper conversationId={displayCard.id}>
            <EventHandler>
              <DrawerBody
                card={displayCard}
                onOpenFull={handleOpenFull}
                onClose={onClose}
              />
            </EventHandler>
          </WebSocketProviderWrapper>
        </NavigationProvider>
      </aside>
    </>
  );
}
