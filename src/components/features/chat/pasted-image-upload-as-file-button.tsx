import { Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ChatActionTooltip } from "#/components/features/chat/chat-action-tooltip";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";

interface PastedImageUploadAsFileButtonProps {
  active: boolean;
  onToggle: () => void;
}

export function PastedImageUploadAsFileButton({
  active,
  onToggle,
}: PastedImageUploadAsFileButtonProps) {
  const { t } = useTranslation("openhands");
  return (
    <ChatActionTooltip
      tooltip={t(I18nKey.CHAT_INTERFACE$UPLOAD_IMAGES_AS_FILES)}
      ariaLabel={t(I18nKey.CHAT_INTERFACE$UPLOAD_IMAGES_AS_FILES)}
    >
      <button
        type="button"
        aria-pressed={active}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          "absolute bottom-0.5 left-0.5 z-10 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--oh-border)] shadow-sm transition-colors cursor-pointer",
          active
            ? "bg-[var(--oh-primary)] text-[var(--oh-primary-foreground)] border-transparent"
            : "bg-[var(--oh-surface)]/95 text-[var(--oh-foreground)] hover:bg-[var(--oh-interactive-hover)]",
        )}
      >
        <Upload className="h-3 w-3" strokeWidth={2.5} aria-hidden />
      </button>
    </ChatActionTooltip>
  );
}
