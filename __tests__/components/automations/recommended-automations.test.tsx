import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SettingsService from "#/api/settings-service/settings-service.api";
import McpService from "#/api/mcp-service/mcp-service.api";
import { getConversationState } from "#/utils/conversation-local-storage";
import {
  __resetActiveStoreForTests,
  setActiveSelection,
  setRegisteredBackends,
} from "#/api/backend-registry/active-store";
import { ActiveBackendProvider } from "#/contexts/active-backend-context";
import type { Backend } from "#/api/backend-registry/types";
import {
  RecommendedAutomationsLauncher,
  buildAutomationPrompt,
  type RecommendedAutomationSourceSelection,
} from "#/components/features/automations/recommended-automations-launcher";
import {
  RecommendedAutomationsSection,
  HOME_RECOMMENDED_AUTOMATIONS_PREVIEW_LIMIT,
  getAutomationsByPopularity,
} from "#/components/features/automations/recommended-automations-section";
import {
  AUTOMATION_CATALOG,
  type RecommendedAutomation,
} from "@openhands/extensions/automations";

const { mockCreateConversationMutate, mockUseSettings } = vi.hoisted(() => ({
  mockCreateConversationMutate: vi.fn(),
  mockUseSettings: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, unknown>) => {
      if (vars?.name) return `${key}:${String(vars.name)}`;
      if (vars?.count != null) return `${key}:${String(vars.count)}`;
      return key;
    },
  }),
}));

vi.mock("#/hooks/mutation/use-create-conversation", () => ({
  useCreateConversation: () => ({
    mutate: mockCreateConversationMutate,
    isPending: false,
  }),
}));

vi.mock("#/hooks/query/use-settings", () => ({
  useSettings: () => mockUseSettings(),
}));

const localBackend: Backend = {
  id: "local-backend",
  name: "Local",
  host: "http://localhost:8000",
  apiKey: "",
  kind: "local",
};

const cloudBackend: Backend = {
  id: "cloud-backend",
  name: "Cloud",
  host: "https://staging.all-hands.dev/",
  apiKey: "cloud-token",
  kind: "cloud",
};

function renderLauncher({
  withBackendProvider = false,
  variant = "default",
  sourceSelection,
}: {
  withBackendProvider?: boolean;
  variant?: "default" | "home";
  sourceSelection?: RecommendedAutomationSourceSelection;
} = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const launcher = (
    <RecommendedAutomationsLauncher
      variant={variant}
      sourceSelection={sourceSelection}
    />
  );

  return render(
    <QueryClientProvider client={queryClient}>
      {withBackendProvider ? (
        <ActiveBackendProvider>{launcher}</ActiveBackendProvider>
      ) : (
        launcher
      )}
    </QueryClientProvider>,
  );
}

function settingsWithMcpConfig(mcp_config: unknown) {
  return {
    agent_settings: {
      mcp_config,
    },
  };
}

function settingsWithGithubMcp() {
  return settingsWithMcpConfig({
    mcpServers: {
      github: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: "github-token" },
      },
    },
  });
}

