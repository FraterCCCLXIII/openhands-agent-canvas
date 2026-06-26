import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

interface LoopMovesChecklistProps {
  moves: {
    discovery: boolean;
    handoff: boolean;
    verification: boolean;
    persistence: boolean;
    scheduling: boolean;
  };
  compact?: boolean;
}

const MOVE_KEYS: {
  key: keyof LoopMovesChecklistProps["moves"];
  labelKey: I18nKey;
}[] = [
  { key: "discovery", labelKey: I18nKey.LOOPS$MOVE_DISCOVERY },
  { key: "handoff", labelKey: I18nKey.LOOPS$MOVE_HANDOFF },
  { key: "verification", labelKey: I18nKey.LOOPS$MOVE_VERIFICATION },
  { key: "persistence", labelKey: I18nKey.LOOPS$MOVE_PERSISTENCE },
  { key: "scheduling", labelKey: I18nKey.LOOPS$MOVE_SCHEDULING },
];

export function LoopMovesChecklist({
  moves,
  compact = false,
}: LoopMovesChecklistProps) {
  const { t } = useTranslation("openhands");

  return (
    <ul
      data-testid="loop-moves-checklist"
      className={cn(
        "grid gap-2",
        compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1",
      )}
    >
      {MOVE_KEYS.map(({ key, labelKey }) => {
        const configured = moves[key];
        return (
          <li
            key={key}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
              configured
                ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                : "border-[var(--oh-border)] bg-surface-raised/40 text-tertiary-light",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                configured ? "bg-emerald-400" : "bg-neutral-500",
              )}
            />
            <span>{t(labelKey)}</span>
          </li>
        );
      })}
    </ul>
  );
}
