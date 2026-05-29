import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { ModalCloseButton } from "#/components/shared/modals/modal-close-button";
import { BrandButton } from "#/components/features/settings/brand-button";
import {
  MODAL_MAX_WIDTH_VIEWPORT,
  modalWidthClassName,
} from "#/components/shared/modals/modal-body";
import {
  formControlFieldClassName,
  formControlMultilineFieldClassName,
} from "#/utils/form-control-classes";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { NO_REPOSITORY } from "./types";

export interface NewTaskPayload {
  prompt: string;
  repo: string;
}

interface NewTaskModalProps {
  repositories: string[];
  isSubmitting: boolean;
  onCreate: (payload: NewTaskPayload) => void;
  onClose: () => void;
}

const FIELD_LABEL_CLASSNAME = "text-xs font-medium text-tertiary-light";

export function NewTaskModal({
  repositories,
  isSubmitting,
  onCreate,
  onClose,
}: NewTaskModalProps) {
  const { t } = useTranslation("openhands");
  const [prompt, setPrompt] = useState("");
  const [repo, setRepo] = useState(repositories[0] ?? NO_REPOSITORY);

  const canCreate = prompt.trim().length > 0 && !isSubmitting;

  const handleCreate = () => {
    if (!canCreate) return;
    onCreate({ prompt: prompt.trim(), repo });
  };

  return (
    <ModalBackdrop
      onClose={onClose}
      aria-label={t(I18nKey.WORKBENCH$NEW_TASK_TITLE)}
    >
      <div
        data-testid="workbench-new-task-modal"
        className={cn(
          "relative rounded-xl border border-[var(--oh-border)] bg-base-secondary",
          modalWidthClassName("md"),
          MODAL_MAX_WIDTH_VIEWPORT,
        )}
      >
        <ModalCloseButton onClose={onClose} testId="workbench-new-task-close" />

        <header className="px-6 pb-2 pr-12 pt-6">
          <h2 className="text-lg font-medium text-white">
            {t(I18nKey.WORKBENCH$NEW_TASK_TITLE)}
          </h2>
        </header>

        <div className="flex flex-col gap-4 px-6 pb-6 pt-2">
          <label className="flex flex-col gap-1.5">
            <span className={FIELD_LABEL_CLASSNAME}>
              {t(I18nKey.WORKBENCH$NEW_TASK_PROMPT_LABEL)}
            </span>
            <textarea
              data-testid="workbench-new-task-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
              placeholder={t(I18nKey.WORKBENCH$NEW_TASK_PROMPT_PLACEHOLDER)}
              className={cn(formControlMultilineFieldClassName, "resize-none")}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={FIELD_LABEL_CLASSNAME}>
              {t(I18nKey.WORKBENCH$NEW_TASK_REPO_LABEL)}
            </span>
            <select
              data-testid="workbench-new-task-repo"
              value={repo}
              onChange={(event) => setRepo(event.target.value)}
              className={formControlFieldClassName}
            >
              {repositories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-[var(--oh-border)] px-6 py-3">
          <BrandButton
            type="button"
            variant="secondary"
            testId="workbench-new-task-cancel"
            onClick={onClose}
          >
            {t(I18nKey.WORKBENCH$NEW_TASK_CANCEL)}
          </BrandButton>
          <BrandButton
            type="button"
            variant="primary"
            testId="workbench-new-task-create"
            isDisabled={!canCreate}
            aria-busy={isSubmitting}
            onClick={handleCreate}
          >
            {t(I18nKey.WORKBENCH$NEW_TASK_CREATE)}
          </BrandButton>
        </footer>
      </div>
    </ModalBackdrop>
  );
}
