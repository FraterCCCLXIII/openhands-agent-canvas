import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { ModalCloseButton } from "#/components/shared/modals/modal-close-button";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { BrandButton } from "#/components/features/settings/brand-button";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { modalTitleLgClassName } from "#/utils/modal-classes";

export interface RepositoryTarget {
  id: string;
  repository: string;
  branch: string;
}

interface AddRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (target: RepositoryTarget) => void;
}

export function AddRepositoryModal({
  isOpen,
  onClose,
  onAdd,
}: AddRepositoryModalProps) {
  const { t } = useTranslation("openhands");
  const [repository, setRepository] = useState("");
  const [branch, setBranch] = useState("main");

  useEffect(() => {
    if (isOpen) {
      setRepository("");
      setBranch("main");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmedRepository = repository.trim();
  const canAdd = trimmedRepository.length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    onAdd({
      id: `${trimmedRepository}:${branch.trim() || "main"}`,
      repository: trimmedRepository,
      branch: branch.trim() || "main",
    });
    onClose();
  };

  return (
    <ModalBackdrop
      onClose={onClose}
      aria-label={t(I18nKey.AUTOMATIONS$CREATE_ADD_REPOSITORY_TITLE)}
    >
      <div
        data-testid="add-repository-modal"
        className="relative flex w-full max-w-md flex-col rounded-xl border border-[var(--oh-border)] bg-base-secondary"
      >
        <ModalCloseButton
          onClose={onClose}
          testId="add-repository-modal-close"
        />
        <header className="flex-shrink-0 px-6 pb-4 pt-6">
          <h2 className={cn("pr-6", modalTitleLgClassName)}>
            {t(I18nKey.AUTOMATIONS$CREATE_ADD_REPOSITORY_TITLE)}
          </h2>
        </header>
        <div className="flex flex-col gap-4 px-6 pb-6">
          <SettingsInput
            testId="add-repository-input"
            name="repository"
            type="text"
            label={t(I18nKey.AUTOMATIONS$DETAIL$REPOSITORIES)}
            value={repository}
            placeholder={t(I18nKey.AUTOMATIONS$CREATE_REPOSITORY_PLACEHOLDER)}
            onChange={setRepository}
            showRequiredTag
          />
          <SettingsInput
            testId="add-repository-branch"
            name="branch"
            type="text"
            label={t(I18nKey.AUTOMATIONS$CREATE_BRANCH_LABEL)}
            value={branch}
            placeholder={t(I18nKey.AUTOMATIONS$CREATE_BRANCH_PLACEHOLDER)}
            onChange={setBranch}
          />
          <div className="flex justify-end gap-3">
            <BrandButton
              type="button"
              variant="secondary"
              testId="add-repository-cancel"
              onClick={onClose}
            >
              {t(I18nKey.AUTOMATIONS$CANCEL)}
            </BrandButton>
            <BrandButton
              type="button"
              variant="primary"
              testId="add-repository-confirm"
              isDisabled={!canAdd}
              onClick={handleAdd}
            >
              {t(I18nKey.AUTOMATIONS$CREATE_REPOSITORY_ADD)}
            </BrandButton>
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}
