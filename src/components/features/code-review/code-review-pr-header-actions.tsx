import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { constructPullRequestUrl } from "#/utils/utils";
import { CodeReviewReviewMenu } from "./code-review-review-menu";
import type {
  CodeReviewPrRow,
  CodeReviewReviewFlavorId,
} from "./code-review-types";

type CodeReviewPrHeaderActionsProps = {
  pullRequest: CodeReviewPrRow;
  onSelectFlavor: (flavorId: CodeReviewReviewFlavorId) => void;
};

export function CodeReviewPrHeaderActions({
  pullRequest,
  onSelectFlavor,
}: CodeReviewPrHeaderActionsProps) {
  const { t } = useTranslation("openhands");
  const pullRequestUrl =
    pullRequest.number > 0
      ? constructPullRequestUrl(pullRequest.number, "github", pullRequest.repo)
      : null;

  return (
    <div
      data-testid="code-review-pr-header-actions"
      className="flex shrink-0 items-center gap-2"
    >
      {pullRequestUrl ? (
        <a
          href={pullRequestUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`code-review-open-github-${pullRequest.id}`}
          className="text-xs font-semibold text-[var(--oh-accent)] hover:opacity-90"
        >
          {t(I18nKey.CODE_REVIEW$OPEN_ON_GITHUB)}
        </a>
      ) : null}
      <CodeReviewReviewMenu
        pullRequestId={pullRequest.id}
        idSuffix="drawer"
        onSelectFlavor={onSelectFlavor}
      />
    </div>
  );
}
