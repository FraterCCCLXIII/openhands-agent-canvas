import { useTranslation } from "react-i18next";
import { FolderGit2, FolderX, Layers3, type LucideIcon } from "lucide-react";
import { I18nKey } from "#/i18n/declaration";
import { cn } from "#/utils/utils";
import { ALL_REPOSITORIES, NO_REPOSITORY } from "./types";

export interface WorkspaceRailItem {
  id: string;
  label: string;
  repoKey: string;
}

interface WorkspaceRailProps {
  items: WorkspaceRailItem[];
  activeRepo: string;
  isOpen: boolean;
  onSelect: (repoKey: string) => void;
}

function getRailIcon(repoKey: string): LucideIcon {
  if (repoKey === ALL_REPOSITORIES) return Layers3;
  if (repoKey === NO_REPOSITORY) return FolderX;
  return FolderGit2;
}

export function WorkspaceRail({
  items,
  activeRepo,
  isOpen,
  onSelect,
}: WorkspaceRailProps) {
  const { t } = useTranslation("openhands");

  return (
    <aside
      data-testid="workbench-workspace-rail"
      aria-hidden={!isOpen}
      aria-label={t(I18nKey.WORKBENCH$WORKSPACES)}
      className={cn(
        "relative z-10 flex h-full min-h-0 shrink-0 flex-col overflow-hidden bg-base transition-[width] duration-200",
        isOpen
          ? "w-64 px-3 py-4"
          : "pointer-events-none w-0 min-w-0 max-w-0 px-0",
      )}
    >
      <h2 className="mb-3 ml-1 shrink-0 text-lg font-medium text-white">
        {t(I18nKey.SIDEBAR$WORKBENCH)}
      </h2>
      <nav
        className="flex min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden whitespace-nowrap custom-scrollbar"
        aria-label={t(I18nKey.WORKBENCH$WORKSPACES)}
      >
        {items.map((item) => {
          const isActive = activeRepo === item.repoKey;
          const Icon = getRailIcon(item.repoKey);
          return (
            <button
              key={item.id}
              type="button"
              data-testid="workbench-workspace-item"
              onClick={() => onSelect(item.repoKey)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex h-9 w-full min-w-0 items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors",
                isActive
                  ? "bg-surface-raised text-white"
                  : "text-tertiary-light hover:bg-surface-raised hover:text-white",
              )}
            >
              <Icon
                width={18}
                height={18}
                className={cn(
                  "shrink-0",
                  isActive
                    ? "text-white"
                    : "text-tertiary-light group-hover:text-white",
                )}
                aria-hidden
              />
              <span className="min-w-0 truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
