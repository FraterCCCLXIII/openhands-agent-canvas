import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { ModalBody } from "#/components/shared/modals/modal-body";
import { ModalCloseButton } from "#/components/shared/modals/modal-close-button";
import { BaseModalTitle } from "#/components/shared/modals/confirmation-modals/base-modal";
import { I18nKey } from "#/i18n/declaration";
import { Branch, GitRepository } from "#/types/git";
import { Provider } from "#/types/settings";
import { useUserProviders } from "#/hooks/use-user-providers";
import { useHomeStore } from "#/stores/home-store";
import { BrandButton } from "../settings/brand-button";
import { RepositorySelectionForm } from "./repo-selection-form";

interface RepositorySelection {
  repository: GitRepository;
  branch: Branch;
  provider: Provider | null;
}

interface OpenRepositoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selection: RepositorySelection) => void;
  automationLaunchFlow?: boolean;
  onStartWithoutSource?: () => void;
}

export function OpenRepositoryDialog({
  isOpen,
  onClose,
  onConfirm,
  automationLaunchFlow = false,
  onStartWithoutSource,
}: OpenRepositoryDialogProps) {
  const { t } = useTranslation("openhands");
  const { isLoadingSettings } = useUserProviders();
  const { addRecentRepository } = useHomeStore();
  const [selectedRepository, setSelectedRepository] =
    useState<RepositorySelection | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedRepository(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartConversation = () => {
    if (selectedRepository) {
      addRecentRepository(selectedRepository.repository);
      onConfirm(selectedRepository);
      return;
    }
    onStartWithoutSource?.();
  };

  return (
    <ModalBackdrop onClose={onClose}>
      <ModalBody
        width="sm"
        className="relative items-start border border-[var(--oh-border)] !gap-4"
      >
        <ModalCloseButton
          onClose={onClose}
          testId="close-open-repository-dialog"
        />
        <div className="w-full pr-6">
          <BaseModalTitle
            title={
              automationLaunchFlow
                ? t(I18nKey.RECOMMENDED_AUTOMATIONS$BEFORE_STARTING_TITLE)
                : t(I18nKey.COMMON$OPEN_REPOSITORY)
            }
          />
          {automationLaunchFlow ? (
            <p className="mt-2 text-sm font-normal leading-[22px] text-tertiary-alt">
              {t(
                I18nKey.RECOMMENDED_AUTOMATIONS$SELECT_REPOSITORY_BEFORE_START,
              )}
            </p>
          ) : null}
        </div>

        <div className="w-full" data-testid="open-repository-dialog-body">
          <RepositorySelectionForm
            isLoadingSettings={isLoadingSettings}
            hideLaunchButton={automationLaunchFlow}
            onSelectionChange={setSelectedRepository}
            onConfirm={
              automationLaunchFlow
                ? undefined
                : (selection) => {
                    onConfirm(selection);
                    onClose();
                  }
            }
          />
          {automationLaunchFlow ? (
            <BrandButton
              testId="open-repository-dialog-start-conversation"
              variant="primary"
              type="button"
              isDisabled={isLoadingSettings}
              onClick={handleStartConversation}
              className="mt-4 w-full"
            >
              {t(I18nKey.COMMON$START_CONVERSATION)}
            </BrandButton>
          ) : null}
        </div>
      </ModalBody>
    </ModalBackdrop>
  );
}
