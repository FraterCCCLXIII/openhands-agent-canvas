import { cn } from "#/utils/utils";

/** Fixed icon column width so icons stay aligned when the rail collapses. */
export const SIDEBAR_ICON_SLOT_CLASS =
  "flex h-10 w-[18px] shrink-0 items-center justify-center";

export const SIDEBAR_HEADER_ROW_CLASS =
  "flex h-10 min-h-10 shrink-0 items-center gap-2 pl-2 pr-2 w-full";

export const SIDEBAR_NAV_LIST_CLASS =
  "flex flex-col gap-0.5 w-full shrink-0 items-stretch pr-2";

export function sidebarNavRowClassName(options?: {
  indent?: boolean;
  collapsed?: boolean;
}): string {
  const { indent = false, collapsed = false } = options ?? {};
  return cn(
    "flex h-10 min-h-10 min-w-0 items-center rounded-md transition-colors",
    "text-sm leading-5 w-full overflow-hidden",
    collapsed ? "gap-0 px-2" : "gap-2 px-2",
    indent && !collapsed && "pl-7",
  );
}

export function sidebarNavLabelClassName(collapsed: boolean): string {
  return cn(
    "min-w-0 transition-[max-width,opacity] duration-200 ease-out",
    collapsed ? "max-w-0 overflow-hidden opacity-0" : "truncate opacity-100",
  );
}

export const SIDEBAR_ICON_BUTTON_CLASS = cn(
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
  "transition-colors cursor-pointer",
);
