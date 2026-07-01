import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

interface WizardSectionProps {
  title: ReactNode;
  description?: string;
  descriptionPlacement?: "inline" | "content";
  children: ReactNode;
  className?: string;
  testId?: string;
  defaultExpanded?: boolean;
}

export function WizardSection({
  title,
  description,
  descriptionPlacement = "content",
  children,
  className,
  testId,
  defaultExpanded = false,
}: WizardSectionProps) {
  const { t } = useTranslation("openhands");
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentId = useId();

  return (
    <section
      data-testid={testId}
      data-state={expanded ? "open" : "closed"}
      className={cn(
        "rounded-xl border border-[var(--oh-border)] bg-base-secondary p-4",
        className,
      )}
    >
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-left"
        aria-expanded={expanded}
        aria-controls={contentId}
        aria-label={
          expanded ? t(I18nKey.BUTTON$COLLAPSE) : t(I18nKey.BUTTON$EXPAND)
        }
        onClick={() => setExpanded((previous) => !previous)}
      >
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="shrink-0 text-sm font-medium text-content">{title}</h3>
          {description && descriptionPlacement === "inline" ? (
            <p className="text-sm font-normal text-muted">{description}</p>
          ) : null}
        </div>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      {expanded ? (
        <div id={contentId} className="mt-4 flex flex-col gap-4">
          {description && descriptionPlacement === "content" ? (
            <p className="text-sm text-muted">{description}</p>
          ) : null}
          {children}
        </div>
      ) : null}
    </section>
  );
}

interface WizardFieldGroupProps {
  label: string;
  helper?: string;
  children: ReactNode;
  accessory?: ReactNode;
}

export function WizardFieldGroup({
  label,
  helper,
  children,
  accessory,
}: WizardFieldGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-content">{label}</span>
        {accessory}
      </div>
      {children}
      {helper ? <p className="text-xs text-muted">{helper}</p> : null}
    </div>
  );
}
