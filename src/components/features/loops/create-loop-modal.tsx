import { useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { LOOP_TEMPLATES, getLoopTemplateById } from "#/data/loop-templates";
import { LoopTemplateCard } from "#/components/features/loops/loop-template-card";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { BrandButton } from "#/components/features/settings/brand-button";
import { SettingsInput } from "#/components/features/settings/settings-input";
import {
  extensionModuleCardGridClassName,
  extensionModuleCardGridContainerClassName,
} from "#/utils/extension-module-card-classes";
import { cn } from "#/utils/utils";

interface CreateLoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (templateId: string, name: string) => void;
  isPending?: boolean;
}

export function CreateLoopModal({
  isOpen,
  onClose,
  onCreate,
  isPending = false,
}: CreateLoopModalProps) {
  const { t } = useTranslation("openhands");
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    LOOP_TEMPLATES[0]?.id ?? "",
  );
  const [name, setName] = useState(LOOP_TEMPLATES[0]?.defaultName ?? "");

  if (!isOpen) return null;

  const template = getLoopTemplateById(selectedTemplateId);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const next = getLoopTemplateById(templateId);
    if (next) setName(next.defaultName);
  };

  const handleSubmit = () => {
    if (!selectedTemplateId || !name.trim()) return;
    onCreate(selectedTemplateId, name.trim());
  };

  return (
    <ModalBackdrop
      onClose={onClose}
      aria-label={t(I18nKey.LOOPS$CREATE_MODAL_TITLE)}
    >
      <div
        data-testid="create-loop-modal"
        className="mx-4 w-full max-w-2xl rounded-xl border border-[var(--oh-border)] bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground">
          {t(I18nKey.LOOPS$CREATE_MODAL_TITLE)}
        </h2>
        <p className="mt-1 text-sm text-tertiary-light">
          {t(I18nKey.LOOPS$CREATE_MODAL_DESCRIPTION)}
        </p>

        <div className={cn("mt-6", extensionModuleCardGridContainerClassName)}>
          <div className={extensionModuleCardGridClassName}>
            {LOOP_TEMPLATES.map((item) => (
              <LoopTemplateCard
                key={item.id}
                template={item}
                onSelect={handleSelectTemplate}
              />
            ))}
          </div>
        </div>

        <div className="mt-6">
          <SettingsInput
            label={t(I18nKey.LOOPS$CREATE_NAME_LABEL)}
            type="text"
            value={name}
            onChange={setName}
            placeholder={template?.defaultName ?? ""}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <BrandButton type="button" variant="secondary" onClick={onClose}>
            {t(I18nKey.BUTTON$CANCEL)}
          </BrandButton>
          <BrandButton
            type="button"
            variant="primary"
            isDisabled={isPending || !name.trim()}
            onClick={handleSubmit}
          >
            {isPending
              ? t(I18nKey.LOOPS$CREATING)
              : t(I18nKey.LOOPS$CREATE_SUBMIT)}
          </BrandButton>
        </div>
      </div>
    </ModalBackdrop>
  );
}
