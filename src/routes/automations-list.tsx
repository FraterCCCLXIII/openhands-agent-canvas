import { I18nKey } from "#/i18n/declaration";
import {
  AutomateCategoryListPage,
  type AutomateCategoryListPageConfig,
} from "#/components/features/automations/automate-category-list-page";

const ROUTINES_PAGE_CONFIG: AutomateCategoryListPageConfig = {
  kind: "routine",
  testId: "automations-routines-screen",
  titleKey: I18nKey.AUTOMATE$NAV_ROUTINES,
  subtitleKey: I18nKey.AUTOMATE$DASHBOARD_CATEGORY_ROUTINES_DESCRIPTION,
  createLabelKey: I18nKey.AUTOMATE$DASHBOARD_CREATE_ROUTINE,
  createTestId: "automations-routines-create",
  emptyTitleKey: I18nKey.AUTOMATE$ROUTINES_EMPTY_TITLE,
  emptyDescriptionKey: I18nKey.AUTOMATE$ROUTINES_EMPTY_DESCRIPTION,
  emptyTestId: "automations-routines-empty",
  showScheduleExtras: true,
};

export default function AutomationsList() {
  return <AutomateCategoryListPage config={ROUTINES_PAGE_CONFIG} />;
}
