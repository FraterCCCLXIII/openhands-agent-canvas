import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import PlusIcon from "#/icons/plus.svg?react";
import XMarkIcon from "#/icons/x-mark.svg?react";
import { ContextMenu } from "#/ui/context-menu";
import { ContextMenuListItem } from "#/components/features/context-menu/context-menu-list-item";
import { cn } from "#/utils/utils";
import { extensionModuleCardPillClassName } from "#/utils/extension-module-card-classes";
import { CreateAutomationSectionHeader } from "./create-automation-section-header";

export interface AutomationBubbleItem {
  id: string;
  label: string;
}

interface AutomationBubbleFieldProps {
  label: string;
  addActionLabel: string;
  addActionAriaLabel: string;
  hideSectionAriaLabel: string;
  getRemoveAriaLabel: (label: string) => string;
  testId: string;
  items: AutomationBubbleItem[];
  onRemove: (id: string) => void;
  onHide: () => void;
  menuOptions?: AutomationBubbleItem[];
  onSelectMenuOption?: (id: string) => void;
  onAddClick?: () => void;
}

export function AutomationBubbleField({
  label,
  addActionLabel,
  addActionAriaLabel,
  hideSectionAriaLabel,
  getRemoveAriaLabel,
  testId,
  items,
  onRemove,
  onHide,
  menuOptions,
  onSelectMenuOption,
  onAddClick,
}: AutomationBubbleFieldProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (!menuOpen || !triggerRef.current) return undefined;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setPortalStyle({
        position: "fixed",
        zIndex: 10000,
        top: rect.bottom + 4,
        left: rect.left,
        minWidth: rect.width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
      return;
    }
    if (menuOptions?.length) {
      setMenuOpen((open) => !open);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-2.5" data-testid={testId}>
      <CreateAutomationSectionHeader
        label={label}
        hideAriaLabel={hideSectionAriaLabel}
        hideTestId={`${testId}-hide`}
        onHide={onHide}
      />
      <div className="flex min-h-9 flex-wrap items-center gap-2 rounded-lg border border-[var(--oh-border)] bg-[rgba(255,255,255,0.04)] p-2">
        {items.map((item) => (
          <span
            key={item.id}
            className={cn(
              extensionModuleCardPillClassName,
              "gap-1 py-1 pl-2 pr-1",
            )}
            data-testid={`${testId}-item-${item.id}`}
          >
            <span className="max-w-[240px] truncate">{item.label}</span>
            <button
              type="button"
              className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted hover:bg-white/10 hover:text-white"
              aria-label={getRemoveAriaLabel(item.label)}
              onClick={() => onRemove(item.id)}
            >
              <XMarkIcon className="size-3" />
            </button>
          </span>
        ))}
        <button
          ref={triggerRef}
          type="button"
          data-testid={`${testId}-add`}
          aria-label={addActionAriaLabel}
          aria-haspopup={menuOptions?.length ? "menu" : undefined}
          aria-expanded={menuOpen}
          className={cn(
            extensionModuleCardPillClassName,
            "group h-7 cursor-pointer gap-1.5 px-2 py-1 text-muted hover:bg-primary hover:text-[var(--oh-color-base)]",
          )}
          onClick={handleAddClick}
        >
          <PlusIcon className="size-3.5 shrink-0 transition-colors group-hover:text-[var(--oh-color-base)]" />
          <span className="text-xs font-medium">{addActionLabel}</span>
        </button>
      </div>
      {menuOpen && menuOptions?.length
        ? ReactDOM.createPortal(
            <ContextMenu
              ref={menuRef}
              theme="popover"
              style={portalStyle}
              testId={`${testId}-menu`}
            >
              {menuOptions.map((option) => (
                <ContextMenuListItem
                  key={option.id}
                  testId={`${testId}-menu-${option.id}`}
                  onClick={() => {
                    onSelectMenuOption?.(option.id);
                    setMenuOpen(false);
                  }}
                >
                  {option.label}
                </ContextMenuListItem>
              ))}
            </ContextMenu>,
            document.body,
          )
        : null}
    </div>
  );
}
