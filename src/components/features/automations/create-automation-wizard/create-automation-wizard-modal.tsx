import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ModalBackdrop } from "#/components/shared/modals/modal-backdrop";
import { ModalCloseButton } from "#/components/shared/modals/modal-close-button";
import { BrandButton } from "#/components/features/settings/brand-button";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { modalTitleLgClassName } from "#/utils/modal-classes";
import { DEFAULT_CREATE_AUTOMATION_WIZARD_STATE } from "./create-automation-wizard.constants";
import { WIZARD_PRIMARY_BUTTON_CLASS } from "./create-automation-wizard-styles";
import {
  CreateAutomationWizardStepper,
  getWizardNextStep,
  getWizardPreviousStep,
} from "./create-automation-wizard-stepper";
import { CreateAutomationWizardTriggerSummary } from "./create-automation-wizard-trigger-summary";
import { CreateAutomationWizardActionSummary } from "./create-automation-wizard-action-summary";
import type {
  CreateAutomationWizardState,
  CreateAutomationWizardStep,
} from "./create-automation-wizard.types";
import { WizardActionPlanStep } from "./wizard-action-plan-step";
import { WizardBasicsStep } from "./wizard-basics-step";
import { WizardReviewStep } from "./wizard-review-step";
import { WizardTriggerStep } from "./wizard-trigger-step";

interface CreateAutomationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAutomationWizardModal({
  isOpen,
  onClose,
}: CreateAutomationWizardModalProps) {
  const { t } = useTranslation("openhands");
  const [currentStep, setCurrentStep] =
    useState<CreateAutomationWizardStep>("basics");
  const [state, setState] = useState<CreateAutomationWizardState>(
    DEFAULT_CREATE_AUTOMATION_WIZARD_STATE,
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isContentScrolled, setIsContentScrolled] = useState(false);

  const nextStep = getWizardNextStep(currentStep);
  const previousStep = getWizardPreviousStep(currentStep);
  const canAdvanceFromBasics = state.name.trim().length > 0;
  const canAdvanceFromActionPlan =
    state.actionType === "run-script"
      ? state.selectedScript.trim().length > 0
      : state.prompt.trim().length > 0;
  const canAdvance =
    currentStep === "basics"
      ? canAdvanceFromBasics
      : currentStep === "action-plan"
        ? canAdvanceFromActionPlan
        : currentStep !== "review";

  const handleClose = () => {
    setCurrentStep("basics");
    setState(DEFAULT_CREATE_AUTOMATION_WIZARD_STATE);
    setIsContentScrolled(false);
    onClose();
  };

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0 });
    setIsContentScrolled(false);
  }, [currentStep]);

  const handleContentScroll = (event: React.UIEvent<HTMLDivElement>) => {
    setIsContentScrolled(event.currentTarget.scrollTop > 0);
  };

  const handlePatch = (patch: Partial<CreateAutomationWizardState>) => {
    setState((previous) => ({ ...previous, ...patch }));
  };

  const handlePrimaryAction = () => {
    if (currentStep === "review") {
      handleClose();
      return;
    }
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  };

  const stepContent = useMemo(() => {
    switch (currentStep) {
      case "basics":
        return <WizardBasicsStep state={state} onChange={handlePatch} />;
      case "trigger":
        return <WizardTriggerStep state={state} onChange={handlePatch} />;
      case "action-plan":
        return <WizardActionPlanStep state={state} onChange={handlePatch} />;
      case "review":
        return <WizardReviewStep state={state} />;
      default:
        return null;
    }
  }, [currentStep, state]);

  if (!isOpen) return null;

  return (
    <ModalBackdrop
      onClose={handleClose}
      aria-label={t(I18nKey.AUTOMATIONS$CREATE_TITLE)}
    >
      <div
        data-testid="create-automation-wizard-modal"
        className={cn(
          "relative flex max-h-[90vh] w-[760px] max-w-[95vw] flex-col",
          "rounded-xl border border-[var(--oh-border)] bg-base-secondary",
        )}
      >
        <ModalCloseButton
          onClose={handleClose}
          testId="create-automation-wizard-modal-close"
        />
        <header
          className={cn(
            "flex-shrink-0 border-b px-6 pb-4 pt-6 transition-[border-color] duration-150 motion-reduce:transition-none",
            isContentScrolled
              ? "border-[var(--oh-border)]"
              : "border-transparent",
          )}
        >
          <div className="min-w-0 pr-6">
            <h2 className={modalTitleLgClassName}>
              {t(I18nKey.AUTOMATIONS$CREATE_TITLE)}
            </h2>
          </div>
          <div className="mt-5">
            <CreateAutomationWizardStepper currentStep={currentStep} />
          </div>
        </header>

        <div
          ref={scrollContainerRef}
          onScroll={handleContentScroll}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5 custom-scrollbar"
        >
          {stepContent}
          {currentStep === "trigger" ? (
            <CreateAutomationWizardTriggerSummary state={state} />
          ) : null}
          {currentStep === "action-plan" ? (
            <CreateAutomationWizardActionSummary state={state} />
          ) : null}
        </div>

        <footer className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-[var(--oh-border)] px-6 py-4">
          {previousStep ? (
            <BrandButton
              type="button"
              variant="tertiary"
              testId="create-automation-wizard-back"
              onClick={() => setCurrentStep(previousStep)}
            >
              {t(I18nKey.AUTOMATIONS$WIZARD_BACK)}
            </BrandButton>
          ) : (
            <BrandButton type="button" variant="tertiary" onClick={handleClose}>
              {t(I18nKey.BUTTON$CANCEL)}
            </BrandButton>
          )}
          <div className="flex shrink-0 items-center gap-2">
            <BrandButton
              type="button"
              variant="primary"
              testId="create-automation-wizard-footer-next"
              className={WIZARD_PRIMARY_BUTTON_CLASS}
              isDisabled={!canAdvance}
              onClick={handlePrimaryAction}
            >
              {currentStep === "review" ? (
                t(I18nKey.AUTOMATIONS$WIZARD_CREATE)
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  {t(I18nKey.ONBOARDING$NEXT)}
                  <ChevronRight className="size-4" aria-hidden />
                </span>
              )}
            </BrandButton>
          </div>
        </footer>
      </div>
    </ModalBackdrop>
  );
}
