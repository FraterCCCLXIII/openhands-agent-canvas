import { useEffect, useMemo, useState } from "react";
import { useWebSocket, type WebSocketHookOptions } from "#/hooks/use-websocket";
import { buildWebSocketUrl } from "#/utils/websocket-url";
import {
  isAgentServerEvent,
  isActionEvent,
  isObservationEvent,
} from "#/types/agent-server/type-guards";
import type { OpenHandsEvent } from "#/types/agent-server/core";

// How far before the conversation's last-update time to start the `since`
// resend, so the in-flight step shows up without replaying full history.
const RESEND_LOOKBACK_MS = 30_000;

interface UseConversationLiveActivityParams {
  conversationId: string;
  conversationUrl: string | null | undefined;
  sessionApiKey: string | null | undefined;
  /** Conversation's last-updated time; anchors the `since` resend window. */
  updatedAt: string | null | undefined;
  /** Only connect when needed (e.g. the card is running and in view). */
  enabled: boolean;
}

/** ISO timestamp `RESEND_LOOKBACK_MS` before `updatedAt`, or null if unusable. */
function resendSince(updatedAt: string | null | undefined): string | null {
  if (!updatedAt) return null;
  const ts = Date.parse(updatedAt);
  if (Number.isNaN(ts)) return null;
  return new Date(ts - RESEND_LOOKBACK_MS).toISOString();
}

/**
 * Opens an isolated, read-only websocket to a single conversation and returns
 * the most recent action/observation event — used to show a live "what the
 * agent is doing now" line on a running board card.
 *
 * Unlike `ConversationWebSocketProvider`, this writes to local component state
 * only (never the global event store), so many cards can subscribe to
 * different conversations at once without clobbering each other. The connection
 * is gated by `enabled`, so callers must scope it (running + in view) to bound
 * the number of open sockets.
 */
export function useConversationLiveActivity({
  conversationId,
  conversationUrl,
  sessionApiKey,
  updatedAt,
  enabled,
}: UseConversationLiveActivityParams): OpenHandsEvent | null {
  const [latestEvent, setLatestEvent] = useState<OpenHandsEvent | null>(null);

  const url =
    enabled && conversationId
      ? buildWebSocketUrl(conversationId, conversationUrl)
      : null;

  const since = resendSince(updatedAt);

  const options = useMemo<WebSocketHookOptions>(() => {
    const queryParams: Record<string, string | boolean> = since
      ? { resend_mode: "since", after_timestamp: since }
      : { resend_mode: "all" };
    if (sessionApiKey) queryParams.session_api_key = sessionApiKey;

    return {
      queryParams,
      reconnect: { enabled: true },
      onMessage: (messageEvent) => {
        try {
          const event = JSON.parse(messageEvent.data);
          if (
            isAgentServerEvent(event) &&
            (isActionEvent(event) || isObservationEvent(event))
          ) {
            setLatestEvent(event);
          }
        } catch {
          // Ignore non-JSON frames.
        }
      },
    };
  }, [since, sessionApiKey]);

  // Drop the stale activity when switching to a different conversation.
  useEffect(() => {
    setLatestEvent(null);
  }, [conversationId]);

  useWebSocket(url ?? "", options);

  return latestEvent;
}
