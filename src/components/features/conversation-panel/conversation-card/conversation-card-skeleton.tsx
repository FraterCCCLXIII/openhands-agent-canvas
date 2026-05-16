interface ConversationCardSkeletonProps {
  compact?: boolean;
}

/** Stagger so each bar’s pulse peaks after the previous (ms). */
const PULSE_STAGGER_MS = [0, 180, 360] as const;

/**
 * Loading placeholders for the conversation list. Non-compact: three darker
 * rounded bars with staggered pulse; compact: three small bars for the icon
 * rail.
 */
export function ConversationCardSkeleton({
  compact = false,
}: ConversationCardSkeletonProps) {
  if (compact) {
    return (
      <div
        data-testid="conversation-card-skeleton-compact"
        className="flex flex-col items-center gap-1.5 py-1"
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <div
            key={`conversation-skeleton-compact-${i}`}
            className="h-1.5 w-7 shrink-0 rounded-md bg-neutral-700 animate-pulse motion-reduce:animate-none"
            style={{ animationDelay: `${PULSE_STAGGER_MS[i]}ms` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      data-testid="conversation-card-skeleton"
      className="flex flex-col gap-1.5 py-0.5"
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <div
          key={`conversation-skeleton-row-${i}`}
          className="h-6 min-h-6 w-full rounded-md bg-neutral-700 animate-pulse motion-reduce:animate-none"
          style={{ animationDelay: `${PULSE_STAGGER_MS[i]}ms` }}
        />
      ))}
    </div>
  );
}
