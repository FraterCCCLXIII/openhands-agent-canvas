import {
  AUTOMATIONS_RESPONDERS_PATH,
  AUTOMATIONS_ROUTINES_PATH,
  AUTOMATIONS_TEMPLATES_PATH,
  AUTOMATIONS_WORKFLOWS_PATH,
} from "#/components/features/automations/automations-page.constants";
import { I18nKey } from "#/i18n/declaration";
import type { AutomationKind } from "#/utils/automation-kind";

export const AUTOMATE_DASHBOARD_RECENT_ACTIVITY_LIMIT = 10;

export interface AutomateDashboardCategoryConfig {
  kind: AutomationKind;
  titleKey: I18nKey;
  descriptionKey: I18nKey;
  createLabelKey: I18nKey;
  viewPath: string;
  testId: string;
}

export const AUTOMATE_DASHBOARD_CATEGORIES: AutomateDashboardCategoryConfig[] =
  [
    {
      kind: "workflow",
      titleKey: I18nKey.AUTOMATE$NAV_WORKFLOWS,
      descriptionKey: I18nKey.AUTOMATE$DASHBOARD_CATEGORY_WORKFLOWS_DESCRIPTION,
      createLabelKey: I18nKey.AUTOMATE$DASHBOARD_CREATE_WORKFLOW,
      viewPath: AUTOMATIONS_WORKFLOWS_PATH,
      testId: "automate-dashboard-category-workflows",
    },
    {
      kind: "routine",
      titleKey: I18nKey.AUTOMATE$NAV_ROUTINES,
      descriptionKey: I18nKey.AUTOMATE$DASHBOARD_CATEGORY_ROUTINES_DESCRIPTION,
      createLabelKey: I18nKey.AUTOMATE$DASHBOARD_CREATE_ROUTINE,
      viewPath: AUTOMATIONS_ROUTINES_PATH,
      testId: "automate-dashboard-category-routines",
    },
    {
      kind: "responder",
      titleKey: I18nKey.AUTOMATE$NAV_RESPONDERS,
      descriptionKey:
        I18nKey.AUTOMATE$DASHBOARD_CATEGORY_RESPONDERS_DESCRIPTION,
      createLabelKey: I18nKey.AUTOMATE$DASHBOARD_CREATE_RESPONDER,
      viewPath: AUTOMATIONS_RESPONDERS_PATH,
      testId: "automate-dashboard-category-responders",
    },
  ];

export const AUTOMATE_DASHBOARD_TEMPLATES_PATH = AUTOMATIONS_TEMPLATES_PATH;
