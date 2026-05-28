import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { ModalBody } from "#/components/shared/modals/modal-body";
import { ModalCloseButton } from "#/components/shared/modals/modal-close-button";
import { BaseModalTitle } from "#/components/shared/modals/confirmation-modals/base-modal";
import { I18nKey } from "#/i18n/declaration";
import { LocalWorkspace } from "#/types/workspace";
import { useUserProviders } from "#/hooks/use-user-providers";
import { BrandButton } from "../settings/brand-button";
import { WorkspaceSelectionForm } from "./workspace-selection-form";

interface OpenWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (workspace: LocalWorkspace) => void;
  automationLaunchFlow?: boolean;
  onStartWithoutSource?: () => void;
}

export function OpenWorkspaceDialog({
  isOpen,
  onClose,
  onConfirm,
  automationLaunchFlow = false,
  onStartWithoutSource,
}: OpenWorkspaceDialogProps) {
  const { t } = useTranslation("openhands");
  const { isLoadingSettings } = useUserProviders();
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<LocalWorkspace | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedWorkspace(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartConversation = () => {
    if (selectedWorkspace) {
      onConfirm(selectedWorkspace);
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
          testId="close-open-workspace-dialog"
        />
        <div className="w-full pr-6">
          <BaseModalTitle
            title={
              automationLaunchFlow
                ? t(I18nKey.RECOMMENDED_AUTOMATIONS$BEFORE_STARTING_TITLE)
                : t(I18nKey.HOME$OPEN_WORKSPACE)
            }
          />
          {automationLaunchFlow ? (
            <p className="mt-2 text-sm font-normal leading-[22px] text-tertiary-alt">
              {t(I18nKey.RECOMMENDED_AUTOMATIONS$SELECT_DIRECTORY_BEFORE_START)}
            </p>
          ) : null}
        </div>

        <div className="w-full" data-testid="open-workspace-dialog-body">
          <WorkspaceSelectionForm
            isLoadingSettings={isLoadingSettings}
            hideLaunchButton={automationLaunchFlow}
            onSelectionChange={setSelectedWorkspace}
            onConfirm={
              automationLaunchFlow
                ? undefined
                : (workspace) => {
                    onConfirm(workspace);
                    onClose();
                  }
            }
          />
          {automationLaunchFlow ? (
            <BrandButton
              testId="open-workspace-dialog-start-conversation"
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
