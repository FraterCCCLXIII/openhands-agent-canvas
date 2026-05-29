import { Suspense, lazy } from "react";
import { useTranslation } from "react-i18next";
import { Archive } from "lucide-react";
import AutomationsIcon from "#/icons/automations.svg?react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { useInView } from "#/hooks/use-in-view";
import { useConversationDiffStat } from "#/hooks/query/use-conversation-diff-stat";
import { useConversationLiveActivity } from "./use-conversation-live-activity";
import { formatTimeAgo } from "./format-time-ago";
import { DiffStat } from "./diff-stat";
import type { WorkbenchCard } from "./types";

// Render the live-action title only once a running card is in view; lazy so the
// chat event-content helpers stay out of the workbench route's eager bundle.
const LiveActivityLabel = lazy(() => import("./live-activity-label"));

// Track visibility continuously (not once) so the per-card live websocket
// connects on enter and disconnects on leave; cards prefetch slightly early.
const IN_VIEW_OPTIONS: IntersectionObserverInit & { once?: boolean } = {
  rootMargin: "200px",
  once: false,
};

interface WorkbenchCardProps {
  card: WorkbenchCard;
  /** Tailwind classes for the leading status dot (color, animation). */
  statusDotClassName: string;
  onClick: () => void;
  /** Invoked when the user requests to archive this card. */
  onArchive?: (card: WorkbenchCard) => void;
  /** When true, the card is already archived (hides the archive action). */
  isArchived?: boolean;
}

export function WorkbenchCardItem({
  card,
  statusDotClassName,
  onClick,
  onArchive,
  isArchived = false,
}: WorkbenchCardProps) {
  const { t } = useTranslation("openhands");
  const showArchive = Boolean(onArchive) && !isArchived;

  const { ref, inView } = useInView<HTMLDivElement>(IN_VIEW_OPTIONS);
  // Diff stats fetch for every real card (not gated on viewport): most
  // conversations report zero changes in a single request, and changed ones
  // are bounded (capped files + limited concurrency) inside the hook. Gating on
  // `inView` left cards blank when the IntersectionObserver didn't fire for
  // their position, so the badge never appeared.
  const { data: diffStat } = useConversationDiffStat({
    conversationId: card.id,
    conversationUrl: card.conversationUrl,
    sessionApiKey: card.sessionApiKey,
    selectedRepository: card.selectedRepository ?? null,
    workingDir: card.workingDir,
    enabled: !card.isPlaceholder,
  });
  const liveEvent = useConversationLiveActivity({
    conversationId: card.id,
    conversationUrl: card.conversationUrl,
    sessionApiKey: card.sessionApiKey,
    updatedAt: card.updatedAt,
    enabled: inView && Boolean(card.activity) && !card.isPlaceholder,
  });

  if (card.isPlaceholder) {
    return (
      <div
        data-testid="workbench-card-placeholder"
        aria-hidden
        className="rounded-xl border border-[var(--oh-border)] bg-base p-4"
      >
        <div className="mb-3 flex items-start gap-2">
          <span className="skeleton-round mt-[7px] h-1.5 w-1.5 shrink-0" />
          <span className="skeleton h-4 w-3/4" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="skeleton h-3 w-1/2" />
          <span className="skeleton h-3 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "group relative rounded-xl border border-[var(--oh-border)] bg-base",
        "transition-colors duration-150 hover:border-[var(--oh-muted)]",
        "focus-within:ring-1 focus-within:ring-[var(--oh-focus)]",
      )}
    >
      {/* Full-card click target. Content below sets pointer-events-none so
          clicks fall through here, keeping the archive button (a sibling)
          the only other interactive element — no nested buttons. */}
      <button
        type="button"
        data-testid="workbench-card"
        onClick={onClick}
        aria-label={card.title}
        className="absolute inset-0 z-0 rounded-xl outline-none"
      />

      <div className="pointer-events-none relative z-[1] flex flex-col p-4">
        <div className="mb-3 flex items-start gap-2">
          <span
            className={cn(
              "mt-[7px] inline-flex h-1.5 w-1.5 shrink-0 rounded-full",
              statusDotClassName,
            )}
            aria-hidden
          />
          <h3 className="line-clamp-2 pr-6 text-sm font-medium leading-6 text-white">
            {card.title}
          </h3>
        </div>

        {card.activity ? (
          <p className="gradient-flow mb-3 truncate text-xs font-medium [&_*]:font-sans">
            {liveEvent ? (
              <Suspense fallback={card.activity}>
                <LiveActivityLabel event={liveEvent} />
              </Suspense>
            ) : (
              card.activity
            )}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-2 text-xs text-tertiary-light">
          <span className="flex min-w-0 items-center gap-1.5">
            {card.sourceType === "automation" ? (
              <AutomationsIcon width={12} height={12} aria-hidden />
            ) : null}
            <span className="min-w-0 truncate">{card.model || card.repo}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {diffStat ? (
              <DiffStat
                additions={diffStat.additions}
                deletions={diffStat.deletions}
              />
            ) : null}
            <span>{formatTimeAgo(t, card.updatedAt)}</span>
          </span>
        </div>
      </div>

      {showArchive ? (
        <button
          type="button"
          data-testid="workbench-card-archive"
          aria-label={t(I18nKey.WORKBENCH$ARCHIVE)}
          onClick={(event) => {
            event.stopPropagation();
            onArchive?.(card);
          }}
          className={cn(
            "absolute right-2 top-2 z-[2] inline-flex h-7 w-7 items-center justify-center rounded-md",
            "text-tertiary-light opacity-0 transition-opacity duration-150",
            "hover:bg-surface-raised hover:text-white focus-visible:opacity-100",
            "group-hover:opacity-100 motion-reduce:transition-none",
          )}
        >
          <Archive width={14} height={14} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
