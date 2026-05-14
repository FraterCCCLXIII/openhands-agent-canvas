import { useActiveConversation } from "#/hooks/query/use-active-conversation";
import ChevronDownSmallIcon from "#/icons/chevron-down-small.svg?react";
import { useClickOutsideElement } from "#/hooks/use-click-outside-element";
import { ContextMenu } from "#/ui/context-menu";
import { cn } from "#/utils/utils";
import React from "react";

const MODEL_LABEL_MAX_CHARS = 10;

function truncateModelLabel(model: string): string {
  if (model.length <= MODEL_LABEL_MAX_CHARS) {
    return model;
  }
  return `${model.slice(0, MODEL_LABEL_MAX_CHARS)}…`;
}

export function ChatInputModel() {
  const { data: conversation } = useActiveConversation();
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  const popoverRef = useClickOutsideElement<HTMLUListElement>(() => {
    setIsPopoverOpen(false);
  });

  if (!conversation?.llm_model) {
    return null;
  }
  const truncatedModelLabel = truncateModelLabel(conversation.llm_model);

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-[100px] border border-transparent px-1.5 text-sm font-normal leading-5 text-[#959CB2] whitespace-nowrap min-w-0 transition-[border-color,color]",
          "hover:border-[#4B505F] hover:text-white cursor-pointer",
        )}
        title={conversation.llm_model}
        data-testid="chat-input-llm-model"
        aria-expanded={isPopoverOpen}
        aria-haspopup="dialog"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsPopoverOpen((open) => !open);
        }}
      >
        <span>{truncatedModelLabel}</span>
        <ChevronDownSmallIcon
          width={18}
          height={18}
          color="currentColor"
          className="shrink-0"
          aria-hidden
        />
      </button>

      {isPopoverOpen && (
        <ContextMenu
          ref={popoverRef}
          testId="chat-input-llm-model-popover"
          position="top"
          alignment="right"
          spacing="none"
          className="z-[60] mb-2 max-w-[320px] p-3"
        >
          <li className="text-xs leading-5 text-white break-all">
            {conversation.llm_model}
          </li>
        </ContextMenu>
      )}
    </div>
  );
}
