import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

interface LoopStatusBadgeProps {
  enabled: boolean;
}

export function LoopStatusBadge({ enabled }: LoopStatusBadgeProps) {
  const { t } = useTranslation("openhands");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        enabled
          ? "bg-emerald-500/15 text-emerald-300"
          : "bg-neutral-500/15 text-neutral-400",
      )}
    >
      {enabled
        ? t(I18nKey.LOOPS$STATUS_ACTIVE)
        : t(I18nKey.LOOPS$STATUS_PAUSED)}
    </span>
  );
}
