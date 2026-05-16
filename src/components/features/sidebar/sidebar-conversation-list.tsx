import { ConversationPanel } from "#/components/features/conversation-panel/conversation-panel";
import { useSidebarCollapsed } from "./sidebar-collapse-context";

/**
 * Conversation list section rendered inside the sidebar nav. The list itself
 * scrolls independently from the rest of the nav.
 *
 * In the collapsed sidebar variant the list reduces each row to a status
 * indicator + hover-preview.
 *
 * Stays within the aside's horizontal padding so row hovers (group headers,
 * conversation cards) align with {@link SidebarNavLink} items above.
 */
export function SidebarConversationList() {
  const collapsed = useSidebarCollapsed();

  if (collapsed) {
    return null;
  }

  return (
    <div className="hidden md:flex md:flex-col md:flex-1 md:min-h-0">
      <div className="flex-1 min-h-0 overflow-hidden w-full">
        <ConversationPanel />
      </div>
    </div>
  );
}
