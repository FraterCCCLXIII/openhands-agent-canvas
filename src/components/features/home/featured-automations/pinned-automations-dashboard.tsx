import { PinOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { RunStatusBadge } from "#/components/features/automations/detail/run-status-badge";
import { KebabMenu } from "#/components/features/automations/kebab-menu";
import { NavigationLink } from "#/components/shared/navigation-link";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { I18nKey } from "#/i18n/declaration";
import { usePinnedAutomationsStore } from "#/stores/pinned-automations-store";
import { getRecommendedAutomationCardById } from "./home-recommended-automation-examples";

/**
 * Dashboard grid of pinned recommended automations. Each module mirrors the
 * running-activity row shape (name, trigger · when, status badge).
 */
export function PinnedAutomationsDashboard() {
  const { t } = useTranslation("openhands");
  const { backend } = useActiveBackend();
  const pinnedIds =
    usePinnedAutomationsStore((state) => state.pinsByBackendId[backend.id]) ??
    [];
  const unpinAutomation = usePinnedAutomationsStore(
    (state) => state.unpinAutomation,
  );

  const modules = pinnedIds
    .map((id) => getRecommendedAutomationCardById(id))
    .filter((card): card is NonNullable<typeof card> => card != null);

  if (modules.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="pinned-automations-dashboard"
      aria-label={t(I18nKey.FEATURED_AUTOMATIONS$PINNED_GROUP_LABEL)}
      className="w-full shrink-0 px-4 pb-3 pt-4 md:px-4 lg:px-0"
    >
      <div className="mx-auto grid w-full max-w-[800px] grid-cols-1 gap-2 sm:grid-cols-2 md:px-4">
        {modules.map(({ id, Icon, iconColor, demoActivity }) => {
          const href = demoActivity.conversationId
            ? `/conversations/${demoActivity.conversationId}`
            : `/automations/${id}`;

          return (
            <div
              key={id}
              data-testid={`pinned-automation-module-${id}`}
              className="relative overflow-hidden rounded-xl border border-[var(--oh-border-subtle)] bg-[var(--oh-surface)]"
            >
              <NavigationLink
                to={href}
                aria-label={demoActivity.name}
                className="flex items-start justify-between gap-3 p-3 pr-10 transition-colors hover:bg-[var(--oh-interactive-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--oh-focus)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Icon
                      aria-hidden="true"
                      className="size-4 shrink-0"
                      color={iconColor}
                      strokeWidth={1.75}
                    />
                    <span className="truncate text-sm font-medium text-[var(--oh-foreground)]">
                      {demoActivity.name}
                    </span>
                  </div>
                  <span className="block truncate text-xs text-[var(--oh-text-secondary)]">
                    {demoActivity.triggerSummary}
                    {}
                    {" · "}
                    {demoActivity.whenLabel}
                  </span>
                </div>
                <RunStatusBadge status={demoActivity.status} />
              </NavigationLink>
              <div className="absolute right-1 top-1">
                <KebabMenu
                  items={[
                    {
                      label: t(I18nKey.FEATURED_AUTOMATIONS$UNPIN),
                      icon: <PinOff className="size-4" aria-hidden />,
                      onClick: () => unpinAutomation(backend.id, id),
                    },
                  ]}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
