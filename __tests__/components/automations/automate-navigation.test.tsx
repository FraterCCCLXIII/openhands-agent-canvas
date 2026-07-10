import type { ReactNode } from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActiveBackendProvider } from "#/contexts/active-backend-context";
import { NavigationProvider } from "#/context/navigation-context";
import { AutomateNavigation } from "#/components/features/automations/automate-navigation";
import {
  AUTOMATIONS_DASHBOARD_PATH,
  AUTOMATIONS_RESPONDERS_PATH,
  AUTOMATIONS_ROUTINES_PATH,
  AUTOMATIONS_TEMPLATES_PATH,
  AUTOMATIONS_WORKFLOWS_PATH,
} from "#/components/features/automations/automations-page.constants";

function renderAutomateNavigation(
  ui: ReactNode,
  initialPath = AUTOMATIONS_ROUTINES_PATH,
) {
  return render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ActiveBackendProvider>
        <NavigationProvider
          value={{
            currentPath: initialPath,
            conversationId: null,
            isNavigating: false,
            navigate: () => {},
          }}
        >
          <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
        </NavigationProvider>
      </ActiveBackendProvider>
    </QueryClientProvider>,
  );
}

describe("AutomateNavigation", () => {
  it("renders the Automate section with all subpage links", () => {
    renderAutomateNavigation(<AutomateNavigation />);

    const nav = screen.getByTestId("automate-navbar-desktop");
    expect(within(nav).getByText("AUTOMATE$SECTION_TITLE")).toBeInTheDocument();

    expect(
      within(nav).getByTestId("sidebar-automate-dashboard"),
    ).toHaveAttribute("href", AUTOMATIONS_DASHBOARD_PATH);
    expect(
      within(nav).getByTestId("sidebar-automate-workflows"),
    ).toHaveAttribute("href", AUTOMATIONS_WORKFLOWS_PATH);
    expect(
      within(nav).getByTestId("sidebar-automate-routines"),
    ).toHaveAttribute("href", AUTOMATIONS_ROUTINES_PATH);
    expect(
      within(nav).getByTestId("sidebar-automate-responders"),
    ).toHaveAttribute("href", AUTOMATIONS_RESPONDERS_PATH);
    expect(
      within(nav).getByTestId("sidebar-automate-templates"),
    ).toHaveAttribute("href", AUTOMATIONS_TEMPLATES_PATH);
  });

  it("highlights the routines link on the index automations route", () => {
    renderAutomateNavigation(<AutomateNavigation />, AUTOMATIONS_ROUTINES_PATH);

    const routinesLink = screen.getByTestId("sidebar-automate-routines");
    expect(routinesLink.className).toContain("bg-tertiary");
  });

  it("highlights the templates link on the templates route", () => {
    renderAutomateNavigation(
      <AutomateNavigation />,
      AUTOMATIONS_TEMPLATES_PATH,
    );

    const templatesLink = screen.getByTestId("sidebar-automate-templates");
    expect(templatesLink.className).toContain("bg-tertiary");
  });
});
