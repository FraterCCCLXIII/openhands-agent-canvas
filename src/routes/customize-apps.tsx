import { useTranslation } from "react-i18next";
import { getAllApps, isAppAvailable } from "#/apps/registry";
import { OdysseusIntegrationSettings } from "#/components/features/settings/odysseus-integration-settings";
import { ExtensionsNavigation } from "#/components/features/skills/extensions-navigation";
import { I18nKey } from "#/i18n/declaration";
import {
  extensionModuleCardGridClassName,
  extensionModuleCardGridContainerClassName,
  extensionModuleCardSurfaceClassName,
} from "#/utils/extension-module-card-classes";
import { settingsLikeMainScrollClassName } from "#/utils/settings-like-page-layout-classes";
import { cn } from "#/utils/utils";

export default function CustomizeAppsRoute() {
  const { t } = useTranslation("openhands");
  const apps = getAllApps();

  return (
    <div
      data-testid="customize-apps-screen"
      className="flex h-full gap-4 md:gap-6 md:pl-8 lg:gap-10 lg:pl-10"
    >
      <ExtensionsNavigation />
      <main className={cn(settingsLikeMainScrollClassName, "h-full")}>
        <div className="mx-auto flex w-full min-w-0 max-w-[800px] flex-col gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold leading-6 text-foreground">
              {t(I18nKey.APPS$HUB_TITLE)}
            </h2>
            <p className="max-w-2xl text-sm text-tertiary-light">
              {t(I18nKey.APPS$HUB_DESCRIPTION)}
            </p>
          </div>

          <section className="flex flex-col gap-3">
            <h3 className="text-base font-semibold text-foreground">
              {t(I18nKey.APPS$ODYSSEUS_TITLE)}
            </h3>
            <OdysseusIntegrationSettings />
          </section>

          <section
            className={cn(
              "flex min-w-0 flex-col gap-3",
              extensionModuleCardGridContainerClassName,
            )}
          >
            <h3 className="text-base font-semibold text-foreground">
              {t(I18nKey.APPS$CATALOG_TITLE)}
            </h3>
            <div className={extensionModuleCardGridClassName}>
              {apps.map((app) => (
                <div
                  key={app.id}
                  className={cn(
                    extensionModuleCardSurfaceClassName,
                    "p-4",
                    !isAppAvailable(app) && "opacity-50",
                  )}
                >
                  <h4 className="font-medium text-foreground">
                    {app.displayName}
                  </h4>
                  <p className="mt-1 text-xs text-tertiary-light">
                    {t(app.descriptionKey as I18nKey, app.displayName)}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-tertiary-light">
                    {app.scope === "product"
                      ? t(I18nKey.APPS$SCOPE_PRODUCT)
                      : t(I18nKey.APPS$SCOPE_WORK)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
