import { AutomateAddAutomationProvider } from "./automate-add-automation-provider";
import { AutomateNavigation } from "./automate-navigation";
import { settingsLayoutMainScrollClassName } from "#/utils/settings-like-page-layout-classes";

interface AutomateLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout shell for /automations/* — aside and main are siblings so the left
 * nav stays pinned while the active subpage scrolls.
 */
export function AutomateLayout({ children }: AutomateLayoutProps) {
  return (
    <AutomateAddAutomationProvider>
      <div className="flex h-full flex-col md:pt-8">
        <div className="flex min-h-0 flex-1 gap-10 md:items-start">
          <AutomateNavigation />
          <main className={settingsLayoutMainScrollClassName}>
            <div className="mx-auto w-full min-w-0 max-w-4xl">{children}</div>
          </main>
        </div>
      </div>
    </AutomateAddAutomationProvider>
  );
}
