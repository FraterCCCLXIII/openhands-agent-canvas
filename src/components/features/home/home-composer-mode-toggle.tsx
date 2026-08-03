import { Clock, Code } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  HOME_COMPOSER_MODE,
  type HomeComposerMode,
} from "./home-composer-mode";

interface HomeComposerModeToggleProps {
  value: HomeComposerMode;
  onChange: (value: HomeComposerMode) => void;
}

const MODE_OPTIONS = [
  {
    value: HOME_COMPOSER_MODE.code,
    labelKey: I18nKey.HOME$COMPOSER_MODE_CODE,
    Icon: Code,
  },
  {
    value: HOME_COMPOSER_MODE.automation,
    labelKey: I18nKey.HOME$COMPOSER_MODE_AUTOMATION,
    Icon: Clock,
  },
] as const;

/**
 * Pill segmented control above the home composer — Code vs Automation launch
 * mode. Matches the raised-white-pill-on-track pattern from the product mock.
 */
export function HomeComposerModeToggle({
  value,
  onChange,
}: HomeComposerModeToggleProps) {
  const { t } = useTranslation("openhands");

  return (
    <div
      role="radiogroup"
      aria-label={t(I18nKey.HOME$COMPOSER_MODE_FILTER)}
      data-testid="home-composer-mode-toggle"
      className="inline-flex items-center gap-1 rounded-full border border-[var(--oh-border-subtle)] bg-[var(--oh-surface-deep)] p-1"
    >
      {MODE_OPTIONS.map(({ value: optionValue, labelKey, Icon }) => {
        const isActive = optionValue === value;
        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={isActive}
            data-testid={`home-composer-mode-${optionValue}`}
            onClick={() => onChange(optionValue)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[var(--oh-foreground)] text-[var(--oh-surface)] shadow-sm"
                : "bg-transparent text-[var(--oh-muted)] hover:text-[var(--oh-foreground)]",
            )}
          >
            <Icon className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
            {t(labelKey)}
          </button>
        );
      })}
    </div>
  );
}
