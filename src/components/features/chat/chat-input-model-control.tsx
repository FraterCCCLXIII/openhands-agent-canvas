import { useActiveBackend } from "#/contexts/active-backend-context";
import { useChatInputModelState } from "#/hooks/use-chat-input-model-state";
import { ChatInputModel } from "./components/chat-input-model";
import { SwitchProfileButton } from "./switch-profile-button";

/** Model/profile picker shown in the conversation composer actions row. */
export function ChatInputModelControl() {
  const { backend } = useActiveBackend();
  const isCloud = backend.kind === "cloud";
  const modelState = useChatInputModelState();

  if (isCloud || modelState.isAcpContext) {
    return <ChatInputModel />;
  }

  return <SwitchProfileButton />;
}
