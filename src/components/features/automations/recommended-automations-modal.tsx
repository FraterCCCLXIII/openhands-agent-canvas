import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { RecommendedAutomation } from "@openhands/extensions/automations";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { ModalBody } from "#/components/shared/modals/modal-body";
import { ModalCloseButton } from "#/components/shared/modals/modal-close-button";
import { BaseModalTitle } from "#/components/shared/modals/confirmation-modals/base-modal";
import { SearchInput } from "#/components/features/automations/search-input";
import { I18nKey } from "#/i18n/declaration";
import type { MCPServerConfig } from "#/types/mcp-server";
import { RecommendedAutomationsSection } from "./recommended-automations-section";

interface RecommendedAutomationsModalProps {
  backendKind: "local" | "cloud";
  installedServers: MCPServerConfig[];
  onClose: () => void;
  onSelect: (automation: RecommendedAutomation) => void;
}

export function RecommendedAutomationsModal({
  backendKind,
  installedServers,
  onClose,
  onSelect,
}: RecommendedAutomationsModalProps) {
  const { t } = useTranslation("openhands");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <ModalBackdrop
      onClose={onClose}
      aria-label={t(I18nKey.RECOMMENDED_AUTOMATIONS$MODAL_CLOSE_ARIA)}
    >
      <ModalBody
        width="xl"
        testID="recommended-automations-modal"
        className="relative max-h-[85vh] flex-col items-start gap-4 border border-[var(--oh-border)] !p-6"
      >
        <ModalCloseButton
          onClose={onClose}
          testId="recommended-automations-modal-close"
        />

        <div className="w-full pr-8">
          <BaseModalTitle
            title={t(I18nKey.RECOMMENDED_AUTOMATIONS$SECTION_TITLE)}
          />
          <p className="mt-1 text-sm text-muted">
            {t(I18nKey.RECOMMENDED_AUTOMATIONS$SECTION_DESCRIPTION)}
          </p>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full flex-none"
        />

        <div className="custom-scrollbar-always w-full max-h-[60vh] overflow-y-auto">
          <RecommendedAutomationsSection
            backendKind={backendKind}
            installedServers={installedServers}
            query={searchQuery}
            onSelect={onSelect}
            variant="home"
          />
        </div>
      </ModalBody>
    </ModalBackdrop>
  );
}
