import { useTranslation } from "react-i18next";
import { RunStatusBadge } from "#/components/features/automations/detail/run-status-badge";
import { NavigationLink } from "#/components/shared/navigation-link";
import { I18nKey } from "#/i18n/declaration";
import { HOME_AUTOMATION_ACTIVITY_EXAMPLES } from "./home-automation-activity-examples";

/**
 * Prototype list of running + recently finished automations under the home
 * composer. Uses static example rows so the UI can be designed without the
 * automation backend.
 */
export function RunningAutomationsList() {
  const { t } = useTranslation("openhands");
  const examples = HOME_AUTOMATION_ACTIVITY_EXAMPLES;

  return (
    <section
      aria-labelledby="running-automations-heading"
      data-testid="running-automations-list"
      className="w-full"
    >
      <h2
        id="running-automations-heading"
        className="mb-2 text-sm font-medium text-[var(--oh-foreground)]"
      >
        {t(I18nKey.FEATURED_AUTOMATIONS$RECENT_TITLE)}
      </h2>

      <ul
        aria-label={t(I18nKey.FEATURED_AUTOMATIONS$RECENT_GROUP_LABEL)}
        className="divide-y divide-[var(--oh-border-subtle)] overflow-hidden rounded-xl border border-[var(--oh-border-subtle)] bg-[var(--oh-surface)]"
      >
        {examples.map((example) => {
          const href = example.conversationId
            ? `/conversations/${example.conversationId}`
            : `/automations/${example.id}`;

          return (
            <li
              key={example.id}
              data-testid={`running-automation-row-${example.id}`}
            >
              <NavigationLink
                to={href}
                aria-label={example.name}
                className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--oh-interactive-hover)] focus:outline-none focus-visible:bg-[var(--oh-interactive-hover)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--oh-focus)]"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--oh-foreground)]">
                    {example.name}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--oh-text-secondary)]">
                    {example.triggerSummary}
                    {}
                    {" · "}
                    {example.whenLabel}
                  </span>
                </div>

                <RunStatusBadge status={example.status} />
              </NavigationLink>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
