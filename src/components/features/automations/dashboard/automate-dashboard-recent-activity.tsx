import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { NavigationLink } from "#/components/shared/navigation-link";
import { I18nKey } from "#/i18n/declaration";
import type { Automation } from "#/types/automation";
import {
  getAutomationKind,
  type AutomationKind,
} from "#/utils/automation-kind";
import { formatAutomationRelativeTime } from "#/utils/format-automation-relative-time";
import { cn } from "#/utils/utils";
import {
  formControlBorderClassName,
  formControlButtonClassName,
  formControlSurfaceClassName,
} from "#/utils/form-control-classes";
import {
  AUTOMATE_DASHBOARD_RECENT_ACTIVITY_LIMIT,
  AUTOMATE_DASHBOARD_TEMPLATES_PATH,
} from "./automate-dashboard.constants";

interface AutomateDashboardRecentActivityProps {
  automations: Automation[];
}

function getKindLabelKey(kind: AutomationKind): I18nKey {
  switch (kind) {
    case "workflow":
      return I18nKey.AUTOMATE$DASHBOARD_KIND_WORKFLOW;
    case "routine":
      return I18nKey.AUTOMATE$DASHBOARD_KIND_ROUTINE;
    case "responder":
      return I18nKey.AUTOMATE$DASHBOARD_KIND_RESPONDER;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function AutomateDashboardRecentActivity({
  automations,
}: AutomateDashboardRecentActivityProps) {
  const { t, i18n } = useTranslation("openhands");

  const recentAutomations = useMemo(
    () =>
      automations
        .filter((automation) => automation.last_triggered_at)
        .sort((a, b) => {
          const aTime = new Date(a.last_triggered_at ?? 0).getTime();
          const bTime = new Date(b.last_triggered_at ?? 0).getTime();
          return bTime - aTime;
        })
        .slice(0, AUTOMATE_DASHBOARD_RECENT_ACTIVITY_LIMIT),
    [automations],
  );

  return (
    <section
      data-testid="automate-dashboard-recent-activity"
      className={cn(
        "rounded-xl",
        formControlBorderClassName,
        formControlSurfaceClassName,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[var(--oh-border)] px-5 py-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-content">
            {t(I18nKey.AUTOMATE$DASHBOARD_RECENT_ACTIVITY)}
          </h2>
          <p className="text-sm text-muted">
            {t(I18nKey.AUTOMATE$DASHBOARD_RECENT_ACTIVITY_SUBTITLE)}
          </p>
        </div>
        <NavigationLink
          to={AUTOMATE_DASHBOARD_TEMPLATES_PATH}
          data-testid="automate-dashboard-browse-templates"
          className={cn(
            formControlButtonClassName,
            formControlBorderClassName,
            formControlSurfaceClassName,
            "shrink-0 text-white hover:bg-surface-raised",
          )}
        >
          {t(I18nKey.AUTOMATE$DASHBOARD_BROWSE_TEMPLATES)}
        </NavigationLink>
      </div>

      {recentAutomations.length === 0 ? (
        <p
          data-testid="automate-dashboard-recent-activity-empty"
          className="px-5 py-6 text-sm text-muted"
        >
          {t(I18nKey.AUTOMATE$DASHBOARD_RECENT_ACTIVITY_EMPTY)}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--oh-border)]">
          {recentAutomations.map((automation) => {
            const kind = getAutomationKind(automation);
            return (
              <li key={automation.id}>
                <NavigationLink
                  to={`/automations/${automation.id}`}
                  data-testid={`automate-dashboard-recent-activity-item-${automation.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-raised"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-content">
                      {automation.name}
                    </p>
                    <p className="text-sm text-muted">
                      {t(getKindLabelKey(kind))}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-muted">
                    {formatAutomationRelativeTime(
                      automation.last_triggered_at!,
                      i18n.language,
                      t,
                    )}
                  </span>
                </NavigationLink>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
