import type { ComponentProps } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CodeReviewIssueList } from "#/components/features/code-review/code-review-issue-list";
import { CodeReviewLayout } from "#/components/features/code-review/code-review-layout";
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

function renderList(props?: ComponentProps<typeof CodeReviewIssueList>) {
  return render(
    <NavigationProvider
      value={{
        currentPath: "/code-review/issues",
        conversationId: null,
        navigate: vi.fn(),
        isNavigating: false,
      }}
    >
      <div className="h-[800px]">
        <CodeReviewLayout hideTabs>
          <CodeReviewIssueList {...props} />
        </CodeReviewLayout>
      </div>
    </NavigationProvider>,
  );
}

describe("CodeReviewIssueList", () => {
  it("renders mock issues with triage actions", () => {
    renderList();

    expect(screen.getByTestId("code-review-issue-list")).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-issue-row-issue-1691"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-triage-issue-issue-1691"),
    ).toBeInTheDocument();
  });

  it("filters issues by search query", async () => {
    const user = userEvent.setup();
    renderList();

    await user.type(
      screen.getByTestId("code-review-issue-search-input"),
      "binary",
    );

    expect(
      screen.getByTestId("code-review-issue-row-issue-1420"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("code-review-issue-row-issue-1691"),
    ).not.toBeInTheDocument();
  });

  it("filters issues by connected repo", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(
      within(screen.getByTestId("code-review-issue-repo-filter")).getByRole(
        "combobox",
      ),
    );
    await user.click(
      screen.getByRole("option", { name: "openhands/extensions" }),
    );

    expect(
      screen.getByTestId("code-review-issue-row-issue-88"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("code-review-issue-row-issue-1691"),
    ).not.toBeInTheDocument();
  });

  it("opens a right drawer with host issue summary when an issue row is clicked", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByTestId("code-review-issue-row-issue-1691"));

    expect(screen.getByTestId("code-review-issue-drawer")).toBeInTheDocument();
    expect(screen.getByTestId("code-review-issue-detail")).toBeInTheDocument();
    expect(
      screen.getByTestId("code-review-issue-host-summary"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("code-review-issue-author")).toHaveTextContent(
      "DevinVinson",
    );
    expect(screen.getByTestId("code-review-issue-labels")).toHaveTextContent(
      "enhancement",
    );
    expect(screen.getByTestId("code-review-issue-assignees")).toHaveTextContent(
      "paulbloch",
    );
    expect(
      screen.getByTestId("code-review-issue-description"),
    ).toHaveTextContent("Review workflows are scattered");
    expect(screen.getByTestId("code-review-issue-linked-pr")).toHaveTextContent(
      "#1651",
    );
    expect(screen.getByTestId("code-review-issue-list")).toBeInTheDocument();
  });
});
