import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import type { LoopTemplate } from "#/data/loop-templates";
import { cn } from "#/utils/utils";
import {
  extensionModuleCardInteractiveClassName,
  extensionModuleCardSurfaceClassName,
} from "#/utils/extension-module-card-classes";

interface LoopTemplateCardProps {
  template: LoopTemplate;
  onSelect: (templateId: string) => void;
}

export function LoopTemplateCard({
  template,
  onSelect,
}: LoopTemplateCardProps) {
  const { t } = useTranslation("openhands");

  return (
    <button
      type="button"
      data-testid={`loop-template-${template.id}`}
      onClick={() => onSelect(template.id)}
      className={cn(
        "flex min-w-0 flex-col gap-2 p-4 text-left",
        extensionModuleCardSurfaceClassName,
        extensionModuleCardInteractiveClassName,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-foreground">
          {t(template.nameKey as I18nKey)}
        </h3>
        <span className="shrink-0 rounded-full border border-[var(--oh-border)] px-2 py-0.5 text-[10px] text-tertiary-light">
          {t(template.phaseLabelKey as I18nKey)}
        </span>
      </div>
      <p className="text-xs text-tertiary-light">
        {t(template.descriptionKey as I18nKey)}
      </p>
    </button>
  );
}
