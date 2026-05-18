import React, { useLayoutEffect, useReducer, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "#/utils/utils";
import { ExecutionStatus } from "#/types/agent-server/core/base/common";
import { isExecutionActive, isExecutionPaused } from "#/utils/status";
import { ConversationCardContextMenu } from "./conversation-card-context-menu";
import { EllipsisButton } from "../ellipsis-button";

interface ConversationCardActionsProps {
  contextMenuOpen: boolean;
  onContextMenuToggle: (isOpen: boolean) => void;
  onDelete?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onStop?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onEdit?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDownloadViaVSCode?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDownloadConversation?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  executionStatus?: ExecutionStatus | null;
  conversationId?: string;
  showOptions?: boolean;
}

export function ConversationCardActions({
  contextMenuOpen,
  onContextMenuToggle,
  onDelete,
  onStop,
  onEdit,
  onDownloadViaVSCode,
  onDownloadConversation,
  executionStatus,
  conversationId,
  showOptions,
}: ConversationCardActionsProps) {
  const isPaused = isExecutionPaused(executionStatus);
  const isActive = isExecutionActive(executionStatus);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [, bumpPosition] = useReducer((i: number) => i + 1, 0);

  useLayoutEffect(() => {
    if (!contextMenuOpen) return undefined;
    // Anchor ref is assigned after the ellipsis mounts; measure on the next frame.
    bumpPosition();
    // The scroll listener is in capture phase so it fires for nested scroll
    // containers too. Coalesce bursts via rAF so fast scrolling triggers at
    // most one reposition per paint frame instead of one per scroll event.
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        bumpPosition();
      });
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [contextMenuOpen]);

  const floatingStyle: React.CSSProperties | undefined = (() => {
    if (!contextMenuOpen || !anchorRef.current) return undefined;
    const rect = anchorRef.current.getBoundingClientRect();
    const vw = Number(window.innerWidth) || 0;
    const bottom = Number(rect.bottom) || 0;
    const rectRight = Number(rect.right) || 0;
    return {
      position: "fixed",
      top: bottom + 4,
      right: Math.max(8, vw - rectRight),
      zIndex: 100_000,
    };
  })();

  const portalTarget = typeof document !== "undefined" ? document.body : null;

  return (
    <>
      <EllipsisButton
        ref={anchorRef}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onContextMenuToggle(!contextMenuOpen);
        }}
        className={cn(isPaused && "opacity-60")}
      />
      {contextMenuOpen && floatingStyle && portalTarget
        ? createPortal(
            <ConversationCardContextMenu
              ignoreOutsideClickRef={anchorRef}
              floatingStyle={floatingStyle}
              onClose={() => onContextMenuToggle(false)}
              onDelete={onDelete}
              onStop={isActive ? onStop : undefined}
              onEdit={onEdit}
              onDownloadViaVSCode={
                conversationId && showOptions ? onDownloadViaVSCode : undefined
              }
              onDownloadConversation={
                conversationId ? onDownloadConversation : undefined
              }
              position="bottom"
            />,
            portalTarget,
          )
        : null}
    </>
  );
}
