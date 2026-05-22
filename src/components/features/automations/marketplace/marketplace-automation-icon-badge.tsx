import type { LucideIcon } from "lucide-react";
import { cn } from "#/utils/utils";

interface MarketplaceAutomationIconBadgeProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor?: string;
  className?: string;
  testId?: string;
}

export function MarketplaceAutomationIconBadge({
  icon: Icon,
  iconBg,
  iconColor = "#FFFFFF",
  className,
  testId,
}: MarketplaceAutomationIconBadgeProps) {
  return (
    <span
      aria-hidden
      data-testid={testId}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
        className,
      )}
      style={{
        backgroundColor: iconBg,
        color: iconColor,
      }}
    >
      <Icon className="size-5 shrink-0" />
    </span>
  );
}
