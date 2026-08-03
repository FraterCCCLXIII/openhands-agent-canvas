import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecommendedAutomationsRail } from "#/components/features/home/featured-automations/recommended-automations-rail";
import { PinnedAutomationsDashboard } from "#/components/features/home/featured-automations/pinned-automations-dashboard";
import { usePinnedAutomationsStore } from "#/stores/pinned-automations-store";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("#/contexts/active-backend-context", () => ({
  useActiveBackend: () => ({
    backend: {
      id: "default-local",
      name: "Local",
      host: "http://localhost",
      apiKey: "test",
      kind: "local",
    },
    orgId: null,
  }),
}));

vi.mock("#/components/shared/navigation-link", () => ({
  NavigationLink: ({
    children,
    to,
    ...rest
  }: {
    children: React.ReactNode;
    to: string;
    [key: string]: unknown;
  }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("#/components/features/automations/kebab-menu", () => ({
  KebabMenu: ({
    items,
  }: {
    items: { label: string; onClick: () => void }[];
  }) => (
    <div>
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          data-testid={`stub-kebab-${item.label}`}
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  ),
}));

describe("recommended automations pin flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    usePinnedAutomationsStore.setState({ pinsByBackendId: {} });
  });

  it("pins a recommended card into the dashboard and unpins it", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <>
        <PinnedAutomationsDashboard />
        <RecommendedAutomationsRail />
      </>,
    );

    expect(
      screen.queryByTestId("pinned-automations-dashboard"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getAllByTestId("stub-kebab-FEATURED_AUTOMATIONS$PIN")[0],
    );

    rerender(
      <>
        <PinnedAutomationsDashboard />
        <RecommendedAutomationsRail />
      </>,
    );

    expect(
      screen.getByTestId("pinned-automations-dashboard"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("pinned-automation-module-github-pr-reviewer"),
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByTestId("stub-kebab-FEATURED_AUTOMATIONS$UNPIN")[0],
    );

    rerender(
      <>
        <PinnedAutomationsDashboard />
        <RecommendedAutomationsRail />
      </>,
    );

    expect(
      screen.queryByTestId("pinned-automations-dashboard"),
    ).not.toBeInTheDocument();
  });
});
