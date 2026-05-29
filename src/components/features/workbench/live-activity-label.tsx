import { getEventContent } from "#/components/conversation-events/chat/event-content-helpers/get-event-content";
import type { OpenHandsEvent } from "#/types/agent-server/core";

/**
 * Renders the human-readable title of a single conversation event (e.g.
 * "Running <cmd>", "Editing <path>"). Default-exported so it can be
 * `React.lazy`'d — this pulls in the chat event-content helpers, which we keep
 * out of the workbench route's eager bundle.
 */
export default function LiveActivityLabel({
  event,
}: {
  event: OpenHandsEvent;
}) {
  const { title } = getEventContent(event);
  return title;
}
