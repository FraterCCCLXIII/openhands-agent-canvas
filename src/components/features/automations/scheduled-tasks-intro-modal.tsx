import { useState } from "react";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { ModalCloseButton } from "#/components/shared/modals/modal-close-button";
import { BrandButton } from "#/components/features/settings/brand-button";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { modalTitleLgClassName } from "#/utils/modal-classes";
import {
  SCHEDULED_TASKS_INTRO_DOCS_URL,
  SCHEDULED_TASKS_INTRO_VIDEO_EMBED_URL,
} from "./scheduled-tasks-intro.constants";
import {
  readScheduledTasksIntroDismissed,
  writeScheduledTasksIntroDismissed,
} from "./scheduled-tasks-intro-storage";

export function ScheduledTasksIntroModal() {
  const { t } = useTranslation("openhands");
  const [isOpen, setIsOpen] = useState(
    () => !readScheduledTasksIntroDismissed(),
  );
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (dontShowAgain) {
      writeScheduledTasksIntroDismissed(true);
    }
    setIsOpen(false);
  };

  return (
    <ModalBackdrop
      onClose={handleClose}
      aria-label={t(I18nKey.AUTOMATIONS$SCHEDULED_TASKS_INTRO_TITLE)}
    >
      <div
        data-testid="scheduled-tasks-intro-modal"
        className={cn(
          "relative flex w-[640px] max-w-[90vw] flex-col",
          "rounded-xl border border-[var(--oh-border)] bg-base-secondary",
        )}
      >
        <ModalCloseButton
          onClose={handleClose}
          testId="scheduled-tasks-intro-modal-close"
        />

        <div className="flex-shrink-0 px-6 pt-6">
          <div className="aspect-video overflow-hidden rounded-lg border border-[var(--oh-border)] bg-black">
            <iframe
              data-testid="scheduled-tasks-intro-video"
              src={SCHEDULED_TASKS_INTRO_VIDEO_EMBED_URL}
              title={t(I18nKey.AUTOMATIONS$SCHEDULED_TASKS_INTRO_VIDEO_TITLE)}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        <header className="flex-shrink-0 px-6 pb-4 pt-5">
          <h2
            id="scheduled-tasks-intro-modal-title"
            className={cn("pr-6", modalTitleLgClassName)}
          >
            {t(I18nKey.AUTOMATIONS$SCHEDULED_TASKS_INTRO_TITLE)}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {t(I18nKey.AUTOMATIONS$SCHEDULED_TASKS_INTRO_DESCRIPTION)}
          </p>
          <a
            href={SCHEDULED_TASKS_INTRO_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="scheduled-tasks-intro-docs-link"
            className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--oh-muted)] transition-colors hover:text-white hover:underline"
          >
            <BookOpen className="size-4 shrink-0" aria-hidden />
            {t(I18nKey.AUTOMATIONS$SCHEDULED_TASKS_INTRO_DOCS_LINK)}
          </a>
        </header>

        <footer className="flex flex-shrink-0 items-center justify-between gap-4 border-t border-[var(--oh-border-subtle)] px-6 py-4">
          <label
            htmlFor="scheduled-tasks-intro-dont-show"
            className="flex min-w-0 items-center gap-2.5 text-sm text-muted"
          >
            <input
              id="scheduled-tasks-intro-dont-show"
              data-testid="scheduled-tasks-intro-dont-show"
              type="checkbox"
              checked={dontShowAgain}
              onChange={(event) => setDontShowAgain(event.target.checked)}
              className="size-4 shrink-0"
            />
            {t(I18nKey.AUTOMATIONS$SCHEDULED_TASKS_INTRO_DONT_SHOW)}
          </label>

          <BrandButton
            type="button"
            variant="primary"
            onClick={handleClose}
            testId="scheduled-tasks-intro-got-it"
            className="shrink-0"
          >
            {t(I18nKey.AUTOMATIONS$SCHEDULED_TASKS_INTRO_GOT_IT)}
          </BrandButton>
        </footer>
      </div>
    </ModalBackdrop>
  );
}
