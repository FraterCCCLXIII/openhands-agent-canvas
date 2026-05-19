import React from "react";
import { NavigationLink } from "#/components/shared/navigation-link";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";
import { useNavigation } from "#/context/navigation-context";
import { cn } from "#/utils/utils";
import {
  SIDEBAR_ICON_SLOT_CLASS,
  SIDEBAR_ROW_INTERACTIVE_CLASS,
  sidebarIconSlotClassName,
  sidebarNavLabelClassName,
  sidebarNavRowClassName,
} from "./sidebar-layout";

function isPathActive(currentPath: string, to: string, end: boolean) {
  if (to === "/") {
    return currentPath === to;
  }

  if (end) {
    return currentPath === to;
  }

  return currentPath === to || currentPath.startsWith(`${to}/`);
}

interface SidebarNavLinkProps {
  to: string;
  label: string;
  end?: boolean;
  indent?: boolean;
  testId?: string;
  disabled?: boolean;
  icon?: React.ReactElement;
  collapsed?: boolean;
  hoverContent?: React.ReactNode;
  forceActive?: boolean;
}

export function SidebarNavLink({
  to,
  label,
  end = false,
  indent = false,
  testId,
  disabled = false,
  icon,
  collapsed = false,
  hoverContent,
  forceActive = false,
}: SidebarNavLinkProps) {
  const { currentPath } = useNavigation();
  const active = forceActive || isPathActive(currentPath, to, end);

  const link = (
    <NavigationLink
      to={to}
      end={end}
      data-testid={testId}
      tabIndex={disabled ? -1 : 0}
      aria-label={collapsed ? label : undefined}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
        }
      }}
      className={cn(
        sidebarNavRowClassName({ indent, collapsed }),
        !collapsed &&
          (active
            ? SIDEBAR_ROW_INTERACTIVE_CLASS.active
            : SIDEBAR_ROW_INTERACTIVE_CLASS.idle),
        disabled && "pointer-events-none opacity-50",
      )}
    >
      {icon ? (
        <span className={sidebarIconSlotClassName({ collapsed, active })}>
          {collapsed ? (
            <span className={SIDEBAR_ICON_SLOT_CLASS}>{icon}</span>
          ) : (
            icon
          )}
        </span>
      ) : null}
      <span className={sidebarNavLabelClassName(collapsed)}>{label}</span>
    </NavigationLink>
  );

  if (!collapsed) return link;

  return (
    <StyledTooltip
      content={hoverContent ?? label}
      placement="right"
      tooltipClassName={hoverContent ? "p-0 bg-tertiary text-white" : undefined}
    >
      {link}
    </StyledTooltip>
  );
}
