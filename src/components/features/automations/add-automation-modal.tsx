import { useTranslation } from "react-i18next";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { ModalCloseButton } from "#/components/shared/modals/modal-close-button";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { modalTitleLgClassName } from "#/utils/modal-classes";
import { CreateAutomationForm } from "./create-automation-form";

interface AddAutomationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAutomationModal({
  isOpen,
  onClose,
}: AddAutomationModalProps) {
  const { t } = useTranslation("openhands");

  if (!isOpen) return null;

  return (
    <ModalBackdrop
      onClose={onClose}
      aria-label={t(I18nKey.AUTOMATIONS$CREATE_TITLE)}
    >
      <div
        data-testid="add-automation-modal"
        className={cn(
          "relative flex max-h-[85vh] w-[560px] max-w-[90vw] flex-col",
          "rounded-xl border border-[var(--oh-border)] bg-base-secondary",
        )}
      >
        <ModalCloseButton
          onClose={onClose}
          testId="add-automation-modal-close"
        />
        <header className="flex-shrink-0 px-6 pb-4 pt-6">
          <h2
            id="add-automation-modal-title"
            className={cn("pr-6", modalTitleLgClassName)}
          >
            {t(I18nKey.AUTOMATIONS$CREATE_TITLE)}
          </h2>
        </header>
        <CreateAutomationForm onCancel={onClose} onCreate={onClose} />
      </div>
    </ModalBackdrop>
  );
}
