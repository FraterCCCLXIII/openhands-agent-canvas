import { I18nKey } from "#/i18n/declaration";
import { AutomatePageHeader } from "./automate-page-header";

interface AutomatePlaceholderPageProps {
  titleKey: I18nKey;
  subtitleKey: I18nKey;
  testId: string;
}

/** Shared shell for Automate subpages that are not implemented yet. */
export function AutomatePlaceholderPage({
  titleKey,
  subtitleKey,
  testId,
}: AutomatePlaceholderPageProps) {
  return (
    <div data-testid={testId} className="flex flex-col gap-6 pb-8">
      <AutomatePageHeader titleKey={titleKey} subtitleKey={subtitleKey} />
    </div>
  );
}