describe("recommended automations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    __resetActiveStoreForTests();
    setRegisteredBackends([localBackend]);
    setActiveSelection({ backendId: localBackend.id });
    mockUseSettings.mockReturnValue({
      data: settingsWithMcpConfig({ mcpServers: {} }),
    });
    // Pre-flight connectivity test must pass so save mutations are reached.
    vi.spyOn(McpService, "testServer").mockResolvedValue({
      ok: true,
      tools: [],
    });
  });

  afterEach(() => {
    localStorage.clear();
    __resetActiveStoreForTests();
  });

  it("shows recommended automations in popularity order", () => {
    const onSelect = vi.fn();

    render(
      <RecommendedAutomationsSection
        backendKind="local"
        installedServers={[]}
        onSelect={onSelect}
      />,
    );

    const cards = screen.getAllByTestId(/^recommended-automation-card-/);
    expect(cards[0]).toHaveAttribute(
      "data-testid",
      "recommended-automation-card-github-pr-reviewer",
    );
    expect(cards[1]).toHaveAttribute(
      "data-testid",
      "recommended-automation-card-github-repo-monitor",
    );
    expect(cards[2]).toHaveAttribute(
      "data-testid",
      "recommended-automation-card-slack-standup-digest",
    );
    expect(cards[3]).toHaveAttribute(
      "data-testid",
      "recommended-automation-card-slack-channel-monitor",
    );
  });

  it("sorts recommendation popularity deterministically when ranks are missing or tied", () => {
    const makeAutomation = (
      id: string,
      popularityRank?: number,
    ): RecommendedAutomation =>
      ({
        ...AUTOMATION_CATALOG[0],
        id,
        popularityRank,
      }) as RecommendedAutomation;

    expect(
      getAutomationsByPopularity([
        makeAutomation("missing-first"),
        makeAutomation("tie-a", 10),
        makeAutomation("top", 20),
        makeAutomation("tie-b", 10),
        makeAutomation("missing-second"),
      ]).map((automation) => automation.id),
    ).toEqual(["top", "tie-a", "tie-b", "missing-first", "missing-second"]);
  });

  it("filters recommendations by required MCP keywords", () => {
    render(
      <RecommendedAutomationsSection
        backendKind="local"
        installedServers={[]}
        query="standup"
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("recommended-automation-card-slack-standup-digest"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("recommended-automation-card-github-pr-reviewer"),
    ).not.toBeInTheDocument();
  });

  it("shows a left-aligned MCP icon stack on each card", () => {
    render(
      <RecommendedAutomationsSection
        backendKind="local"
        installedServers={[]}
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("recommended-automation-icon-github-pr-reviewer"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("recommended-automation-icon-research-brief-writer"),
    ).toHaveAttribute("data-layout", "overlap");
    expect(
      screen.getByTestId(
        "recommended-automation-icon-incident-retrospective-drafter",
      ),
    ).toHaveAttribute("data-layout", "quadrants");
  });

  it("renders missing MCP connect copy as a pill on the same row", () => {
    const offsetWidthDescriptor = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "offsetWidth",
    );
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
      configurable: true,
      get() {
        return 120;
      },
    });
    Object.defineProperty(HTMLElement.prototype, "clientWidth", {
      configurable: true,
      get() {
        return 2000;
      },
    });
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}

        unobserve() {}

        disconnect() {}
      },
    );

    try {
      render(
        <RecommendedAutomationsSection
          backendKind="local"
          installedServers={[]}
          onSelect={vi.fn()}
        />,
      );

      const pillRow = screen.getByTestId(
        "recommended-automation-pills-research-brief-writer",
      );
      expect(pillRow).toHaveTextContent(
        "RECOMMENDED_AUTOMATIONS$MISSING_CONNECT:2",
      );
      expect(pillRow).toHaveClass("flex-nowrap");
      expect(pillRow).not.toHaveClass("flex-wrap");
    } finally {
      if (offsetWidthDescriptor) {
        Object.defineProperty(
          HTMLElement.prototype,
          "offsetWidth",
          offsetWidthDescriptor,
        );
      } else {
        Reflect.deleteProperty(HTMLElement.prototype, "offsetWidth");
      }
      Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
      vi.unstubAllGlobals();
    }
  });

  it("shows a decorative plus badge on each card without toggle behavior", () => {
    render(
      <RecommendedAutomationsSection
        backendKind="local"
        installedServers={[]}
        onSelect={vi.fn()}
      />,
    );

    const plusBadge = screen.getByTestId(
      "recommended-automation-plus-github-pr-reviewer",
    );
    expect(plusBadge.tagName).toBe("SPAN");
    expect(plusBadge).toHaveAttribute("aria-hidden", "true");
    expect(plusBadge.className).toContain("hover:bg-[var(--oh-interactive-hover)]");
    expect(
      plusBadge.querySelector('[role="switch"]'),
    ).not.toBeInTheDocument();
  });

  it("hides section header, plus badge, and setup duration in home variant", () => {
    render(
      <RecommendedAutomationsSection
        backendKind="local"
        installedServers={[]}
        onSelect={vi.fn()}
        variant="home"
      />,
    );

    expect(
      screen.queryByText("RECOMMENDED_AUTOMATIONS$SECTION_TITLE"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("recommended-automation-plus-github-pr-reviewer"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId("recommended-automation-card-github-pr-reviewer")
        .className,
    ).toContain("bg-surface-raised");

    const pillRow = screen.getByTestId(
      "recommended-automation-pills-github-pr-reviewer",
    );
    expect(pillRow).not.toHaveTextContent("RECOMMENDED_AUTOMATIONS$MINUTES:");
  });

  it("limits the home preview to four cards with a view-more control", () => {
    const onViewMore = vi.fn();

    render(
      <RecommendedAutomationsSection
        backendKind="local"
        installedServers={[]}
        onSelect={vi.fn()}
        variant="home"
        limit={HOME_RECOMMENDED_AUTOMATIONS_PREVIEW_LIMIT}
        onViewMore={onViewMore}
      />,
    );

    expect(
      screen.getByTestId("recommended-automations-home-strip"),
    ).toHaveClass("w-full");
    expect(
      screen.getByTestId("recommended-automation-card-github-pr-reviewer"),
    ).toHaveClass("flex-1");
    expect(
      screen.getByTestId("recommended-automations-home-label"),
    ).toHaveTextContent("RECOMMENDED_AUTOMATIONS$SECTION_LABEL");
    expect(screen.getAllByTestId(/^recommended-automation-card-/)).toHaveLength(
      HOME_RECOMMENDED_AUTOMATIONS_PREVIEW_LIMIT,
    );
    expect(
      screen.queryByTestId("recommended-automation-pills-github-pr-reviewer"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("recommended-automations-view-more"));
    expect(onViewMore).toHaveBeenCalledTimes(1);
  });

  it("hides recommended automations when the app setting is disabled", () => {
    mockUseSettings.mockReturnValue({
      data: {
        ...settingsWithGithubMcp(),
        enable_automation_recommendations: false,
      },
    });

    renderLauncher({ variant: "home" });

    expect(
      screen.queryByTestId("recommended-automations-section"),
    ).not.toBeInTheDocument();
  });

  it("opens a modal with the full recommended automation list from home", () => {
    renderLauncher({ variant: "home" });

    expect(screen.getAllByTestId(/^recommended-automation-card-/)).toHaveLength(
      HOME_RECOMMENDED_AUTOMATIONS_PREVIEW_LIMIT,
    );
    expect(
      screen.queryByTestId("recommended-automations-modal"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("recommended-automations-view-more"));

    const modal = screen.getByTestId("recommended-automations-modal");
    expect(modal).toBeInTheDocument();
    expect(
      within(modal).getAllByTestId(/^recommended-automation-card-/),
    ).toHaveLength(7);
  });

  it("filters recommended automations in the view-more modal", () => {
    renderLauncher({ variant: "home" });

    fireEvent.click(screen.getByTestId("recommended-automations-view-more"));

    const modal = screen.getByTestId("recommended-automations-modal");
    fireEvent.change(
      screen.getByRole("textbox", {
        name: "AUTOMATIONS$SEARCH_PLACEHOLDER",
      }),
      { target: { value: "standup" } },
    );

    expect(
      within(modal).getByTestId(
        "recommended-automation-card-slack-standup-digest",
      ),
    ).toBeInTheDocument();
    expect(
      within(modal).queryByTestId("recommended-automation-card-github-pr-reviewer"),
    ).not.toBeInTheDocument();
  });

  it("selects a recommendation directly from its card", () => {
    const automation = AUTOMATION_CATALOG.find(
      (item) => item.id === "github-pr-reviewer",
    )!;
    const onSelect = vi.fn();

    render(
      <RecommendedAutomationsSection
        backendKind="local"
        installedServers={[]}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(
      screen.getByTestId("recommended-automation-card-github-pr-reviewer"),
    );
    expect(onSelect).toHaveBeenCalledWith(automation);
  });

  it("opens the MCP install modal instead of launching when the required MCP is missing", async () => {
    renderLauncher();

    fireEvent.click(
      screen.getByTestId("recommended-automation-card-github-pr-reviewer"),
    );

    const modal = await screen.findByTestId("mcp-install-modal");
    expect(modal).toHaveAttribute("data-marketplace-id", "github");
    expect(
      screen.getByTestId("mcp-install-field-GITHUB_PERSONAL_ACCESS_TOKEN"),
    ).toBeInTheDocument();
    expect(mockCreateConversationMutate).not.toHaveBeenCalled();
  });

  it("launches directly with local automation API instructions when the required MCP is already installed", () => {
    mockUseSettings.mockReturnValue({
      data: settingsWithGithubMcp(),
    });

    renderLauncher();

    fireEvent.click(
      screen.getByTestId("recommended-automation-card-github-pr-reviewer"),
    );

    expect(mockCreateConversationMutate).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("mcp-install-modal")).not.toBeInTheDocument();

    const [, options] = mockCreateConversationMutate.mock.calls[0];
    options.onSuccess({ conversation_id: "conversation-1" });

    const draft = getConversationState("conversation-1").draftMessage;
    expect(draft).toContain("local");
    expect(draft).toContain("$OPENHANDS_AUTOMATION_API_KEY");
    expect(draft).not.toContain("app.all-hands.dev");
    expect(draft).not.toContain("$OPENHANDS_API_KEY");
  });

  it("requires workspace or repository selection before launching from home", () => {
    mockUseSettings.mockReturnValue({
      data: settingsWithGithubMcp(),
    });
    const onRequireSelection = vi.fn();
    const automation = AUTOMATION_CATALOG.find(
      (item) => item.id === "github-pr-reviewer",
    )!;

    renderLauncher({
      variant: "home",
      sourceSelection: {
        hasSelection: false,
        launchWithoutSource: false,
        pendingAutomation: null,
        onRequireSelection,
        onPendingAutomationHandled: vi.fn(),
        getConversationVariables: () => ({}),
      },
    });

    fireEvent.click(
      screen.getByTestId("recommended-automation-card-github-pr-reviewer"),
    );

    expect(onRequireSelection).toHaveBeenCalledWith(automation);
    expect(mockCreateConversationMutate).not.toHaveBeenCalled();
  });

  it("launches with selected workspace after source selection completes", async () => {
    mockUseSettings.mockReturnValue({
      data: settingsWithGithubMcp(),
    });
    const onPendingAutomationHandled = vi.fn();
    const getConversationVariables = vi.fn(() => ({
      workingDir: "/workspace/project/app",
    }));
    const automation = AUTOMATION_CATALOG.find(
      (item) => item.id === "github-pr-reviewer",
    )!;

    const { rerender } = renderLauncher({
      variant: "home",
      sourceSelection: {
        hasSelection: false,
        launchWithoutSource: false,
        pendingAutomation: null,
        onRequireSelection: vi.fn(),
        onPendingAutomationHandled,
        getConversationVariables,
      },
    });

    fireEvent.click(
      screen.getByTestId("recommended-automation-card-github-pr-reviewer"),
    );
    expect(mockCreateConversationMutate).not.toHaveBeenCalled();

    rerender(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: {
              queries: { retry: false },
              mutations: { retry: false },
            },
          })
        }
      >
        <RecommendedAutomationsLauncher
          variant="home"
          sourceSelection={{
            hasSelection: true,
            launchWithoutSource: false,
            pendingAutomation: automation,
            onRequireSelection: vi.fn(),
            onPendingAutomationHandled,
            getConversationVariables,
          }}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(mockCreateConversationMutate).toHaveBeenCalledWith(
        { workingDir: "/workspace/project/app" },
        expect.any(Object),
      ),
    );
    expect(onPendingAutomationHandled).toHaveBeenCalledTimes(1);
  });

  it("launches without workspace when source selection is skipped", async () => {
    mockUseSettings.mockReturnValue({
      data: settingsWithGithubMcp(),
    });
    const onPendingAutomationHandled = vi.fn();
    const getConversationVariables = vi.fn(() => ({}));
    const automation = AUTOMATION_CATALOG.find(
      (item) => item.id === "github-pr-reviewer",
    )!;

    const { rerender } = renderLauncher({
      variant: "home",
      sourceSelection: {
        hasSelection: false,
        launchWithoutSource: false,
        pendingAutomation: null,
        onRequireSelection: vi.fn(),
        onPendingAutomationHandled,
        getConversationVariables,
      },
    });

    fireEvent.click(
      screen.getByTestId("recommended-automation-card-github-pr-reviewer"),
    );
    expect(mockCreateConversationMutate).not.toHaveBeenCalled();

    rerender(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: {
              queries: { retry: false },
              mutations: { retry: false },
            },
          })
        }
      >
        <RecommendedAutomationsLauncher
          variant="home"
          sourceSelection={{
            hasSelection: false,
            launchWithoutSource: true,
            pendingAutomation: automation,
            onRequireSelection: vi.fn(),
            onPendingAutomationHandled,
            getConversationVariables,
          }}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(mockCreateConversationMutate).toHaveBeenCalledWith(
        {},
        expect.any(Object),
      ),
    );
    expect(onPendingAutomationHandled).toHaveBeenCalledTimes(1);
  });

  it("ignores repeated card clicks while a recommendation launch is in flight", () => {
    mockUseSettings.mockReturnValue({
      data: settingsWithGithubMcp(),
    });

    renderLauncher();

    const card = screen.getByTestId(
      "recommended-automation-card-github-pr-reviewer",
    );
    fireEvent.click(card);
    fireEvent.click(card);

    expect(mockCreateConversationMutate).toHaveBeenCalledTimes(1);
  });

  it("hides the recommended automations section on cloud backends", () => {
    setRegisteredBackends([cloudBackend]);
    setActiveSelection({ backendId: cloudBackend.id });

    renderLauncher({ withBackendProvider: true });

    expect(
      screen.queryByTestId("recommended-automations-section"),
    ).not.toBeInTheDocument();
  });

  it("launches the recommendation after the missing MCP is installed", async () => {
    const saveSpy = vi
      .spyOn(SettingsService, "saveSettings")
      .mockResolvedValue(true);

    renderLauncher();

    fireEvent.click(
      screen.getByTestId("recommended-automation-card-github-pr-reviewer"),
    );
    await screen.findByTestId("mcp-install-modal");

    fireEvent.change(
      screen.getByTestId("mcp-install-field-GITHUB_PERSONAL_ACCESS_TOKEN"),
      {
        target: { value: "github-token" },
      },
    );
    fireEvent.click(screen.getByTestId("mcp-install-submit"));

    await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockCreateConversationMutate).toHaveBeenCalledTimes(1),
    );
  });
});

