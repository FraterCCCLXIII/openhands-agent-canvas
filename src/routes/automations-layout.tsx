import { Outlet } from "react-router";
import { AutomationsNavigation } from "#/components/features/automations/automations-navigation";
import { settingsLikeMainScrollClassName } from "#/utils/settings-like-page-layout-classes";

export default function AutomationsLayout() {
  return (
    <div data-testid="automations-layout" className="flex h-full gap-10">
      <AutomationsNavigation />
      <main className={settingsLikeMainScrollClassName}>
        <div className="mx-auto flex w-full min-w-0 max-w-[800px] flex-col gap-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
