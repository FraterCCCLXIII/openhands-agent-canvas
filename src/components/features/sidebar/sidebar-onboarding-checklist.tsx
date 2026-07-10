import { useState } from "react";
import { Tooltip } from "@heroui/react";
import { Check, ChevronDown, Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavigationLink } from "#/components/shared/navigation-link";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  SIDEBAR_ONBOARDING_CHECKLIST_I18N_KEYS,
  SIDEBAR_ONBOARDING_CHECKLIST_ROUTES,
  type SidebarOnboardingChecklistItemId,
} from "./sidebar-onboarding-checklist.constants";
import { SidebarOnboardingChecklistItemPreview } from "./sidebar-onboarding-checklist-item-preview";
import { SidebarOnboardingAgentNotificationsModal } from "./sidebar-onboarding-agent-notifications-modal";
import { useSidebarOnboardingAgentNotifications } from "#/hooks/sidebar/use-sidebar-onboarding-agent-notifications";
import { useSidebarOnboardingChecklist } from "./use-sidebar-onboarding-checklist";

const CHECKLIST_ITEM_TOOLTIP_CLASS =
  "rounded-xl border border-[var(--oh-border)] bg-base-secondary p-0 text-white shadow-xl";

interface SidebarOnboardingChecklistProps {
  collapsed: boolean;
}

function ChecklistStatusIcon({ isComplete }: { isComplete: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-full border",
        isComplete
          ? "border-primary bg-primary text-[var(--oh-color-base)]"
          : "border-[var(--oh-border)] bg-transparent",
      )}
    >
      {isComplete ? <Check className="size-2.5" strokeWidth={3} /> : null}
    </span>
  );
}

function ChecklistItem({
  id,
  isComplete,
}: {
  id: SidebarOnboardingChecklistItemId;
  isComplete: boolean;
}) {
  const { t } = useTranslation("openhands");
  const labelKey = SIDEBAR_ONBOARDING_CHECKLIST_I18N_KEYS[id];
  const disableAnimation = import.meta.env.MODE === "test";

  return (
    <li>
      <Tooltip
        placement="right-start"
        delay={0}
        closeDelay={100}
        disableAnimation={disableAnimation}
        className={CHECKLIST_ITEM_TOOLTIP_CLASS}
        content={<SidebarOnboardingChecklistItemPreview id={id} />}
      >
        <NavigationLink
          to={SIDEBAR_ONBOARDING_CHECKLIST_ROUTES[id]}
          data-testid={`sidebar-onboarding-checklist-item-${id}`}
          className={cn(
            "flex min-w-0 w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm",
            "transition-colors hover:bg-[var(--oh-surface)]",
            isComplete ? "text-muted" : "text-content",
          )}
        >
          <ChecklistStatusIcon isComplete={isComplete} />
          <span
            className={cn(
              "min-w-0 flex-1 truncate",
              isComplete && "line-through",
            )}
          >
            {t(labelKey)}
          </span>
        </NavigationLink>
      </Tooltip>
    </li>
  );
}

export function SidebarOnboardingChecklist({
  collapsed,
}: SidebarOnboardingChecklistProps) {
  const { t } = useTranslation("openhands");
  const { items, completedCount, isVisible, isMinimized, toggleMinimized } =
    useSidebarOnboardingChecklist();
  const { agentNotifications, hasAgentNotifications, createAll, isCreating } =
    useSidebarOnboardingAgentNotifications();
  const [isAgentNotificationsModalOpen, setIsAgentNotificationsModalOpen] =
    useState(false);

  if (collapsed || !isVisible) {
    return null;
  }

  return (
    <>
      <div
        data-testid="sidebar-onboarding-checklist"
        data-minimized={isMinimized ? "true" : "false"}
        className={cn(
          "w-full shrink-0 overflow-hidden rounded-xl border border-[var(--oh-border)]",
          "bg-[var(--oh-surface-raised)] shadow-sm",
        )}
      >
        <div
          className={cn(
            "flex w-full items-start gap-0.5 px-2.5",
            isMinimized ? "items-center py-2" : "pt-3 pb-2",
          )}
        >
          <button
            type="button"
            data-testid="sidebar-onboarding-checklist-toggle"
            aria-expanded={!isMinimized}
            aria-label={
              isMinimized
                ? t(I18nKey.SIDEBAR$ONBOARDING_CHECKLIST_EXPAND)
                : t(I18nKey.SIDEBAR$ONBOARDING_CHECKLIST_COLLAPSE)
            }
            onClick={toggleMinimized}
            className={cn(
              "flex min-w-0 flex-1 gap-1 text-left",
              "transition-colors hover:bg-[var(--oh-surface)] rounded-md",
              isMinimized ? "items-center py-0" : "items-start",
            )}
          >
            <div className="min-w-0 flex-1 px-0.5">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold text-content">
                  {t(I18nKey.SIDEBAR$ONBOARDING_CHECKLIST_TITLE)}
                </span>
                <span className="text-xs text-muted">
                  {t(I18nKey.SIDEBAR$ONBOARDING_CHECKLIST_PROGRESS, {
                    completed: completedCount,
                  })}
                </span>
              </div>
            </div>
          </button>

          {hasAgentNotifications ? (
            <button
              type="button"
              data-testid="sidebar-onboarding-agent-notifications-open"
              aria-label={t(
                I18nKey.SIDEBAR$ONBOARDING_AGENT_NOTIFICATIONS_OPEN,
              )}
              onClick={() => setIsAgentNotificationsModalOpen(true)}
              className={cn(
                "inline-flex size-7 shrink-0 items-center justify-center rounded-md",
                "text-[var(--oh-muted)] transition-colors",
                "hover:bg-[var(--oh-surface)] hover:text-content",
              )}
            >
              <Lightbulb className="size-4" aria-hidden />
            </button>
          ) : null}

          <button
            type="button"
            data-testid="sidebar-onboarding-checklist-chevron"
            aria-hidden
            tabIndex={-1}
            onClick={toggleMinimized}
            className={cn(
              "inline-flex size-7 shrink-0 items-center justify-center rounded-md",
              "text-[var(--oh-muted)] transition-colors",
              "hover:bg-[var(--oh-surface)]",
            )}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform motion-reduce:transition-none",
                isMinimized && "-rotate-90",
              )}
            />
          </button>
        </div>

        {!isMinimized ? (
          <ul className="flex flex-col gap-0.5 px-2.5 pb-2">
            {items.map((item) => (
              <ChecklistItem
                key={item.id}
                id={item.id}
                isComplete={item.isComplete}
              />
            ))}
          </ul>
        ) : null}
      </div>

      <SidebarOnboardingAgentNotificationsModal
        agentNotifications={agentNotifications}
        isOpen={isAgentNotificationsModalOpen}
        isCreating={isCreating}
        onClose={() => setIsAgentNotificationsModalOpen(false)}
        onCreateAll={createAll}
      />
    </>
  );
}
