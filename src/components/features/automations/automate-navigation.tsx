import { useTranslation } from "react-i18next";
import { Typography } from "#/ui/typography";
import { I18nKey } from "#/i18n/declaration";
import { SidebarNavLink } from "#/components/features/sidebar/sidebar-nav-link";
import { AUTOMATE_NAV_ITEMS } from "#/constants/automate-nav";

/**
 * Secondary left nav for the Automate area (Dashboard, Workflows, Routines,
 * Responders, Templates). Mirrors {@link SettingsDesktopSidebar} and
 * {@link ExtensionsNavigation}.
 */
export function AutomateNavigation() {
  const { t } = useTranslation("openhands");

  return (
    <aside
      data-testid="automate-navbar-desktop"
      className="hidden md:flex md:w-[260px] md:shrink-0 md:flex-col md:gap-2 md:sticky md:top-8 md:self-start md:pl-8"
    >
      <Typography.Text className="px-2 text-sm font-normal text-white">
        {t(I18nKey.AUTOMATE$SECTION_TITLE)}
      </Typography.Text>
      <div className="flex flex-col gap-0.5 pt-0.5">
        {AUTOMATE_NAV_ITEMS.map((item) => (
          <SidebarNavLink
            key={item.to}
            to={item.to}
            end={item.end}
            label={t(I18nKey[item.labelKey])}
            testId={`sidebar-automate-${item.testIdSuffix}`}
            icon={item.icon}
          />
        ))}
      </div>
    </aside>
  );
}
