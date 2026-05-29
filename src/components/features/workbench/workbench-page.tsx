import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { WorkspaceRail, type WorkspaceRailItem } from "./workspace-rail";
import { WorkbenchBoard } from "./workbench-board";
import { useWorkbenchData } from "./use-workbench-data";
import { ALL_REPOSITORIES, NO_REPOSITORY } from "./types";

/**
 * Workbench — a kanban view of agent conversations grouped by execution
 * status, with a repository filter rail. Backed by real agent-server
 * conversations via `useWorkbenchData`.
 */
export function WorkbenchPage() {
  const { t } = useTranslation("openhands");
  const isCloud = useActiveBackend().backend.kind === "cloud";
  const data = useWorkbenchData();
  const [activeRepo, setActiveRepo] = useState<string>(ALL_REPOSITORIES);
  const [isRailOpen, setIsRailOpen] = useState(true);

  // Local backends group by attached workspace; cloud backends group by repo.
  const catchAllLabel = t(
    isCloud ? I18nKey.WORKBENCH$NO_REPOSITORY : I18nKey.WORKBENCH$NO_WORKSPACE,
  );

  const railItems = useMemo<WorkspaceRailItem[]>(() => {
    const namedRepos = data.repositories.filter(
      (repo) => repo !== NO_REPOSITORY,
    );
    const hasUnassigned = data.repositories.includes(NO_REPOSITORY);
    return [
      {
        id: ALL_REPOSITORIES,
        label: t(I18nKey.WORKBENCH$VIEW_ALL),
        repoKey: ALL_REPOSITORIES,
      },
      ...namedRepos.map((repo) => ({ id: repo, label: repo, repoKey: repo })),
      ...(hasUnassigned
        ? [
            {
              id: "no-repository",
              label: catchAllLabel,
              repoKey: NO_REPOSITORY,
            },
          ]
        : []),
    ];
  }, [t, data.repositories, catchAllLabel]);

  return (
    <div
      data-testid="workbench-page"
      className="flex h-full min-h-0 bg-base text-white"
    >
      <WorkspaceRail
        items={railItems}
        activeRepo={activeRepo}
        isOpen={isRailOpen}
        onSelect={setActiveRepo}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <WorkbenchBoard
          {...data}
          activeRepo={activeRepo}
          isRailOpen={isRailOpen}
          onToggleRail={() => setIsRailOpen((prev) => !prev)}
        />
      </main>
    </div>
  );
}
