import { I18nKey } from "#/i18n/declaration";
import {
  AutomateCategoryListPage,
  type AutomateCategoryListPageConfig,
} from "#/components/features/automations/automate-category-list-page";

const WORKFLOWS_PAGE_CONFIG: AutomateCategoryListPageConfig = {
  kind: "workflow",
  testId: "automations-workflows-screen",
  titleKey: I18nKey.AUTOMATE$NAV_WORKFLOWS,
  subtitleKey: I18nKey.AUTOMATE$DASHBOARD_CATEGORY_WORKFLOWS_DESCRIPTION,
  createLabelKey: I18nKey.AUTOMATE$DASHBOARD_CREATE_WORKFLOW,
  createTestId: "automations-workflows-create",
  emptyTitleKey: I18nKey.AUTOMATE$WORKFLOWS_EMPTY_TITLE,
  emptyDescriptionKey: I18nKey.AUTOMATE$WORKFLOWS_EMPTY_DESCRIPTION,
  emptyTestId: "automations-workflows-empty",
};

export default function AutomationsWorkflows() {
  return <AutomateCategoryListPage config={WORKFLOWS_PAGE_CONFIG} />;
}
