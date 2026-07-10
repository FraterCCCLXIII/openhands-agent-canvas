import { I18nKey } from "#/i18n/declaration";
import { AutomatePageHeader } from "#/components/features/automations/automate-page-header";
import { RecommendedAutomationsLauncher } from "#/components/features/automations/recommended-automations-launcher";

export default function AutomationsTemplates() {
  return (
    <div
      data-testid="automations-templates-screen"
      className="flex flex-col gap-6 pb-8"
    >
      <AutomatePageHeader
        titleKey={I18nKey.AUTOMATE$NAV_TEMPLATES}
        subtitleKey={I18nKey.AUTOMATE$PAGE_TEMPLATES_SUBTITLE}
      />

      <RecommendedAutomationsLauncher scrollableGrid />
    </div>
  );
}
