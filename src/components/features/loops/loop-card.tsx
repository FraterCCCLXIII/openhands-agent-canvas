import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import type { LoopDefinition } from "#/types/loop";
import { LoopStatusBadge } from "#/components/features/loops/loop-status-badge";
import { LoopMovesChecklist } from "#/components/features/loops/loop-moves-checklist";
import { useNavigation } from "#/context/navigation-context";
import ClockIcon from "#/icons/clock.svg?react";
import { cn } from "#/utils/utils";
import {
  extensionModuleCardInteractiveClassName,
  extensionModuleCardSurfaceClassName,
} from "#/utils/extension-module-card-classes";

interface LoopCardProps {
  loop: LoopDefinition;
  onRunNow?: (id: string) => void;
  isRunPending?: boolean;
}

export function LoopCard({
  loop,
  onRunNow,
  isRunPending = false,
}: LoopCardProps) {
  const { t } = useTranslation("openhands");
  const { navigate } = useNavigation();

  const scheduleLabel =
    loop.trigger.schedule_human ?? loop.trigger.schedule ?? loop.trigger.type;

  const handleOpen = () => {
    navigate?.(`/loops/${loop.id}`);
  };

  return (
    <div
      role="link"
      tabIndex={0}
      data-testid={`loop-card-${loop.id}`}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleOpen();
      }}
      className={cn(
        "flex min-w-0 flex-col gap-3 p-4 text-left",
        extensionModuleCardSurfaceClassName,
        extensionModuleCardInteractiveClassName,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-medium text-foreground">{loop.name}</h3>
          {loop.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-tertiary-light">
              {loop.description}
            </p>
          ) : null}
        </div>
        <LoopStatusBadge enabled={loop.enabled} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-tertiary-light">
        <span className="inline-flex items-center gap-1">
          <ClockIcon className="size-3.5 shrink-0" aria-hidden />
          {scheduleLabel}
        </span>
        {(loop.inbox_count ?? 0) > 0 ? (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-200">
            {t(I18nKey.LOOPS$INBOX_COUNT, { count: loop.inbox_count })}
          </span>
        ) : null}
      </div>

      <LoopMovesChecklist moves={loop.moves} compact />

      {onRunNow ? (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            className="rounded-md border border-[var(--oh-border)] px-3 py-1 text-xs font-medium text-content hover:bg-surface-raised disabled:opacity-50"
            disabled={!loop.enabled || isRunPending}
            onClick={(e) => {
              e.stopPropagation();
              onRunNow(loop.id);
            }}
          >
            {isRunPending
              ? t(I18nKey.LOOPS$RUNNING_TURN)
              : t(I18nKey.LOOPS$RUN_TURN_NOW)}
          </button>
        </div>
      ) : null}
    </div>
  );
}
