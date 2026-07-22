import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import {
  CodeReviewDrawerProvider,
  useCodeReviewDrawer,
} from "./code-review-drawer-context";
import { CodeReviewDetailDrawer } from "./code-review-detail-drawer";
import { CodeReviewTabs } from "./code-review-tabs";

interface CodeReviewLayoutProps {
  children: React.ReactNode;
  /** Override page title (e.g. review detail). */
  title?: string;
  subtitle?: string;
  hideTabs?: boolean;
}

function CodeReviewLayoutShell({
  children,
  title,
  subtitle,
  hideTabs = false,
}: CodeReviewLayoutProps) {
  const { t } = useTranslation("openhands");
  const { drawer, closeDrawer } = useCodeReviewDrawer();
  const drawerOpen = Boolean(drawer);

  return (
    <div
      data-testid="code-review-page"
      className="flex h-full min-h-0 overflow-hidden"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto transition-[width] duration-300 ease-in-out">
        <div className="mx-auto w-full max-w-4xl p-6">
          <header>
            <h1 className="text-xl font-semibold text-content">
              {title ?? t(I18nKey.CODE_REVIEW$TITLE)}
            </h1>
            {subtitle || !title ? (
              <p className="mt-1 text-sm text-muted">
                {subtitle ?? t(I18nKey.CODE_REVIEW$SUBTITLE)}
              </p>
            ) : null}
          </header>
          {hideTabs ? null : <CodeReviewTabs />}
          {children}
        </div>
      </div>

      <CodeReviewDetailDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={drawer?.title ?? ""}
        subtitle={drawer?.subtitle}
        titleMeta={drawer?.titleMeta}
        headerActions={drawer?.headerActions}
        testId={drawer?.testId}
      >
        {drawer?.body}
      </CodeReviewDetailDrawer>
    </div>
  );
}

/**
 * Top-level Code Review shell with a push-style right drawer.
 */
export function CodeReviewLayout(props: CodeReviewLayoutProps) {
  return (
    <CodeReviewDrawerProvider>
      <CodeReviewLayoutShell {...props} />
    </CodeReviewDrawerProvider>
  );
}
