import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import type { Automation } from "#/types/automation";
import { KebabMenu } from "./kebab-menu";
import { useHasPermission } from "#/hooks/use-has-permission";
import { useNavigation } from "#/context/navigation-context";
import PlayIcon from "#/icons/play.svg?react";
import { SkillCardPillRow } from "#/components/features/skills/skill-card-pill-row";
import { cn } from "#/utils/utils";
import { buildAutomationMetadataPills } from "./build-automation-pills";
import { buildAutomationMenuItems } from "./build-automation-menu-items";
import { automationListRowClassName } from "./automation-view-mode";

interface AutomationListRowProps {
  automation: Automation;
  onToggle: (id: string, enabled: boolean) => void;
  onRunNow: (id: string) => void;
  isRunPending?: boolean;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
}

const listRunNowButtonClassName =
  "flex h-6 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[var(--oh-muted)] transition-colors hover:bg-[var(--oh-interactive-hover)] hover:text-[var(--oh-foreground)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--oh-muted)]";

export function AutomationListRow({
  automation,
  onToggle,
  onRunNow,
  isRunPending = false,
  onDelete,
  onEdit,
}: AutomationListRowProps) {
  const { navigate } = useNavigation();
  const { t } = useTranslation("openhands");
  const canManage = useHasPermission("manage_automations");

  const scheduleLabel =
    automation.trigger.schedule_human || automation.trigger.type;
  const pills = useMemo(
    () => buildAutomationMetadataPills(automation, scheduleLabel),
    [automation, scheduleLabel],
  );

  const handleView = () => {
    navigate?.(`/automations/${automation.id}`);
  };

  const menuItems = buildAutomationMenuItems({
    automation,
    t,
    canManage,
    onRunNow,
    isRunPending,
    onView: handleView,
    onEdit,
    onToggle,
    onDelete,
  });

  const handleRowClick = () => {
    handleView();
  };

  return (
    <div
      role="link"
      tabIndex={0}
      data-testid={`automation-list-row-${automation.id}`}
      onClick={handleRowClick}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          handleRowClick();
        }
      }}
      className={cn(automationListRowClassName, "cursor-pointer")}
    >
      <span
        className="min-w-0 max-w-[40%] shrink-0 truncate text-sm font-medium text-white"
        title={automation.name}
      >
        {automation.name}
      </span>

      {pills.length > 0 ? (
        <div className="min-w-0 flex-1">
          <SkillCardPillRow
            pills={pills}
            testId={`automation-pills-${automation.id}`}
          />
        </div>
      ) : (
        <div className="min-w-0 flex-1" />
      )}

      <div className="flex shrink-0 items-center gap-0.5">
        {canManage ? (
          <button
            type="button"
            data-testid={`automation-run-now-${automation.id}`}
            aria-label={t(I18nKey.AUTOMATIONS$RUN_NOW)}
            aria-busy={isRunPending}
            disabled={isRunPending}
            onClick={(event) => {
              event.stopPropagation();
              onRunNow(automation.id);
            }}
            className={listRunNowButtonClassName}
          >
            <PlayIcon className="size-3.5 shrink-0" aria-hidden />
          </button>
        ) : null}
        <KebabMenu items={menuItems} />
      </div>
    </div>
  );
}
