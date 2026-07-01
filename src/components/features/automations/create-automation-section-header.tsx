import { Minus } from "lucide-react";
import { cn } from "#/utils/utils";
import { createAutomationFieldLabelClassName } from "./create-automation-form.constants";

interface CreateAutomationSectionHeaderProps {
  label: string;
  hideAriaLabel: string;
  onHide: () => void;
  hideTestId?: string;
  htmlFor?: string;
  labelAccessory?: React.ReactNode;
}

export function CreateAutomationSectionHeader({
  label,
  hideAriaLabel,
  onHide,
  hideTestId = "create-automation-section-hide",
  htmlFor,
  labelAccessory,
}: CreateAutomationSectionHeaderProps) {
  const LabelTag = htmlFor ? "label" : "span";

  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <LabelTag
          htmlFor={htmlFor}
          className={createAutomationFieldLabelClassName}
        >
          {label}
        </LabelTag>
        {labelAccessory}
      </div>
      <button
        type="button"
        data-testid={hideTestId}
        aria-label={hideAriaLabel}
        onClick={onHide}
        className={cn(
          "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full",
          "text-muted hover:bg-white/10 hover:text-white",
        )}
      >
        <Minus className="size-3.5" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
