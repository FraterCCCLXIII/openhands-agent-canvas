import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ContextMenuListItem } from "#/components/features/context-menu/context-menu-list-item";
import { I18nKey } from "#/i18n/declaration";
import { ContextMenu } from "#/ui/context-menu";
import { CODE_REVIEW_REVIEW_FLAVORS } from "./code-review-mock-data";
import type { CodeReviewReviewFlavorId } from "./code-review-types";

const FLAVOR_TITLE: Record<CodeReviewReviewFlavorId, I18nKey> = {
  static: I18nKey.CODE_REVIEW$FLAVOR_STATIC,
  runtime: I18nKey.CODE_REVIEW$FLAVOR_RUNTIME,
  quality: I18nKey.CODE_REVIEW$FLAVOR_QUALITY,
  critic: I18nKey.CODE_REVIEW$FLAVOR_CRITIC,
};

const FLAVOR_BODY: Record<CodeReviewReviewFlavorId, I18nKey> = {
  static: I18nKey.CODE_REVIEW$FLAVOR_STATIC_BODY,
  runtime: I18nKey.CODE_REVIEW$FLAVOR_RUNTIME_BODY,
  quality: I18nKey.CODE_REVIEW$FLAVOR_QUALITY_BODY,
  critic: I18nKey.CODE_REVIEW$FLAVOR_CRITIC_BODY,
};

type CodeReviewReviewMenuProps = {
  pullRequestId: string;
  /** Disambiguates test ids when the same PR has Review menus in list + drawer. */
  idSuffix?: string;
  onSelectFlavor: (flavorId: CodeReviewReviewFlavorId) => void;
};

export function CodeReviewReviewMenu({
  pullRequestId,
  idSuffix,
  onSelectFlavor,
}: CodeReviewReviewMenuProps) {
  const { t } = useTranslation("openhands");
  const [open, setOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = idSuffix ? `${pullRequestId}-${idSuffix}` : pullRequestId;

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return undefined;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const gap = 4;
      setPortalStyle({
        position: "fixed",
        zIndex: 9999,
        top: rect.bottom + gap,
        right: window.innerWidth - rect.right,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const menu =
    open && portalStyle ? (
      <ContextMenu
        ref={menuRef}
        theme="popover"
        className="min-w-[16rem] max-w-[20rem]"
        testId={`code-review-review-menu-${menuId}`}
      >
        {CODE_REVIEW_REVIEW_FLAVORS.map((flavor) => (
          <li key={flavor.id}>
            <ContextMenuListItem
              testId={`code-review-review-option-${menuId}-${flavor.id}`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectFlavor(flavor.id);
                setOpen(false);
              }}
              className="group h-auto whitespace-normal py-2"
            >
              <span className="flex flex-col items-start gap-0.5 text-left">
                <span className="text-sm font-medium">
                  {t(FLAVOR_TITLE[flavor.id])}
                </span>
                <span className="text-[11px] leading-snug text-[var(--oh-muted)]">
                  {t(FLAVOR_BODY[flavor.id])}
                </span>
              </span>
            </ContextMenuListItem>
          </li>
        ))}
      </ContextMenu>
    ) : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-testid={`code-review-review-${menuId}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        className="inline-flex items-center gap-1 rounded-lg bg-[var(--oh-accent)] px-2.5 py-1.5 text-xs font-semibold text-[var(--oh-bg-deep,#101010)] hover:opacity-90"
      >
        {t(I18nKey.CODE_REVIEW$ACTION_REVIEW)}
        <ChevronDown size={10} aria-hidden className="opacity-70" />
      </button>

      {open && portalStyle && typeof document !== "undefined"
        ? ReactDOM.createPortal(
            <div style={portalStyle}>{menu}</div>,
            document.body,
          )
        : null}
    </>
  );
}
