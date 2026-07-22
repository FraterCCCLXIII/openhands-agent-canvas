import { useTranslation } from "react-i18next";
import { NavigationLink } from "#/components/shared/navigation-link";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import {
  CODE_REVIEW_MOCK_ISSUES,
  CODE_REVIEW_MOCK_PRS,
} from "./code-review-mock-data";
import { CODE_REVIEW_PATHS, type CodeReviewTabId } from "./code-review-paths";

const TAB_ITEMS: {
  id: CodeReviewTabId;
  to: string;
  labelKey: I18nKey;
  count: number;
}[] = [
  {
    id: "pull-requests",
    to: CODE_REVIEW_PATHS.pullRequests,
    labelKey: I18nKey.CODE_REVIEW$TAB_PULL_REQUESTS,
    count: CODE_REVIEW_MOCK_PRS.filter((pr) => !pr.connectionError).length,
  },
  {
    id: "issues",
    to: CODE_REVIEW_PATHS.issues,
    labelKey: I18nKey.CODE_REVIEW$TAB_ISSUES,
    count: CODE_REVIEW_MOCK_ISSUES.length,
  },
];

export function CodeReviewTabs() {
  const { t } = useTranslation("openhands");

  return (
    <nav
      data-testid="code-review-tabs"
      aria-label={t(I18nKey.CODE_REVIEW$TABS_LABEL)}
      className="mt-6 mb-5 flex flex-wrap gap-1"
    >
      {TAB_ITEMS.map((tab) => (
        <NavigationLink
          key={tab.id}
          to={tab.to}
          end
          data-testid={`code-review-tab-${tab.id}`}
          className={({ isActive }) =>
            cn(
              "inline-flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-normal transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-[var(--oh-muted)] hover:text-[var(--oh-foreground)]",
            )
          }
        >
          {t(tab.labelKey)}
          <span
            data-testid={`code-review-tab-count-${tab.id}`}
            className="inline-flex min-w-5 items-center justify-center rounded-full border border-[var(--oh-border)] bg-[var(--oh-surface)] px-1.5 py-0.5 text-[10px] font-medium leading-none text-[var(--oh-text-dim)] tabular-nums"
          >
            {tab.count}
          </span>
        </NavigationLink>
      ))}
    </nav>
  );
}
