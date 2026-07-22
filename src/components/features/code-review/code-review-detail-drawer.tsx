import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

type CodeReviewDetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  titleMeta?: ReactNode;
  headerActions?: ReactNode;
  children: ReactNode;
  testId?: string;
};

/**
 * Full-height right drawer that participates in a push layout (sibling of
 * the main column). Width animates open/closed; no overlay backdrop.
 */
export function CodeReviewDetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  titleMeta,
  headerActions,
  children,
  testId = "code-review-detail-drawer",
}: CodeReviewDetailDrawerProps) {
  const { t } = useTranslation("openhands");

  useEffect(() => {
    if (!open) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "h-full shrink-0 overflow-hidden border-l border-[var(--oh-border)] bg-[var(--oh-surface)]",
        "transition-[width,opacity,transform] duration-300 ease-in-out",
        open
          ? "w-[min(36rem,48vw)] translate-x-0 opacity-100"
          : "w-0 translate-x-full opacity-0",
      )}
    >
      {open ? (
        <aside
          role="region"
          aria-label={title}
          data-testid={testId}
          className="flex h-full w-[min(36rem,48vw)] flex-col"
        >
          <header className="flex items-start justify-between gap-3 border-b border-[var(--oh-border)] px-5 py-4">
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-content">
                {title}
              </h2>
              {titleMeta ? (
                <div className="mt-1.5 flex min-w-0 flex-col gap-1.5">
                  {titleMeta}
                </div>
              ) : null}
              {subtitle ? (
                <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {headerActions}
              <button
                type="button"
                data-testid={`${testId}-close`}
                aria-label={t(I18nKey.BUTTON$CLOSE)}
                onClick={onClose}
                className="rounded-md p-1.5 text-[var(--oh-muted)] hover:bg-[var(--oh-surface-raised)] hover:text-[var(--oh-foreground)]"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>
        </aside>
      ) : null}
    </div>
  );
}
