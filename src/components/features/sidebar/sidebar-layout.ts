import { cn } from "#/utils/utils";

/**
 * Fixed icon column — same glyph position expanded vs collapsed.
 * Horizontal alignment: aside `md:px-2` + row `px-2` + leading 18px in the
 * collapsed control (or this slot when expanded).
 */
export const SIDEBAR_ICON_SLOT_CLASS =
  "flex h-10 w-[18px] shrink-0 items-center justify-center";

/** Collapsed rail: square hit target; icon stays in the leading 18px column. */
export const SIDEBAR_COLLAPSED_CONTROL_CLASS =
  "flex h-10 w-10 shrink-0 items-center justify-start rounded-md transition-colors";

export const SIDEBAR_HEADER_ROW_CLASS =
  "flex h-10 min-h-10 shrink-0 items-center gap-2 pl-2 pr-2 w-full";

export const SIDEBAR_ROW_INTERACTIVE_CLASS = {
  active: "bg-tertiary text-white font-medium",
  idle: "text-[var(--oh-muted)] hover:text-white hover:bg-[var(--oh-surface-raised)]",
} as const;

export function sidebarNavListClassName(collapsed: boolean): string {
  return cn(
    "flex flex-col gap-0.5 w-full shrink-0 items-stretch",
    !collapsed && "pr-2",
  );
}

export function sidebarNavRowClassName(options?: {
  indent?: boolean;
  collapsed?: boolean;
}): string {
  const { indent = false, collapsed = false } = options ?? {};
  return cn(
    "flex h-10 min-h-10 min-w-0 items-center rounded-md transition-colors",
    "text-sm leading-5 w-full overflow-hidden",
    collapsed ? "gap-0 px-2 bg-transparent hover:bg-transparent" : "gap-2 px-2",
    indent && !collapsed && "pl-7",
  );
}

export function sidebarIconSlotClassName(options: {
  collapsed: boolean;
  active: boolean;
}): string {
  const { collapsed, active } = options;
  if (!collapsed) {
    return SIDEBAR_ICON_SLOT_CLASS;
  }
  return cn(
    SIDEBAR_COLLAPSED_CONTROL_CLASS,
    active
      ? SIDEBAR_ROW_INTERACTIVE_CLASS.active
      : SIDEBAR_ROW_INTERACTIVE_CLASS.idle,
  );
}

export function sidebarNavLabelClassName(collapsed: boolean): string {
  if (collapsed) {
    return "sr-only";
  }
  return "min-w-0 truncate";
}

export const SIDEBAR_ICON_BUTTON_CLASS = cn(
  "inline-flex size-8 shrink-0 items-center justify-center rounded-md",
  "transition-colors cursor-pointer",
);

/** Logo + expand overlay when the desktop rail is collapsed. */
export const SIDEBAR_COLLAPSED_LOGO_WRAPPER_CLASS = cn(
  "relative hidden md:block shrink-0 overflow-visible",
  SIDEBAR_ICON_SLOT_CLASS,
);

export const SIDEBAR_COLLAPSE_TOGGLE_OVERLAY_CLASS = cn(
  "absolute left-1/2 top-1/2 hidden size-8 -translate-x-1/2 -translate-y-1/2 md:inline-flex",
  "items-center justify-center rounded-md transition-[opacity,colors] cursor-pointer",
  "text-[var(--oh-muted)] hover:text-white hover:bg-[var(--oh-surface-raised)]",
);
