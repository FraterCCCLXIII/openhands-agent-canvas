import { useTranslation } from "react-i18next";
import { NavigationLink } from "#/components/shared/navigation-link";
import { cn } from "#/utils/utils";
import { I18nKey } from "#/i18n/declaration";
import { AUTOMATIONS_NAV_ITEMS } from "#/constants/automations-nav";

export function AutomationsNavigation() {
  const { t } = useTranslation("openhands");

  return (
    <aside
      data-testid="automations-navbar-desktop"
      className="hidden md:flex md:w-[260px] md:shrink-0 md:flex-col md:gap-2 md:sticky md:top-8 md:self-start md:pl-8"
    >
      <span className="px-2 text-sm font-normal text-white">
        {t(I18nKey.SIDEBAR$AUTOMATIONS)}
      </span>
      <div className="flex flex-col gap-0.5 pt-0.5">
        {AUTOMATIONS_NAV_ITEMS.map((item) => (
          <NavigationLink
            key={item.to}
            to={item.to}
            end={item.end}
            data-testid={`sidebar-automations-${item.to}`}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md transition-colors text-sm leading-5 truncate px-2 py-2 w-full",
                isActive
                  ? "bg-tertiary text-white font-medium"
                  : "text-[var(--oh-muted)] hover:text-white hover:bg-[var(--oh-surface-raised)]",
              )
            }
          >
            <span className="flex shrink-0 items-center justify-center">
              {item.icon}
            </span>
            <span className="truncate">{t(item.labelKey)}</span>
          </NavigationLink>
        ))}
      </div>
    </aside>
  );
}
