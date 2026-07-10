import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { ActiveBackendProvider } from "#/contexts/active-backend-context";
import { NavigationProvider } from "#/context/navigation-context";
import { AutomateDashboard } from "#/components/features/automations/dashboard/automate-dashboard";
import { MOCK_AUTOMATIONS_RESPONSE } from "#/mocks/automations.mock";
import {
  AUTOMATIONS_ROUTINES_PATH,
  AUTOMATIONS_TEMPLATES_PATH,
  AUTOMATIONS_WORKFLOWS_PATH,
} from "#/components/features/automations/automations-page.constants";

const {
  mockUseAutomationHealth,
  mockUseAutomations,
  mockNavigate,
} = vi.hoisted(() => ({
  mockUseAutomationHealth: vi.fn(),
  mockUseAutomations: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock("#/hooks/query/use-automation-health", () => ({
  useAutomationHealth: () => mockUseAutomationHealth(),
}));

vi.mock("#/hooks/query/use-automations", () => ({
  useAutomations: (options?: { enabled?: boolean }) =>
    mockUseAutomations(options),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) => {
      if (vars?.count != null) return `${key}:${String(vars.count)}`;
      return key;
    },
    i18n: { language: "en" },
  }),
}));

vi.mock("#/hooks/use-create-automation-in-chat", () => ({
  useCreateAutomationInChat: () => vi.fn(),
}));

vi.mock("#/hooks/use-is-creating-conversation", () => ({
  useIsCreatingConversation: () => false,
}));

vi.mock("#/hooks/mutation/use-create-conversation", () => ({
  useCreateConversation: () => ({ mutate: vi.fn(), isPending: false }),
}));

function renderDashboard(ui: ReactNode = <AutomateDashboard />) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ActiveBackendProvider>
        <NavigationProvider
          value={{
            currentPath: "/automations/dashboard",
            conversationId: null,
            isNavigating: false,
            navigate: mockNavigate,
          }}
        >
          <MemoryRouter initialEntries={["/automations/dashboard"]}>
            {ui}
          </MemoryRouter>
        </NavigationProvider>
      </ActiveBackendProvider>
    </QueryClientProvider>,
  );
}

describe("AutomateDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAutomationHealth.mockReturnValue({
      data: { status: "ok" },
      isLoading: false,
      refetch: vi.fn(),
    });
    mockUseAutomations.mockReturnValue({
      data: MOCK_AUTOMATIONS_RESPONSE,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it("renders summary stats and category counts from automations data", () => {
    renderDashboard();

    expect(screen.getByTestId("automate-dashboard-stat-total")).toHaveTextContent(
      "7",
    );
    expect(screen.getByTestId("automate-dashboard-stat-active")).toHaveTextContent(
      "5",
    );
    expect(screen.getByTestId("automate-dashboard-stat-routines")).toHaveTextContent(
      "5",
    );
    expect(screen.getByTestId("automate-dashboard-stat-responders")).toHaveTextContent(
      "0",
    );

    expect(
      screen.getByTestId("automate-dashboard-category-workflows-count"),
    ).toHaveTextContent("2");
    expect(
      screen.getByTestId("automate-dashboard-category-routines-count"),
    ).toHaveTextContent("5");
    expect(
      screen.getByTestId("automate-dashboard-category-responders-count"),
    ).toHaveTextContent("0");
  });

  it("lists recent activity sorted by last triggered time", () => {
    renderDashboard();

    const firstItem = screen.getByTestId(
      "automate-dashboard-recent-activity-item-a1000000-0000-0000-0000-000000000001",
    );
    expect(firstItem).toHaveTextContent("PR Triage Digest");
    expect(firstItem).toHaveTextContent("AUTOMATE$DASHBOARD_KIND_ROUTINE");
  });

  it("links category view actions and browse templates to automate subpages", () => {
    renderDashboard();

    expect(screen.getByTestId("automate-dashboard-category-workflows-view")).toHaveAttribute(
      "href",
      AUTOMATIONS_WORKFLOWS_PATH,
    );
    expect(screen.getByTestId("automate-dashboard-category-routines-view")).toHaveAttribute(
      "href",
      AUTOMATIONS_ROUTINES_PATH,
    );
    expect(screen.getByTestId("automate-dashboard-browse-templates")).toHaveAttribute(
      "href",
      AUTOMATIONS_TEMPLATES_PATH,
    );
  });

  it("opens the create wizard when a category create button is clicked", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(
      screen.getByTestId("automate-dashboard-category-routines-create"),
    );

    expect(
      await screen.findByTestId("create-automation-wizard-modal"),
    ).toBeInTheDocument();
  });
});
