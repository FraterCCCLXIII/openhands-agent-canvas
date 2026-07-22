import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SyntheticEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { SearchInput } from "#/components/features/automations/search-input";
import { I18nKey } from "#/i18n/declaration";
import { Dropdown } from "#/ui/dropdown/dropdown";
import type { DropdownOption } from "#/ui/dropdown/types";
import {
  dropdownFooterActionClassName,
  dropdownMenuListClassName,
} from "#/utils/dropdown-classes";
import { cn } from "#/utils/utils";
import {
  CODE_REVIEW_MOCK_ISSUES,
  CODE_REVIEW_MOCK_REPOS,
} from "./code-review-mock-data";
import { useCodeReviewDrawer } from "./code-review-drawer-context";
import { CodeReviewIssueDetail } from "./code-review-issue-detail";
import { CodeReviewIssueRowView } from "./code-review-issue-row";
import type { CodeReviewIssueRow, CodeReviewPrRole } from "./code-review-types";

type RoleFilter = "all" | CodeReviewPrRole;
type RepoFilter = "all" | string;

const ROLE_FILTERS: { id: RoleFilter; labelKey: I18nKey }[] = [
  { id: "all", labelKey: I18nKey.CODE_REVIEW$FILTER_ALL },
  { id: "author", labelKey: I18nKey.CODE_REVIEW$FILTER_AUTHORED },
  { id: "assignee", labelKey: I18nKey.CODE_REVIEW$FILTER_ASSIGNED },
  { id: "reviewer", labelKey: I18nKey.CODE_REVIEW$FILTER_REVIEW_REQUESTED },
];

const REPO_FILTER_ALL = "all";

export type CodeReviewIssueListProps = {
  issues?: CodeReviewIssueRow[];
};

export function CodeReviewIssueList({
  issues = CODE_REVIEW_MOCK_ISSUES,
}: CodeReviewIssueListProps) {
  const { t } = useTranslation("openhands");
  const { openDrawer, closeDrawer } = useCodeReviewDrawer();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [repoFilter, setRepoFilter] = useState<RepoFilter>(REPO_FILTER_ALL);

  useEffect(() => () => closeDrawer(), [closeDrawer]);

  const selectedRepoLabel = useMemo(() => {
    if (repoFilter === REPO_FILTER_ALL) return null;
    return (
      CODE_REVIEW_MOCK_REPOS.find((repo) => repo.id === repoFilter)?.label ??
      null
    );
  }, [repoFilter]);

  const visibleIssues = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let next = issues;
    if (selectedRepoLabel) {
      next = next.filter((issue) => issue.repo === selectedRepoLabel);
    }
    if (roleFilter !== "all") {
      next = next.filter((issue) => issue.role === roleFilter);
    }
    if (normalizedQuery) {
      next = next.filter((issue) => {
        const haystack =
          `${issue.title} ${issue.repo} #${issue.number}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }
    return next;
  }, [issues, roleFilter, searchQuery, selectedRepoLabel]);

  const roleFilterOptions: DropdownOption[] = ROLE_FILTERS.map((filter) => ({
    value: filter.id,
    label: t(filter.labelKey),
  }));
  const selectedRoleOption =
    roleFilterOptions.find((option) => option.value === roleFilter) ??
    roleFilterOptions[0]!;

  const repoFilterOptions: DropdownOption[] = [
    {
      value: REPO_FILTER_ALL,
      label: t(I18nKey.CODE_REVIEW$FILTER_ALL),
    },
    ...CODE_REVIEW_MOCK_REPOS.filter((repo) => !repo.errored).map((repo) => ({
      value: repo.id,
      label: repo.label,
    })),
  ];
  const selectedRepoOption =
    repoFilterOptions.find((option) => option.value === repoFilter) ??
    repoFilterOptions[0]!;

  const preventDropdownMenuClose = useCallback((event: SyntheticEvent) => {
    event.preventDefault();
  }, []);

  const openIssueDrawer = useCallback(
    (issue: CodeReviewIssueRow) => {
      openDrawer({
        title: `#${issue.number} ${issue.title}`,
        subtitle: issue.repo,
        testId: "code-review-issue-drawer",
        body: (
          <CodeReviewIssueDetail
            issue={issue}
            onTriage={() => {
              /* UI-first: action affordance only until skill launch wiring */
            }}
          />
        ),
      });
    },
    [openDrawer],
  );

  const connectRepoFooter = (
    <div className={dropdownMenuListClassName}>
      <button
        type="button"
        data-testid="code-review-connect-repo-chip"
        onMouseDown={preventDropdownMenuClose}
        onTouchStart={preventDropdownMenuClose}
        className={cn(
          dropdownFooterActionClassName,
          "cursor-pointer rounded-md text-[var(--oh-accent)]",
        )}
      >
        {t(I18nKey.CODE_REVIEW$CONNECT_REPO_CHIP)}
      </button>
    </div>
  );

  return (
    <div data-testid="code-review-issue-list">
      <div
        data-testid="code-review-issue-toolbar"
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t(I18nKey.CODE_REVIEW$SEARCH_ISSUES_PLACEHOLDER)}
          testId="code-review-issue-search-input"
        />
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-[var(--oh-muted)]">
            {t(I18nKey.CODE_REVIEW$CONNECTED_LABEL)}
          </span>
          <Dropdown
            key={selectedRepoOption.value}
            testId="code-review-issue-repo-filter"
            fitContent
            italicPlaceholder={false}
            options={repoFilterOptions}
            defaultValue={selectedRepoOption}
            placeholder={selectedRepoOption.label}
            footer={connectRepoFooter}
            onChange={(item) => {
              if (!item) return;
              setRepoFilter(item.value as RepoFilter);
            }}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-[var(--oh-muted)]">
            {t(I18nKey.CODE_REVIEW$SHOW_LABEL)}
          </span>
          <Dropdown
            key={selectedRoleOption.value}
            testId="code-review-issue-role-filter"
            fitContent
            italicPlaceholder={false}
            options={roleFilterOptions}
            defaultValue={selectedRoleOption}
            placeholder={selectedRoleOption.label}
            onChange={(item) => {
              if (!item) return;
              setRoleFilter(item.value as RoleFilter);
            }}
          />
        </div>
      </div>

      <div className="mb-2.5 flex items-baseline justify-between">
        <h2 className="text-xs font-semibold text-[var(--oh-muted)]">
          {t(I18nKey.CODE_REVIEW$OPEN_ISSUES)}
        </h2>
        <span className="text-xs text-[var(--oh-muted)]">
          {t(I18nKey.CODE_REVIEW$ISSUES_COUNT, {
            open: visibleIssues.length,
          })}
        </span>
      </div>

      <ul className="divide-y divide-[var(--oh-border-subtle)] overflow-hidden rounded-lg border border-[var(--oh-border)] bg-[var(--oh-surface)]">
        {visibleIssues.map((issue) => (
          <CodeReviewIssueRowView
            key={issue.id}
            issue={issue}
            onSelect={() => openIssueDrawer(issue)}
            onTriage={() => openIssueDrawer(issue)}
          />
        ))}
      </ul>
    </div>
  );
}
