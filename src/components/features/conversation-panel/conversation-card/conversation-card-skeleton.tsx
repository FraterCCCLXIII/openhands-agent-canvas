interface ConversationCardSkeletonProps {
  compact?: boolean;
}

/**
 * Non-compact: one pulse rectangle matching {@link ConversationCard} outer
 * spacing and corners (list wrapping uses the same `py-0.5` as real rows).
 */
export function ConversationCardSkeleton({
  compact = false,
}: ConversationCardSkeletonProps) {
  if (compact) {
    return (
      <div
        data-testid="conversation-card-skeleton-compact"
        className="flex items-center justify-center px-2 py-2"
      >
        <div className="skeleton-round h-2 w-2" />
      </div>
    );
  }

  return (
    <div
      data-testid="conversation-card-skeleton"
      className="h-auto w-full min-h-8 rounded-md py-1 pl-2 pr-1 skeleton"
      aria-hidden
    />
  );
}
