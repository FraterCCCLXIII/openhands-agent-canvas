import { Pin, PinOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { KebabMenu } from "#/components/features/automations/kebab-menu";
import { NavigationLink } from "#/components/shared/navigation-link";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { I18nKey } from "#/i18n/declaration";
import { usePinnedAutomationsStore } from "#/stores/pinned-automations-store";
import { HOME_RECOMMENDED_AUTOMATION_CARDS } from "./home-recommended-automation-examples";

/**
 * Compact rail of recommended automation starter cards for Automate mode.
 * Each card links to /automations and exposes Pin/Unpin via a kebab menu.
 */
export function RecommendedAutomationsRail() {
  const { t } = useTranslation("openhands");
  const { backend } = useActiveBackend();
  const pinnedIds =
    usePinnedAutomationsStore((state) => state.pinsByBackendId[backend.id]) ??
    [];
  const togglePin = usePinnedAutomationsStore((state) => state.togglePin);

  return (
    <section
      data-testid="recommended-automations-rail"
      aria-label={t(I18nKey.FEATURED_AUTOMATIONS$RECOMMENDED_GROUP_LABEL)}
      className="w-full"
    >
      <div
        role="group"
        aria-label={t(I18nKey.FEATURED_AUTOMATIONS$RECOMMENDED_GROUP_LABEL)}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {HOME_RECOMMENDED_AUTOMATION_CARDS.map(
          ({ id, labelKey, Icon, iconColor, href }) => {
            const isPinned = pinnedIds.includes(id);
            return (
              <div
                key={id}
                className="relative flex min-h-[4.5rem] flex-col rounded-xl border border-[var(--oh-border)] bg-[var(--oh-surface-raised)] transition-colors hover:bg-[var(--oh-interactive-hover)]"
              >
                <NavigationLink
                  to={href}
                  data-testid={`recommended-automation-card-${id}`}
                  className="flex min-h-[4.5rem] flex-1 flex-col justify-between p-2 pr-8 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oh-focus)] rounded-xl"
                >
                  <Icon
                    aria-hidden="true"
                    className="size-4 shrink-0"
                    color={iconColor}
                    strokeWidth={1.75}
                  />
                  <span className="text-xs leading-snug text-[var(--oh-foreground)]">
                    {t(labelKey)}
                  </span>
                </NavigationLink>
                <div className="absolute right-1 top-1">
                  <KebabMenu
                    items={[
                      {
                        label: t(
                          isPinned
                            ? I18nKey.FEATURED_AUTOMATIONS$UNPIN
                            : I18nKey.FEATURED_AUTOMATIONS$PIN,
                        ),
                        icon: isPinned ? (
                          <PinOff className="size-4" aria-hidden />
                        ) : (
                          <Pin className="size-4" aria-hidden />
                        ),
                        onClick: () => togglePin(backend.id, id),
                      },
                    ]}
                  />
                </div>
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}
