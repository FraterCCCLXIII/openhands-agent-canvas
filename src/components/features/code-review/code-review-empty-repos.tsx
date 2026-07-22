import { useTranslation } from "react-i18next";
import { GitPullRequest } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { NavigationLink } from "#/components/shared/navigation-link";

/** Degrade state: no connected repos (mockup frame 4). */
export function CodeReviewEmptyRepos() {
  const { t } = useTranslation("openhands");

  return (
    <div
      data-testid="code-review-empty-repos"
      className="mt-2 flex flex-col items-center rounded-lg border border-dashed border-[var(--oh-border)] bg-[var(--oh-surface)] px-6 py-10 text-center"
    >
      <GitPullRequest
        className="mb-3 text-[var(--oh-text-dim)]"
        size={30}
        aria-hidden
      />
      <p className="text-sm font-semibold text-[var(--oh-foreground)]">
        {t(I18nKey.CODE_REVIEW$EMPTY_REPOS_TITLE)}
      </p>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--oh-muted)]">
        {t(I18nKey.CODE_REVIEW$EMPTY_REPOS_BODY)}
      </p>
      <NavigationLink
        to="/conversations"
        data-testid="code-review-connect-repo"
        className="mt-4 inline-flex items-center rounded-lg bg-[var(--oh-accent)] px-3 py-1.5 text-sm font-semibold text-[var(--oh-bg-deep,#101010)] hover:opacity-90"
      >
        {t(I18nKey.CODE_REVIEW$CONNECT_REPO)}
      </NavigationLink>
    </div>
  );
}
