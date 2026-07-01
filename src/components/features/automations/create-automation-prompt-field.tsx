import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChatAddFileButton } from "#/components/features/chat/chat-add-file-button";
import { ChatInputModelControl } from "#/components/features/chat/chat-input-model-control";
import { DragOver } from "#/components/features/chat/drag-over";
import { HiddenFileInput } from "#/components/features/chat/components/hidden-file-input";
import { UploadedFiles } from "#/components/features/chat/uploaded-files";
import { getClipboardFiles } from "#/components/features/chat/utils/chat-input.utils";
import {
  chatInputActionsRowClassName,
  chatInputContainerClassName,
  chatInputRowClassName,
  chatInputTextareaClassName,
} from "#/components/features/chat/chat-input-surface-classes";
import { useChatAttachmentUpload } from "#/hooks/chat/use-chat-attachment-upload";
import { useFileHandling } from "#/hooks/chat/use-file-handling";
import { I18nKey } from "#/i18n/declaration";
import { useConversationStore } from "#/stores/conversation-store";
import { cn } from "#/utils/utils";

interface CreateAutomationPromptFieldProps {
  prompt: string;
  onPromptChange: (value: string) => void;
}

export function CreateAutomationPromptField({
  prompt,
  onPromptChange,
}: CreateAutomationPromptFieldProps) {
  const { t } = useTranslation("openhands");
  const { handleUpload } = useChatAttachmentUpload();
  const clearAllFiles = useConversationStore((state) => state.clearAllFiles);
  const {
    fileInputRef,
    chatContainerRef,
    isDragOver,
    handleFileIconClick,
    handleFileInputChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  } = useFileHandling(handleUpload);

  useEffect(
    () => () => {
      clearAllFiles();
    },
    [clearAllFiles],
  );

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = getClipboardFiles(event.clipboardData);
    if (files.length === 0) {
      return;
    }
    event.preventDefault();
    handleUpload(files, { fromPaste: true });
  };

  return (
    <div className="flex w-full min-w-0 flex-col">
      <HiddenFileInput
        fileInputRef={fileInputRef}
        onChange={handleFileInputChange}
      />

      <div
        ref={chatContainerRef}
        className={cn(
          chatInputContainerClassName,
          "border border-[var(--oh-border-subtle)] bg-[var(--oh-surface-raised)]",
        )}
        onDragOver={(event) => handleDragOver(event, false)}
        onDragLeave={(event) => handleDragLeave(event, false)}
        onDrop={(event) => handleDrop(event, false)}
      >
        {isDragOver ? <DragOver /> : null}

        <UploadedFiles />

        <div className="relative w-full">
          <div className={chatInputRowClassName}>
            <div className="basis-0 box-border content-stretch flex min-h-px min-w-px grow flex-row items-end justify-start gap-4 p-0 relative shrink-0">
              <textarea
                data-testid="create-automation-prompt"
                name="prompt"
                value={prompt}
                onChange={(event) => onPromptChange(event.target.value)}
                onPaste={handlePaste}
                rows={4}
                required
                aria-label={t(I18nKey.AUTOMATIONS$PROMPT)}
                placeholder={t(I18nKey.AUTOMATIONS$CREATE_PROMPT_PLACEHOLDER)}
                className={chatInputTextareaClassName}
              />
            </div>
          </div>
        </div>

        <div className={chatInputActionsRowClassName}>
          <div className="flex min-w-0 items-center gap-1">
            <div className="flex min-w-0 items-center gap-3">
              <ChatAddFileButton
                handleFileIconClick={() => handleFileIconClick(false)}
              />
              <ChatInputModelControl />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
