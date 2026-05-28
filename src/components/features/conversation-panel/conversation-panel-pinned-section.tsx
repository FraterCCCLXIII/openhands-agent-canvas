import React from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import type { AppConversation } from "#/api/conversation-service/agent-server-conversation-service.types";
import {
  getGroupConversationPreview,
  GROUP_CONVERSATIONS_PREVIEW_LIMIT,
} from "./conversation-panel-list-helpers";

interface ConversationPanelPinnedSectionProps {
  pinnedConversations: readonly AppConversation[];
  isPreviewExpanded: boolean;
  onTogglePreviewExpanded: () => void;
  activeConversationId: string | null;
  renderConversationCard: (conversation: AppConversation) => React.ReactNode;
}

export function ConversationPanelPinnedSection({
  pinnedConversations,
  isPreviewExpanded,
  onTogglePreviewExpanded,
  activeConversationId,
  renderConversationCard,
}: ConversationPanelPinnedSectionProps) {
  const { t } = useTranslation("openhands");

  const { visibleConversations, isPreviewTruncated, isShowingAll } =
    getGroupConversationPreview(pinnedConversations, {
      limit: GROUP_CONVERSATIONS_PREVIEW_LIMIT,
      expanded: isPreviewExpanded,
      activeConversationId,
    });

  return (
    <section
      data-testid="conversation-panel-pinned-section"
      className="pb-2 pt-1"
    >
      <h3 className="py-1.5 pl-2 text-sm font-medium text-[var(--oh-muted)]">
        {t(I18nKey.CONVERSATION_PANEL$PINNED)}
      </h3>
      <div className="space-y-0.5">
        {visibleConversations.map(renderConversationCard)}
      </div>
      {isPreviewTruncated ? (
        <div className="pl-2 pt-0.5">
          <button
            type="button"
            data-testid="conversation-panel-pinned-view-more"
            onClick={onTogglePreviewExpanded}
            className="cursor-pointer text-xs text-[var(--oh-text-dim)] hover:text-white"
          >
            {isShowingAll
              ? t(I18nKey.CONVERSATION_PANEL$LESS)
              : t(I18nKey.CONVERSATION_PANEL$MORE)}
          </button>
        </div>
      ) : null}
    </section>
  );
}
