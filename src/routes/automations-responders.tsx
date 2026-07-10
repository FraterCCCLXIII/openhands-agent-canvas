import { I18nKey } from "#/i18n/declaration";
import { AutomatePlaceholderPage } from "#/components/features/automations/automate-placeholder-page";

export default function AutomationsResponders() {
  return (
    <AutomatePlaceholderPage
      testId="automations-responders-screen"
      titleKey={I18nKey.AUTOMATE$NAV_RESPONDERS}
      subtitleKey={I18nKey.AUTOMATE$PAGE_RESPONDERS_SUBTITLE}
    />
  );
}
