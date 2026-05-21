import { Pre } from "#/ui/pre";

interface SystemMessageContentProps {
  content: string;
}

export function SystemMessageContent({ content }: SystemMessageContentProps) {
  return (
    <div className="p-3">
      <Pre
        size="small"
        font="mono"
        lineHeight="relaxed"
        padding="medium"
        borderRadius="medium"
        overflow="auto"
        className="border border-[var(--oh-border)] bg-base text-[var(--oh-text-tertiary)]"
      >
        {content}
      </Pre>
    </div>
  );
}
