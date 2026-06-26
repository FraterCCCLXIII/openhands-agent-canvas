import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createRoutesStub } from "react-router";
import SettingsScreen from "#/routes/settings";
import OdysseusSettingsRoute from "#/routes/odysseus-settings";
import { OSS_NAV_ITEMS } from "#/constants/settings-nav";
import { ActiveBackendProvider } from "#/contexts/active-backend-context";

vi.mock("#/hooks/use-settings-nav-items", () => ({
  useSettingsNavItems: () =>
    OSS_NAV_ITEMS.filter((item) => item.to === "/settings/integrations").map(
      (item) => ({ type: "item", item }),
    ),
}));

describe("odysseus settings route", () => {
  it("renders Odysseus integration form inside settings layout", () => {
    const RouterStub = createRoutesStub([
      {
        path: "/settings",
        Component: SettingsScreen,
        children: [
          {
            path: "/settings/integrations",
            Component: OdysseusSettingsRoute,
          },
        ],
      },
    ]);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <ActiveBackendProvider>
          <RouterStub initialEntries={["/settings/integrations"]} />
        </ActiveBackendProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByTestId("settings-screen")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("http://127.0.0.1:7000"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("ody_...")).toBeInTheDocument();
  });
});
