import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";
import {
  CloudNewConversationMenu,
  type CloudNewConversationMenuTriggerProps,
} from "./cloud-new-conversation-menu";

interface CloudNewConversationButtonProps {
  /**
   * Render the trigger as a "+" icon-only button (used by the collapsed
   * sidebar). The popover content is unchanged; only the trigger pill
   * collapses.
   */
  compact?: boolean;
}

/**
 * Cloud-backend variant of the sidebar "+ New Conversation" trigger.
 *
 * Lists git repositories (filtered by an optional search query) from the
 * active provider. Clicking a row immediately launches a conversation
 * against the repo's default branch (falling back to "main"). No branch
 * picker is exposed — the user can switch branches from inside the
 * conversation once it's running.
 */
export function CloudNewConversationButton({
  compact = false,
}: CloudNewConversationButtonProps = {}) {
  const { t } = useTranslation("openhands");
  const newConversationLabel = t(I18nKey.SIDEBAR$NEW_CONVERSATION);

  const renderTrigger = React.useCallback(
    (tp: CloudNewConversationMenuTriggerProps) => {
      const triggerButton = (
        <button
          type="button"
          data-testid="new-conversation-button"
          {...tp}
          aria-label={compact ? newConversationLabel : undefined}
          className={cn(
            "flex items-center rounded-md cursor-pointer transition-colors",
            "text-sm font-medium text-white bg-[var(--oh-surface)]/60 hover:bg-[var(--oh-surface-raised)]",
            "border border-[var(--oh-border)]",
            compact
              ? "justify-center w-10 h-10 p-0 mx-auto"
              : "gap-1.5 w-full px-3 py-2",
          )}
        >
          <Plus width={16} height={16} className="shrink-0" />
          {!compact && newConversationLabel}
        </button>
      );

      return compact ? (
        <StyledTooltip content={newConversationLabel} placement="right">
          {triggerButton}
        </StyledTooltip>
      ) : (
        triggerButton
      );
    },
    [compact, newConversationLabel],
  );

  return (
    <CloudNewConversationMenu
      className={cn(compact && "flex justify-center")}
      popoverClassName={compact ? "left-0 w-[260px]" : "left-0 right-0"}
      trigger={renderTrigger}
    />
  );
}
