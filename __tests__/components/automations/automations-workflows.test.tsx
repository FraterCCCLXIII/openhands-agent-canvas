import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { ActiveBackendProvider } from "#/contexts/active-backend-context";
import { NavigationProvider } from "#/context/navigation-context";
import { AutomateAddAutomationProvider } from "#/components/features/automations/automate-add-automation-provider";
import AutomationsWorkflows from "#/routes/automations-workflows";
import { MOCK_AUTOMATIONS_RESPONSE } from "#/mocks/automations.mock";
import { getAutomationKind } from "#/utils/automation-kind";

const { mockUseAutomationHealth, mockUseAutomations } = vi.hoisted(() => ({
  mockUseAutomationHealth: vi.fn(),
  mockUseAutomations: vi.fn(),
}));

vi.mock("#/hooks/query/use-automation-health", () => ({
  useAutomationHealth: () => mockUseAutomationHealth(),
}));

vi.mock("#/hooks/query/use-automations", () => ({
  useAutomations: (options?: { enabled?: boolean }) =>
    mockUseAutomations(options),
  useToggleAutomation: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteAutomation: () => ({ mutate: vi.fn(), isPending: false }),
  useDispatchAutomation: () => ({
    mutate: vi.fn(),
    isPending: false,
    variables: null,
  }),
}));

vi.mock("#/hooks/use-tracking", () => ({
  useTracking: () => ({ trackPrebuiltAutomationEnabled: vi.fn() }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

function renderWorkflowsPage(ui: ReactNode = <AutomationsWorkflows />) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ActiveBackendProvider>
        <NavigationProvider
          value={{
            currentPath: "/automations/workflows",
            conversationId: null,
            isNavigating: false,
            navigate: vi.fn(),
          }}
        >
          <AutomateAddAutomationProvider>
            <MemoryRouter initialEntries={["/automations/workflows"]}>
              {ui}
            </MemoryRouter>
          </AutomateAddAutomationProvider>
        </NavigationProvider>
      </ActiveBackendProvider>
    </QueryClientProvider>,
  );
}

describe("AutomationsWorkflows", () => {
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

  it("renders the workflows header and search controls", () => {
    renderWorkflowsPage();

    expect(screen.getByTestId("automations-workflows-screen")).toBeInTheDocument();
    expect(screen.getByText("AUTOMATE$NAV_WORKFLOWS")).toBeInTheDocument();
    expect(
      screen.getByText("AUTOMATE$DASHBOARD_CATEGORY_WORKFLOWS_DESCRIPTION"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("automations-workflows-create")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("AUTOMATIONS$SEARCH_PLACEHOLDER"),
    ).toBeInTheDocument();
  });

  it("shows the workflows empty state when no workflow automations exist", () => {
    mockUseAutomations.mockReturnValue({
      data: {
        automations: MOCK_AUTOMATIONS_RESPONSE.automations.filter(
          (automation) => getAutomationKind(automation) !== "workflow",
        ),
        total: 5,
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWorkflowsPage();

    expect(screen.getByTestId("automations-workflows-empty")).toBeInTheDocument();
    expect(screen.getByText("AUTOMATE$WORKFLOWS_EMPTY_TITLE")).toBeInTheDocument();
    expect(
      screen.getByText("AUTOMATE$WORKFLOWS_EMPTY_DESCRIPTION"),
    ).toBeInTheDocument();
  });

  it("lists only workflow automations when workflows exist", () => {
    renderWorkflowsPage();

    expect(screen.getByText("PR Review on Open")).toBeInTheDocument();
    expect(screen.getByText("Release Notes Generator")).toBeInTheDocument();
    expect(screen.queryByText("PR Triage Digest")).not.toBeInTheDocument();
  });

  it("opens the create wizard from the header create button", async () => {
    const user = userEvent.setup();
    renderWorkflowsPage();

    await user.click(screen.getByTestId("automations-workflows-create"));

    expect(
      await screen.findByTestId("create-automation-wizard-modal"),
    ).toBeInTheDocument();
  });
});
