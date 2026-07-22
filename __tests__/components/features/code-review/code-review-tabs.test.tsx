import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CodeReviewTabs } from "#/components/features/code-review/code-review-tabs";
import { CODE_REVIEW_PATHS } from "#/components/features/code-review/code-review-paths";
import { NavigationProvider } from "#/context/navigation-context";
import translations from "#/i18n/translation.json";

vi.mock("react-i18next", async () => {
  const actual = await vi.importActual("react-i18next");
  return {
    ...(actual as object),
    useTranslation: () => ({
      t: (key: string) => {
        const entry = (translations as Record<string, Record<string, string>>)[
          key
        ];
        return entry?.en ?? key;
      },
      i18n: { language: "en", exists: () => true },
    }),
  };
});

describe("CodeReviewTabs", () => {
  it("links to Pull Requests and Issues only", () => {
    render(
      <NavigationProvider
        value={{
          currentPath: CODE_REVIEW_PATHS.pullRequests,
          conversationId: null,
          navigate: vi.fn(),
          isNavigating: false,
        }}
      >
        <CodeReviewTabs />
      </NavigationProvider>,
    );

    expect(screen.getByTestId("code-review-tab-pull-requests")).toHaveAttribute(
      "href",
      CODE_REVIEW_PATHS.pullRequests,
    );
    expect(screen.getByTestId("code-review-tab-issues")).toHaveAttribute(
      "href",
      CODE_REVIEW_PATHS.issues,
    );
    expect(screen.getByTestId("code-review-tab-issues")).toHaveTextContent(
      "Issues",
    );
    expect(
      screen.getByTestId("code-review-tab-count-pull-requests"),
    ).toHaveTextContent("4");
    expect(
      screen.getByTestId("code-review-tab-count-issues"),
    ).toHaveTextContent("5");
    expect(
      screen.queryByTestId("code-review-tab-hooks"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("code-review-tab-code-style"),
    ).not.toBeInTheDocument();
  });
});
