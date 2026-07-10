import { useTranslation } from "react-i18next";
import { NavigationLink } from "#/components/shared/navigation-link";
import { BrandButton } from "#/components/features/settings/brand-button";
import { cn } from "#/utils/utils";
import {
  formControlBorderClassName,
  formControlButtonClassName,
  formControlSurfaceClassName,
} from "#/utils/form-control-classes";
import { I18nKey } from "#/i18n/declaration";
import type { AutomateDashboardCategoryConfig } from "./automate-dashboard.constants";

interface AutomateDashboardCategoryCardProps {
  config: AutomateDashboardCategoryConfig;
  count: number;
  onCreate: () => void;
}

export function AutomateDashboardCategoryCard({
  config,
  count,
  onCreate,
}: AutomateDashboardCategoryCardProps) {
  const { t } = useTranslation("openhands");

  return (
    <article
      data-testid={config.testId}
      className={cn(
        "flex min-h-[12.5rem] flex-col rounded-xl p-5",
        formControlBorderClassName,
        formControlSurfaceClassName,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-content">
          {t(config.titleKey)}
        </h2>
        <span
          data-testid={`${config.testId}-count`}
          className="text-sm text-muted"
        >
          {count}
        </span>
      </div>

      <p className="mt-2 flex-1 text-sm text-muted">
        {t(config.descriptionKey)}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <NavigationLink
          to={config.viewPath}
          data-testid={`${config.testId}-view`}
          className={cn(
            formControlButtonClassName,
            formControlBorderClassName,
            formControlSurfaceClassName,
            "text-white hover:bg-surface-raised",
          )}
        >
          {t(I18nKey.COMMON$VIEW)}
        </NavigationLink>
        <BrandButton
          type="button"
          variant="secondary"
          testId={`${config.testId}-create`}
          className="border border-[var(--oh-border)] bg-base-secondary text-white hover:bg-surface-raised"
          onClick={onCreate}
        >
          {t(config.createLabelKey)}
        </BrandButton>
      </div>
    </article>
  );
}
