import { ContextMenuListItem } from "#/components/features/context-menu/context-menu-list-item";
import { cn } from "#/utils/utils";
import { dropdownMenuRowIconClassName } from "#/utils/dropdown-classes";

interface ServerStatusContextMenuIconTextProps {
  icon: React.ReactNode;
  text: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  testId?: string;
}

export function ServerStatusContextMenuIconText({
  icon,
  text,
  onClick,
  testId,
}: ServerStatusContextMenuIconTextProps) {
  return (
    <ContextMenuListItem testId={testId} onClick={onClick}>
      <div className="flex min-w-0 w-full items-center justify-between gap-2">
        <span className="min-w-0 truncate">{text}</span>
        <span
          className={cn(
            "flex shrink-0 items-center [&_svg]:text-current",
            dropdownMenuRowIconClassName,
          )}
          aria-hidden
        >
          {icon}
        </span>
      </div>
    </ContextMenuListItem>
  );
}
