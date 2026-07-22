import { CodeReviewPlaceholder } from "#/components/features/code-review/code-review-placeholder";
import { I18nKey } from "#/i18n/declaration";

/**
 * Temporary home for Code Style (#1691) until the template lands more fully
 * on the Code Review surface.
 */
function CodeStyleSettingsScreen() {
  return (
    <CodeReviewPlaceholder
      testId="settings-code-style"
      bodyKey={I18nKey.CODE_REVIEW$CODE_STYLE_BODY}
    />
  );
}

export default CodeStyleSettingsScreen;
