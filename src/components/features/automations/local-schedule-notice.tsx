import { useState } from "react";
import { useTranslation } from "react-i18next";
import InfoCircleIcon from "#/icons/info-circle.svg?react";
import XMarkIcon from "#/icons/x-mark.svg?react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  readLocalScheduleNoticeDismissed,
  writeLocalScheduleNoticeDismissed,
} from "./local-schedule-notice-storage";

const DISMISS_BUTTON_CLASSNAME = cn(
  "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm",
  "text-muted transition-colors hover:bg-white/10 hover:text-white",
);

export function LocalScheduleNotice() {
  const { t } = useTranslation("openhands");
  const [isDismissed, setIsDismissed] = useState(
    readLocalScheduleNoticeDismissed,
  );

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    writeLocalScheduleNoticeDismissed(true);
    setIsDismissed(true);
  };

  return (
    <div
      role="status"
      data-testid="automations-local-schedule-notice"
      className="flex items-start gap-3 rounded-lg border border-[var(--oh-border)] bg-base-secondary px-4 py-3"
    >
      <InfoCircleIcon
        className="mt-0.5 size-4 shrink-0 text-muted"
        aria-hidden
      />
      <p className="min-w-0 flex-1 text-sm text-tertiary-light">
        {t(I18nKey.AUTOMATIONS$LOCAL_AWAKE_NOTICE)}
      </p>
      <button
        type="button"
        data-testid="automations-local-schedule-notice-dismiss"
        aria-label={t(I18nKey.BUTTON$CLOSE)}
        onClick={handleDismiss}
        className={DISMISS_BUTTON_CLASSNAME}
      >
        <XMarkIcon className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
