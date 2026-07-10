import { Outlet } from "react-router";
import { AutomateLayout } from "#/components/features/automations/automate-layout";

export default function AutomationsLayoutRoute() {
  return (
    <main data-testid="automations-screen" className="min-h-0 h-full">
      <AutomateLayout>
        <Outlet />
      </AutomateLayout>
    </main>
  );
}
