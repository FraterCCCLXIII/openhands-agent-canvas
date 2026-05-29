import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Provider } from "#/types/settings";
import { usePaginatedConversations } from "#/hooks/query/use-paginated-conversations";
import type { AppConversation } from "#/api/conversation-service/agent-server-conversation-service.types";
import {
  buildColumnsFromConversations,
  collectRepositories,
  collectRepositoryProviders,
} from "./conversation-mapper";
import { useWorkbenchArchiveStore } from "./use-workbench-archive-store";
import type { WorkbenchColumn } from "./types";

const PAGE_SIZE = 50;

export interface WorkbenchData {
  columns: WorkbenchColumn[];
  /** Distinct repository names across all loaded conversations. */
  repositories: string[];
  /** Repository name -> git provider, for repositories that report one. */
  repositoryProviders: Map<string, Provider>;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

/**
 * Reads real agent-server conversations and projects them onto the Workbench
 * kanban model: status columns, the distinct repository list, and a
 * repo->provider map for starting new conversations.
 */
export function useWorkbenchData(): WorkbenchData {
  const { t } = useTranslation("openhands");
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = usePaginatedConversations(PAGE_SIZE);

  const archivedIds = useWorkbenchArchiveStore((state) => state.archivedIds);

  const conversations = useMemo<AppConversation[]>(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const archivedIdSet = useMemo(() => new Set(archivedIds), [archivedIds]);

  const columns = useMemo(
    () => buildColumnsFromConversations(t, conversations, archivedIdSet),
    [t, conversations, archivedIdSet],
  );
  const repositories = useMemo(() => collectRepositories(columns), [columns]);
  const repositoryProviders = useMemo(
    () => collectRepositoryProviders(conversations),
    [conversations],
  );

  return {
    columns,
    repositories,
    repositoryProviders,
    isLoading,
    isError,
    hasNextPage: Boolean(hasNextPage),
    isFetchingNextPage,
    fetchNextPage: () => fetchNextPage(),
  };
}
