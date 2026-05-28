import { useCallback, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { AppConversation } from "#/api/conversation-service/agent-server-conversation-service.types";
import { I18nKey } from "#/i18n/declaration";
import { ConversationGroupFolderRow } from "./conversation-group-folder-row";
import {
  moveGroupFolderOrder,
  type ConversationGroupLaunch,
} from "./conversation-panel-list-helpers";

interface ConversationGroup {
  id: string;
  label: string;
  conversations: AppConversation[];
  launch: ConversationGroupLaunch;
}

interface ConversationGroupFolderListProps {
  groups: ConversationGroup[];
  groupIds: readonly string[];
  groupFolderOrder: readonly string[];
  setGroupFolderOrder: (order: readonly string[]) => void;
  collapsedGroupIds: ReadonlySet<string>;
  expandedGroupPreviewIds: ReadonlySet<string>;
  onToggleGroupCollapsed: (groupId: string) => void;
  onToggleGroupPreviewExpanded: (groupId: string) => void;
  isCreatingConversationFlow: boolean;
  activeConversationId?: string | null;
  onLaunchFromGroup: (launch: ConversationGroupLaunch) => void;
  renderConversationCard: (conversation: AppConversation) => ReactNode;
}

export function ConversationGroupFolderList({
  groups,
  groupIds,
  groupFolderOrder,
  setGroupFolderOrder,
  collapsedGroupIds,
  expandedGroupPreviewIds,
  onToggleGroupCollapsed,
  onToggleGroupPreviewExpanded,
  isCreatingConversationFlow,
  activeConversationId,
  onLaunchFromGroup,
  renderConversationCard,
}: ConversationGroupFolderListProps) {
  const { t } = useTranslation("openhands");
  const [draggedGroupId, setDraggedGroupId] = useState<string | null>(null);
  const [dropTargetGroupId, setDropTargetGroupId] = useState<string | null>(
    null,
  );

  const handleDrop = useCallback(
    (targetGroupId: string) => {
      if (!draggedGroupId || draggedGroupId === targetGroupId) {
        return;
      }

      setGroupFolderOrder(
        moveGroupFolderOrder(
          groupFolderOrder,
          groupIds,
          draggedGroupId,
          targetGroupId,
        ),
      );
      setDraggedGroupId(null);
      setDropTargetGroupId(null);
    },
    [draggedGroupId, groupFolderOrder, groupIds, setGroupFolderOrder],
  );

  return (
    <nav
      aria-label={t(I18nKey.SIDEBAR$CONVERSATIONS)}
      className="space-y-1 md:space-y-0.5 pb-1"
    >
      {groups.map((group) => (
        <ConversationGroupFolderRow
          key={group.id}
          group={group}
          expanded={!collapsedGroupIds.has(group.id)}
          previewExpanded={expandedGroupPreviewIds.has(group.id)}
          isDragging={draggedGroupId === group.id}
          isDropTarget={
            dropTargetGroupId === group.id && draggedGroupId !== group.id
          }
          isCreatingConversationFlow={isCreatingConversationFlow}
          activeConversationId={activeConversationId}
          onToggleExpanded={() => onToggleGroupCollapsed(group.id)}
          onDragStart={() => setDraggedGroupId(group.id)}
          onDragEnd={() => {
            setDraggedGroupId(null);
            setDropTargetGroupId(null);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            const { dataTransfer } = event;
            if (dataTransfer) {
              dataTransfer.dropEffect = "move";
            }
            setDropTargetGroupId(group.id);
          }}
          onDragLeave={() => {
            setDropTargetGroupId((current) =>
              current === group.id ? null : current,
            );
          }}
          onDrop={(event) => {
            event.preventDefault();
            handleDrop(group.id);
          }}
          onTogglePreviewExpanded={() => onToggleGroupPreviewExpanded(group.id)}
          onLaunchFromGroup={() => onLaunchFromGroup(group.launch)}
          renderConversationCard={renderConversationCard}
        />
      ))}
    </nav>
  );
}
