import React from "react";
import { NavigationLink } from "#/components/shared/navigation-link";
import { StyledTooltip } from "#/components/shared/buttons/styled-tooltip";
import { cn } from "#/utils/utils";
import {
  SIDEBAR_ICON_SLOT_CLASS,
  sidebarNavLabelClassName,
  sidebarNavRowClassName,
} from "./sidebar-layout";

interface SidebarNavLinkProps {
  to: string;
  label: string;
  end?: boolean;
  indent?: boolean;
  testId?: string;
  disabled?: boolean;
  icon?: React.ReactElement;
  /**
   * When true, render only the icon (label is shown via a hover tooltip
   * floating to the side). Used by the collapsed sidebar.
   */
  collapsed?: boolean;
  /**
   * Optional rich-content node shown in the hover tooltip instead of the
   * plain label. Useful for rendering an "expanded version" of the item
   * while the sidebar is collapsed.
   */
  hoverContent?: React.ReactNode;
  /**
   * When true, forces the active style regardless of the current path.
   * Useful for links that should appear active for multiple related routes
   * (e.g. the Extensions link being active on /mcp and /plugins too).
   */
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
      className={({ isActive }) =>
        cn(
          sidebarNavRowClassName({ indent, collapsed }),
          isActive || forceActive
            ? "bg-tertiary text-white font-medium"
            : "text-[var(--oh-muted)] hover:text-white hover:bg-[var(--oh-surface-raised)]",
          disabled && "pointer-events-none opacity-50",
        )
      }
    >
      {icon ? <span className={SIDEBAR_ICON_SLOT_CLASS}>{icon}</span> : null}
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
