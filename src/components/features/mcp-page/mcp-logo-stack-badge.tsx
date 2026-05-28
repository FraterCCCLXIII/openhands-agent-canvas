import type { IntegrationCatalogEntry } from "@openhands/extensions/integrations";
import {
  McpLogoBadge,
  type McpLogoEntry,
} from "#/components/features/mcp-logo-badge";
import { cn } from "#/utils/utils";

const STACK_CONTAINER_CLASS_NAMES = {
  md: "inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-surface-raised shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
  sm: "inline-flex h-8 w-8 shrink-0 overflow-hidden rounded-md border border-white/10 bg-surface-raised shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
} as const;

interface McpLogoStackBadgeProps {
  entries: Array<
    Pick<IntegrationCatalogEntry, "id" | "name" | "iconBg" | "iconColor">
  >;
  className?: string;
  testId?: string;
  size?: keyof typeof STACK_CONTAINER_CLASS_NAMES;
}

function toLogoEntries(
  entries: McpLogoStackBadgeProps["entries"],
): McpLogoEntry[] {
  return entries.slice(0, 4);
}

export function McpLogoStackBadge({
  entries,
  className,
  testId,
  size = "md",
}: McpLogoStackBadgeProps) {
  const visibleEntries = toLogoEntries(entries);
  const stackContainerClassName = STACK_CONTAINER_CLASS_NAMES[size];
  const singleBadgeSize = size === "sm" ? "sm" : "md";

  if (visibleEntries.length === 0) {
    return (
      <McpLogoBadge
        entry={null}
        size={singleBadgeSize}
        className={className}
        testId={testId}
      />
    );
  }

  if (visibleEntries.length === 1) {
    return (
      <McpLogoBadge
        entry={visibleEntries[0]}
        size={singleBadgeSize}
        className={className}
        testId={testId}
      />
    );
  }

  if (visibleEntries.length === 2) {
    return (
      <span
        aria-hidden="true"
        data-testid={testId}
        data-layout="overlap"
        className={cn(
          stackContainerClassName,
          "items-center justify-center",
          className,
        )}
      >
        <span className="flex items-center justify-center -space-x-2">
          {visibleEntries.map((entry) => (
            <McpLogoBadge
              key={entry.id}
              entry={entry}
              size={size === "sm" ? "xs" : "sm"}
              className="ring-2 ring-surface-raised"
            />
          ))}
        </span>
      </span>
    );
  }

  const quadrantSlots: Array<McpLogoEntry | null> = [
    visibleEntries[0] ?? null,
    visibleEntries[1] ?? null,
    visibleEntries[2] ?? null,
    visibleEntries[3] ?? null,
  ];

  return (
    <span
      aria-hidden="true"
      data-testid={testId}
      data-layout="quadrants"
      className={cn(
        stackContainerClassName,
        "grid grid-cols-2 grid-rows-2 gap-0.5 p-1",
        className,
      )}
    >
      {quadrantSlots.map((entry, index) =>
        entry ? (
          <span key={entry.id} className="flex items-center justify-center">
            <McpLogoBadge entry={entry} size="xs" />
          </span>
        ) : (
          <span key={`empty-${index}`} aria-hidden="true" />
        ),
      )}
    </span>
  );
}
