import { useTranslation } from "react-i18next";
import { cn } from "#/utils/utils";
import { WIZARD_STEP_BAR_ACTIVE_CLASS } from "./create-automation-wizard-styles";
import {
  CREATE_AUTOMATION_WIZARD_STEPS,
  WIZARD_STEP_LABEL_KEYS,
} from "./create-automation-wizard.constants";
import type { CreateAutomationWizardStep } from "./create-automation-wizard.types";

interface CreateAutomationWizardStepperProps {
  currentStep: CreateAutomationWizardStep;
}

export function CreateAutomationWizardStepper({
  currentStep,
}: CreateAutomationWizardStepperProps) {
  const { t } = useTranslation("openhands");
  const currentIndex = CREATE_AUTOMATION_WIZARD_STEPS.indexOf(currentStep);

  return (
    <ol
      data-testid="create-automation-wizard-stepper"
      className="flex w-full items-start gap-3"
    >
      {CREATE_AUTOMATION_WIZARD_STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li
            key={step}
            data-testid={`create-automation-wizard-step-${step}`}
            data-state={
              isCompleted ? "completed" : isCurrent ? "current" : "upcoming"
            }
            className="flex min-w-0 flex-1 flex-col gap-2"
          >
            <span
              className={cn(
                "truncate text-sm",
                isCurrent
                  ? "font-medium text-white"
                  : isCompleted
                    ? "text-content"
                    : "text-muted",
              )}
            >
              {t(WIZARD_STEP_LABEL_KEYS[step])}
            </span>
            <span
              aria-hidden
              className={cn(
                "h-1 w-full rounded-full transition-colors duration-200",
                isCompleted || isCurrent
                  ? WIZARD_STEP_BAR_ACTIVE_CLASS
                  : "bg-[var(--oh-border)]",
              )}
            />
          </li>
        );
      })}
    </ol>
  );
}

export function getWizardNextStep(
  currentStep: CreateAutomationWizardStep,
): CreateAutomationWizardStep | null {
  const currentIndex = CREATE_AUTOMATION_WIZARD_STEPS.indexOf(currentStep);
  if (
    currentIndex < 0 ||
    currentIndex >= CREATE_AUTOMATION_WIZARD_STEPS.length - 1
  ) {
    return null;
  }
  return CREATE_AUTOMATION_WIZARD_STEPS[currentIndex + 1] ?? null;
}

export function getWizardPreviousStep(
  currentStep: CreateAutomationWizardStep,
): CreateAutomationWizardStep | null {
  const currentIndex = CREATE_AUTOMATION_WIZARD_STEPS.indexOf(currentStep);
  if (currentIndex <= 0) {
    return null;
  }
  return CREATE_AUTOMATION_WIZARD_STEPS[currentIndex - 1] ?? null;
}
