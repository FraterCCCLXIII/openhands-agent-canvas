import { useTranslation } from "react-i18next";
import { useCreateAutomationInChat } from "#/hooks/use-create-automation-in-chat";
import { cn } from "#/utils/utils";
import {
  formControlBorderClassName,
  formControlRadiusClassName,
  formControlTransitionClassName,
} from "#/utils/form-control-classes";
import { CREATE_AUTOMATION_STARTER_TEMPLATES } from "./create-automation-starter-templates.constants";

const STARTER_TEMPLATE_BUTTON_CLASSNAME = cn(
  formControlRadiusClassName,
  formControlBorderClassName,
  formControlTransitionClassName,
  "inline-flex min-w-0 cursor-pointer items-center gap-2 bg-base-secondary px-3 py-2",
  "text-sm font-normal text-white hover:bg-surface-raised",
);

interface CreateAutomationStarterTemplatesProps {
  onLaunch?: () => void;
}

export function CreateAutomationStarterTemplates({
  onLaunch,
}: CreateAutomationStarterTemplatesProps) {
  const { t } = useTranslation("openhands");
  const launchInChat = useCreateAutomationInChat();

  return (
    <div
      data-testid="automations-starter-templates"
      className="flex w-full flex-wrap items-center justify-center gap-2"
    >
      {CREATE_AUTOMATION_STARTER_TEMPLATES.map(
        ({ id, labelKey, promptKey, icon: Icon }) => (
          <button
            key={id}
            type="button"
            data-testid={`automations-starter-${id}`}
            className={STARTER_TEMPLATE_BUTTON_CLASSNAME}
            onClick={() => launchInChat(t(promptKey), onLaunch)}
          >
            <Icon className="size-4 shrink-0 text-muted" aria-hidden />
            <span className="truncate">{t(labelKey)}</span>
          </button>
        ),
      )}
    </div>
  );
}
