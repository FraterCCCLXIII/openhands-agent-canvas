import type { ComponentProps } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeReviewLayout } from "#/components/features/code-review/code-review-layout";
import { CodeReviewPrList } from "#/components/features/code-review/code-review-pr-list";
import { NavigationProvider } from "#/context/navigation-context";
import translations from "#/i18n/translation.json";

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...(actual as object),
    useTranslation: () => ({
      t: (key: string, opts?: Record<string, string | number>) => {
        const entry = (translations as Record<string, Record<string, string>>)[
          key
        ];
        let value = entry?.en ?? key;
        if (opts) {
          for (const [k, v] of Object.entries(opts)) {
            value = value.replaceAll(`{{${k}}}`, String(v));
          }
        }
        return value;
      },
      i18n: { language: "en", exists: () => true },
    }),
  };
});

function renderList(props?: ComponentProps<typeof CodeReviewPrList>) {
  return render(
    <NavigationProvider
      value={{
        currentPath: "/code-review/pull-requests",
        conversationId: null,
        navigate: vi.fn(),
        isNavigating: false,
      }}
    >
      <div className="h-[800px]">
        <CodeReviewLayout hideTabs>
          <CodeReviewPrList {...props} />
        </CodeReviewLayout>
      </div>
    </NavigationProvider>,
  );
}

describe("CodeReviewPrList", () => {
  it("renders mock pull requests with review actions", () => {
    renderList();

    expect(screen.getByTestId("code-review-pr-list")).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-pr-row-pr-1651"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-review-pr-1651"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("code-review-summarize-pr-1651"),
    ).not.toBeInTheDocument();
  });

  it("filters the list by review-requested role via the Show dropdown", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(
      within(screen.getByTestId("code-review-role-filter")).getByRole(
        "combobox",
      ),
    );
    await user.click(screen.getByRole("option", { name: "Review requested" }));

    expect(
      screen.getByTestId("code-review-pr-row-pr-1651"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("code-review-pr-row-pr-2102"),
    ).not.toBeInTheDocument();
  });

  it("filters the list by connected repo via the Connected dropdown", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(
      within(screen.getByTestId("code-review-repo-filter")).getByRole(
        "combobox",
      ),
    );
    await user.click(
      screen.getByRole("option", { name: "openhands/extensions" }),
    );

    expect(
      screen.getByTestId("code-review-pr-row-pr-2102"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-pr-row-pr-106"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("code-review-pr-row-pr-1651"),
    ).not.toBeInTheDocument();
  });

  it("filters the list by search query on the toolbar", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(
      screen.getByTestId("code-review-search-input"),
      "marketplace",
    );

    expect(
      screen.getByTestId("code-review-pr-row-pr-2102"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("code-review-pr-row-pr-1651"),
    ).not.toBeInTheDocument();
  });

  it("keeps connect-repo in the Connected dropdown footer", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(
      within(screen.getByTestId("code-review-repo-filter")).getByRole(
        "combobox",
      ),
    );

    expect(
      screen.getByTestId("code-review-connect-repo-chip"),
    ).toBeInTheDocument();
  });

  it("opens a right drawer with host PR summary, Review dropdown, and sample output", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByTestId("code-review-pr-row-pr-1651"));

    expect(screen.getByTestId("code-review-pr-drawer")).toBeInTheDocument();
    expect(screen.getByTestId("code-review-review-panel")).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-review-pr-1651-drawer"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("code-review-open-github-pr-1651")).toHaveAttribute(
      "href",
      "https://github.com/openhands/agent-canvas/pull/1651",
    );
    expect(
      screen.queryByTestId("code-review-flavor-chooser"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-pr-host-summary"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("code-review-pr-author")).toHaveTextContent(
      "DevinVinson",
    );
    expect(screen.getByTestId("code-review-pr-branch")).toHaveTextContent(
      "feat/commits-view-diffs",
    );
    expect(screen.getByTestId("code-review-pr-branch")).toHaveTextContent(
      "main",
    );
    expect(screen.getByTestId("code-review-pr-branch")).toHaveTextContent(
      "+412",
    );
    expect(screen.getByTestId("code-review-pr-checks")).toHaveTextContent(
      "Checks pending",
    );
    expect(
      screen.getByTestId("code-review-pr-description"),
    ).toHaveTextContent("per-commit diff viewer");
    expect(
      within(screen.getByTestId("code-review-review-output")).getByText(
        /route\("files"\)/,
      ),
    ).toBeInTheDocument();
    // List stays mounted under the drawer.
    expect(screen.getByTestId("code-review-pr-list")).toBeInTheDocument();
  });

  it("opens a review-flavor dropdown from the list Review button", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByTestId("code-review-review-pr-1651"));

    expect(
      screen.getByTestId("code-review-review-menu-pr-1651"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-review-option-pr-1651-static"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-review-option-pr-1651-runtime"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-review-option-pr-1651-quality"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-review-option-pr-1651-critic"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("code-review-pr-drawer"),
    ).not.toBeInTheDocument();
  });

  it("opens the drawer with the selected review flavor from the list menu", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByTestId("code-review-review-pr-1651"));
    await user.click(
      screen.getByTestId("code-review-review-option-pr-1651-quality"),
    );

    expect(screen.getByTestId("code-review-pr-drawer")).toBeInTheDocument();
    expect(screen.getByTestId("code-review-review-output")).toHaveAttribute(
      "data-flavor",
      "quality",
    );
    expect(
      screen.queryByTestId("code-review-flavor-status"),
    ).not.toBeInTheDocument();
  });

  it("keeps sample output visible after switching flavors in the drawer", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByTestId("code-review-pr-row-pr-1651"));
    await user.click(screen.getByTestId("code-review-review-pr-1651-drawer"));
    await user.click(
      screen.getByTestId("code-review-review-option-pr-1651-drawer-quality"),
    );

    expect(screen.getByTestId("code-review-review-output")).toHaveAttribute(
      "data-flavor",
      "quality",
    );
    expect(
      within(screen.getByTestId("code-review-review-output")).getByText(
        /route\("files"\)/,
      ),
    ).toBeInTheDocument();
  });

  it("shows the empty-repos degrade state when nothing is connected", () => {
    renderList({ hasConnectedRepos: false });

    expect(screen.getByTestId("code-review-empty-repos")).toBeInTheDocument();
    expect(screen.getByTestId("code-review-connect-repo")).toBeInTheDocument();
    expect(
      screen.queryByTestId("code-review-pr-list"),
    ).not.toBeInTheDocument();
  });
});
