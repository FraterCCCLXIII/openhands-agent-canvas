import { Folder, Plus } from "lucide-react";
import type { DragEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { AppConversation } from "#/api/conversation-service/agent-server-conversation-service.types";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import type { ConversationGroupLaunch } from "./conversation-panel-list-helpers";
import { getGroupConversationPreview } from "./conversation-panel-list-helpers";

interface ConversationGroup {
  id: string;
  label: string;
  conversations: AppConversation[];
  launch: ConversationGroupLaunch;
}

interface ConversationGroupFolderRowProps {
  group: ConversationGroup;
  expanded: boolean;
  previewExpanded: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  isCreatingConversationFlow: boolean;
  activeConversationId?: string | null;
  onToggleExpanded: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
  onTogglePreviewExpanded: () => void;
  onLaunchFromGroup: () => void;
  renderConversationCard: (conversation: AppConversation) => ReactNode;
}

export function ConversationGroupFolderRow({
  group,
  expanded,
  previewExpanded,
  isDragging,
  isDropTarget,
  isCreatingConversationFlow,
  activeConversationId,
  onToggleExpanded,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTogglePreviewExpanded,
  onLaunchFromGroup,
  renderConversationCard,
}: ConversationGroupFolderRowProps) {
  const { t } = useTranslation("openhands");
  const headingId = `thread-folder-${group.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  const groupTestIdSuffix = group.id.replace(/[^a-zA-Z0-9_-]/g, "-");
  const { visibleConversations, isPreviewTruncated, isShowingAll } =
    getGroupConversationPreview(group.conversations, {
      expanded: previewExpanded,
      activeConversationId,
    });

  return (
    <section
      aria-labelledby={headingId}
      data-testid={`thread-folder-${groupTestIdSuffix}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        isDropTarget && "rounded-md ring-1 ring-[var(--oh-border)]",
        isDragging && "opacity-60",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-full min-w-0 items-center gap-0.5 rounded-md pl-2 pr-1 text-sm font-normal",
          "text-[var(--oh-muted)] transition-colors hover:bg-[var(--oh-surface-raised)] hover:text-white",
        )}
      >
        <button
          type="button"
          draggable
          id={headingId}
          aria-expanded={expanded}
          aria-controls={`thread-folder-content-${groupTestIdSuffix}`}
          data-testid={`thread-folder-drag-${groupTestIdSuffix}`}
          aria-label={
            expanded
              ? t(I18nKey.CONVERSATION_PANEL$COLLAPSE_FOLDER, {
                  label: group.label,
                })
              : t(I18nKey.CONVERSATION_PANEL$EXPAND_FOLDER, {
                  label: group.label,
                })
          }
          onClick={onToggleExpanded}
          onDragStart={(event) => {
            event.stopPropagation();
            const { dataTransfer } = event;
            if (dataTransfer) {
              dataTransfer.effectAllowed = "move";
              dataTransfer.setData("text/plain", group.id);
            }
            onDragStart();
          }}
          onDragEnd={(event) => {
            event.stopPropagation();
            onDragEnd();
          }}
          className={cn(
            "flex min-h-8 min-w-0 flex-1 cursor-grab items-center gap-2 rounded-md py-1 text-left text-inherit outline-none active:cursor-grabbing",
            "focus-visible:ring-1 focus-visible:ring-[var(--oh-border)]",
          )}
        >
          <Folder className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{group.label}</span>
        </button>
        <button
          type="button"
          className={cn(
            "inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md",
            "text-inherit transition-colors",
            "hover:bg-white/10 hover:text-white",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--oh-border)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          disabled={isCreatingConversationFlow}
          aria-label={t(I18nKey.CONVERSATION_PANEL$ADD_CONVERSATION_TO_GROUP, {
            label: group.label,
          })}
          data-testid={`add-conversation-to-group-${groupTestIdSuffix}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onLaunchFromGroup();
          }}
        >
          <Plus className="h-3.5 w-3.5 shrink-0" aria-hidden strokeWidth={2} />
        </button>
      </div>
      {expanded ? (
        <div
          id={`thread-folder-content-${groupTestIdSuffix}`}
          className="mt-0.5 space-y-0.5"
        >
          {visibleConversations.map(renderConversationCard)}
          {isPreviewTruncated ? (
            <div className="pl-2">
              <button
                type="button"
                data-testid={`thread-folder-view-more-${groupTestIdSuffix}`}
                onClick={onTogglePreviewExpanded}
                className="cursor-pointer text-xs text-[var(--oh-text-dim)] hover:text-white"
              >
                {isShowingAll
                  ? t(I18nKey.CONVERSATION_PANEL$LESS)
                  : t(I18nKey.CONVERSATION_PANEL$MORE)}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