describe("buildAutomationPrompt", () => {
  const basePrompt = "Create an automation that does something useful.";

  it("appends local API instructions for local backends without cloud endpoints", () => {
    const result = buildAutomationPrompt(basePrompt, "local");
    expect(result).toContain(basePrompt);
    expect(result).toContain("local");
    expect(result).toContain("<RUNTIME_SERVICES>");
    expect(result).toContain("$OPENHANDS_AUTOMATION_API_KEY");
    expect(result).toContain("/api/automation/v1/preset/prompt");
    expect(result).not.toContain("app.all-hands.dev");
    expect(result).not.toContain("$OPENHANDS_API_KEY");
    expect(result).toContain(
      "instead of using any remote/cloud automation API",
    );
  });

  it("appends cloud API instructions for the active cloud backend", () => {
    const result = buildAutomationPrompt(
      basePrompt,
      "cloud",
      "https://staging.all-hands.dev/",
    );
    expect(result).toContain(basePrompt);
    expect(result).toContain(
      "https://staging.all-hands.dev/api/automation/v1/preset/prompt",
    );
    expect(result).not.toContain("https://staging.all-hands.dev//api");
    expect(result).not.toContain("app.all-hands.dev");
    expect(result).toContain("$OPENHANDS_API_KEY");
    expect(result).toContain("/api/automation/v1/preset/prompt");
    expect(result).not.toContain("<RUNTIME_SERVICES>");
    expect(result).not.toContain("$OPENHANDS_AUTOMATION_API_KEY");
  });

  it("keeps the original prompt text verbatim at the start", () => {
    const localResult = buildAutomationPrompt(basePrompt, "local");
    const cloudResult = buildAutomationPrompt(
      basePrompt,
      "cloud",
      "https://staging.all-hands.dev",
    );
    expect(localResult.startsWith(basePrompt)).toBe(true);
    expect(cloudResult.startsWith(basePrompt)).toBe(true);
  });
});
