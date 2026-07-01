import { useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import ChevronDownIcon from "#/icons/chevron-down.svg?react";
import { cn } from "#/utils/utils";
import { CreateAutomationStarterTemplates } from "./create-automation-starter-templates";

interface CreateInstructionsProps {
  /** If true, the instructions are collapsible and start collapsed */
  collapsible?: boolean;
}

interface CreateInstructionsContentProps {
  onLaunch?: () => void;
}

function CreateInstructionsContent({
  onLaunch,
}: CreateInstructionsContentProps = {}) {
  const { t } = useTranslation("openhands");

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="w-full text-center text-sm text-tertiary-light">
        {t(I18nKey.AUTOMATIONS$EMPTY_STARTER_SUBLINE)}
      </p>
      <CreateAutomationStarterTemplates onLaunch={onLaunch} />
    </div>
  );
}

export function CreateInstructions({
  collapsible = false,
}: CreateInstructionsProps) {
  const { t } = useTranslation("openhands");
  const [isExpanded, setIsExpanded] = useState(!collapsible);

  const heading = (
    <h3 className="text-sm font-medium text-content">
      {t(I18nKey.AUTOMATIONS$EMPTY_HOW_TO_CREATE_TITLE)}
    </h3>
  );

  if (collapsible) {
    return (
      <div className="w-full rounded-lg border border-[var(--oh-border)] bg-[var(--oh-surface)]">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="flex w-full items-center justify-between rounded-lg p-4 text-left transition-colors hover:bg-surface-raised"
        >
          <span className="text-sm font-normal text-content">
            {t(I18nKey.AUTOMATIONS$EMPTY_HOW_TO_CREATE_TITLE)}
          </span>
          <ChevronDownIcon
            className={cn(
              "size-5 shrink-0 text-muted transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </button>
        {isExpanded ? (
          <div className="border-t border-[var(--oh-border)] px-4 pb-4 pt-3">
            <CreateInstructionsContent />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-1.5 text-center">
      {heading}
      <CreateInstructionsContent />
    </div>
  );
}
