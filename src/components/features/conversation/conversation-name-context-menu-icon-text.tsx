import { cn } from "#/utils/utils";
import { dropdownMenuRowIconClassName } from "#/utils/dropdown-classes";

interface ConversationNameContextMenuIconTextProps {
  icon: React.ReactNode;
  text: string;
  className?: string;
}

export function ConversationNameContextMenuIconText({
  icon,
  text,
  className,
}: ConversationNameContextMenuIconTextProps) {
  return (
    <div className={cn("flex min-w-0 w-full items-center gap-2", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center [&_svg]:text-current",
          dropdownMenuRowIconClassName,
        )}
        aria-hidden
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{text}</span>
    </div>
  );
}
