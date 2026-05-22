import { Grid2x2, Rows3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import type { AutomationViewMode } from "./automation-view-mode";

interface AutomationViewToggleProps {
  view: AutomationViewMode;
  onChange: (view: AutomationViewMode) => void;
}

const toggleButtonClassName = (isActive: boolean) =>
  cn(
    "inline-flex size-7 cursor-pointer items-center justify-center rounded transition-colors",
    isActive
      ? "bg-[var(--oh-interactive-hover)] text-white"
      : "text-[var(--oh-muted)] hover:text-white",
  );

export function AutomationViewToggle({
  view,
  onChange,
}: AutomationViewToggleProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      role="radiogroup"
      aria-label={t(I18nKey.AUTOMATIONS$VIEW_MODE)}
      data-testid="automations-view-toggle"
      className="inline-flex shrink-0 items-center rounded-md bg-[var(--oh-surface-raised)] p-0.5"
    >
      <button
        type="button"
        role="radio"
        aria-checked={view === "grid"}
        aria-label={t(I18nKey.AUTOMATIONS$VIEW_GRID)}
        data-testid="automations-view-toggle-grid"
        onClick={() => onChange("grid")}
        className={toggleButtonClassName(view === "grid")}
      >
        <Grid2x2 className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={view === "list"}
        aria-label={t(I18nKey.AUTOMATIONS$VIEW_LIST)}
        data-testid="automations-view-toggle-list"
        onClick={() => onChange("list")}
        className={toggleButtonClassName(view === "list")}
      >
        <Rows3 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
