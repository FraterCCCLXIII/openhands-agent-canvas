import { Tooltip, TooltipProps } from "@heroui/react";
import React, { ReactNode } from "react";
import { cn } from "#/utils/utils";

export interface StyledTooltipProps {
  children: ReactNode;
  content: string | ReactNode;
  tooltipClassName?: React.HTMLAttributes<HTMLDivElement>["className"];
  placement?: TooltipProps["placement"];
  showArrow?: boolean;
  closeDelay?: number;
  offset?: number;
  shouldFlip?: boolean;
}

export function StyledTooltip({
  children,
  content,
  tooltipClassName,
  placement = "right",
  showArrow = false,
  closeDelay = 100,
  offset,
  shouldFlip,
}: StyledTooltipProps) {
  const disableAnimation = import.meta.env.MODE === "test";

  return (
    <Tooltip
      content={content}
      closeDelay={closeDelay}
      placement={placement}
      offset={offset}
      shouldFlip={shouldFlip}
      className={cn("bg-white text-black", tooltipClassName)}
      showArrow={showArrow}
      disableAnimation={disableAnimation}
    >
      <div className="inline-flex">{children}</div>
    </Tooltip>
  );
}
