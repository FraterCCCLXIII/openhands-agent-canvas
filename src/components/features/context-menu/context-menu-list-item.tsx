import { forwardRef } from "react";
import { cn } from "#/utils/utils";

interface ContextMenuListItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "disabled"
> {
  testId?: string;
  isDisabled?: boolean;
}

export const ContextMenuListItem = forwardRef<
  HTMLButtonElement,
  React.PropsWithChildren<ContextMenuListItemProps>
>(function ContextMenuListItem(
  {
    children,
    testId,
    onClick,
    isDisabled,
    className,
    type = "button",
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      {...rest}
      data-testid={testId || "context-menu-list-item"}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        "group w-full cursor-pointer rounded px-2 py-2 text-start text-nowrap text-sm font-normal",
        "text-[var(--oh-foreground)] hover:bg-[var(--oh-interactive-hover)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent",
        className,
      )}
    >
      {children}
    </button>
  );
});
