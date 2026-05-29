import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

interface DiffStatProps {
  additions: number;
  deletions: number;
  className?: string;
}

/** Compact "+N −M" git line-change badge. Renders nothing when there are no changes. */
export function DiffStat({ additions, deletions, className }: DiffStatProps) {
  const { t } = useTranslation("openhands");

  if (additions === 0 && deletions === 0) return null;

  return (
    <span
      data-testid="workbench-diff-stat"
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 tabular-nums",
        className,
      )}
      aria-label={t(I18nKey.WORKBENCH$DIFF_STAT_LABEL, {
        additions,
        deletions,
      })}
    >
      <span className="text-success">+{additions}</span>
      <span className="text-danger">−{deletions}</span>
    </span>
  );
}
