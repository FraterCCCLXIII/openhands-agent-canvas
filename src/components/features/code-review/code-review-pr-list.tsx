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
  CODE_REVIEW_MOCK_PRS,
  CODE_REVIEW_MOCK_REPOS,
} from "./code-review-mock-data";
import { useCodeReviewDrawer } from "./code-review-drawer-context";
import { CodeReviewEmptyRepos } from "./code-review-empty-repos";
import { CodeReviewPrAuthorLine } from "./code-review-pr-author-line";
import { CodeReviewPrBranchLine } from "./code-review-pr-branch-line";
import { CodeReviewPrHeaderActions } from "./code-review-pr-header-actions";
import { CodeReviewPrRowView } from "./code-review-pr-row";
import { CodeReviewReviewPanel } from "./code-review-review-panel";
import type {
  CodeReviewPrRole,
  CodeReviewPrRow,
  CodeReviewReviewFlavorId,
} from "./code-review-types";

type RoleFilter = "all" | CodeReviewPrRole;
type RepoFilter = "all" | string;

const ROLE_FILTERS: { id: RoleFilter; labelKey: I18nKey }[] = [
  { id: "all", labelKey: I18nKey.CODE_REVIEW$FILTER_ALL },
  { id: "author", labelKey: I18nKey.CODE_REVIEW$FILTER_AUTHORED },
  { id: "assignee", labelKey: I18nKey.CODE_REVIEW$FILTER_ASSIGNED },
  { id: "reviewer", labelKey: I18nKey.CODE_REVIEW$FILTER_REVIEW_REQUESTED },
];

const REPO_FILTER_ALL = "all";

export type CodeReviewPrListProps = {
  /** When false, show the empty-repos degrade state (tests / future API). */
  hasConnectedRepos?: boolean;
  pullRequests?: CodeReviewPrRow[];
};

export function CodeReviewPrList({
  hasConnectedRepos = true,
  pullRequests = CODE_REVIEW_MOCK_PRS,
}: CodeReviewPrListProps) {
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

  const visiblePrs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    let next = pullRequests;
    if (selectedRepoLabel) {
      next = next.filter((pr) => pr.repo === selectedRepoLabel);
    }
    if (roleFilter !== "all") {
      next = next.filter((pr) => !pr.connectionError && pr.role === roleFilter);
    }
    if (normalizedQuery) {
      next = next.filter((pr) => {
        const haystack = `${pr.title} ${pr.repo} #${pr.number}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      });
    }
    return next;
  }, [pullRequests, roleFilter, searchQuery, selectedRepoLabel]);

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
    ...CODE_REVIEW_MOCK_REPOS.map((repo) => ({
      value: repo.id,
      label: repo.label,
      prefix: repo.errored ? (
        <span
          className="inline-block size-1.5 shrink-0 rounded-full bg-[var(--oh-status-error,#e76a5e)]"
          aria-hidden
        />
      ) : undefined,
    })),
  ];
  const selectedRepoOption =
    repoFilterOptions.find((option) => option.value === repoFilter) ??
    repoFilterOptions[0]!;

  const preventDropdownMenuClose = useCallback((event: SyntheticEvent) => {
    event.preventDefault();
  }, []);

  const openPrDrawer = useCallback(
    (pr: CodeReviewPrRow, initialFlavor?: CodeReviewReviewFlavorId) => {
      if (pr.connectionError) return;

      const showDrawer = (flavor?: CodeReviewReviewFlavorId) => {
        openDrawer({
          title: pr.number > 0 ? `#${pr.number} ${pr.title}` : pr.title,
          titleMeta: (
            <>
              <CodeReviewPrAuthorLine pullRequest={pr} />
              <p className="truncate text-xs text-muted">{pr.repo}</p>
              <CodeReviewPrBranchLine pullRequest={pr} />
            </>
          ),
          headerActions: (
            <CodeReviewPrHeaderActions
              pullRequest={pr}
              onSelectFlavor={showDrawer}
            />
          ),
          testId: "code-review-pr-drawer",
          body: (
            <CodeReviewReviewPanel pullRequest={pr} initialFlavor={flavor} />
          ),
        });
      };

      showDrawer(initialFlavor);
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

  if (!hasConnectedRepos) {
    return <CodeReviewEmptyRepos />;
  }

  return (
    <div data-testid="code-review-pr-list">
      <div
        data-testid="code-review-list-toolbar"
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t(I18nKey.CODE_REVIEW$SEARCH_PLACEHOLDER)}
          testId="code-review-search-input"
        />
        <div
          data-testid="code-review-repo-filters"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="text-xs text-[var(--oh-muted)]">
            {t(I18nKey.CODE_REVIEW$CONNECTED_LABEL)}
          </span>
          <Dropdown
            key={selectedRepoOption.value}
            testId="code-review-repo-filter"
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
        <div
          data-testid="code-review-role-filters"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="text-xs text-[var(--oh-muted)]">
            {t(I18nKey.CODE_REVIEW$SHOW_LABEL)}
          </span>
          <Dropdown
            key={selectedRoleOption.value}
            testId="code-review-role-filter"
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

      <ul className="divide-y divide-[var(--oh-border-subtle)] overflow-hidden rounded-lg border border-[var(--oh-border)] bg-[var(--oh-surface)]">
        {visiblePrs.map((pr) => (
          <CodeReviewPrRowView
            key={pr.id}
            pullRequest={pr}
            onSelect={() => openPrDrawer(pr)}
            onReviewFlavor={(flavorId) => openPrDrawer(pr, flavorId)}
          />
        ))}
      </ul>
    </div>
  );
}
