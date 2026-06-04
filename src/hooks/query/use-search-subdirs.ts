import { useQuery } from "@tanstack/react-query";
import { FileClient } from "@openhands/typescript-client/clients";
import { getAgentServerClientOptions } from "#/api/agent-server-client-options";
import { useActiveBackend } from "#/contexts/active-backend-context";

export interface FileBrowserEntry {
  label: string;
  path: string;
}

export interface HomeDirectoryResponse {
  home: string;
  favorites?: FileBrowserEntry[];
  locations?: FileBrowserEntry[];
}

function getFileClient() {
  return new FileClient(getAgentServerClientOptions());
}

export const useSearchSubdirs = (path: string | null) => {
  const active = useActiveBackend();
  return useQuery({
    queryKey: ["file", "search_subdirs", path, active.backend.id, active.orgId],
    queryFn: () => getFileClient().searchSubdirectories(path as string),
    enabled: !!path,
    retry: false,
    meta: { disableToast: true },
  });
};

export const useHomeDirectory = () => {
  const active = useActiveBackend();
  return useQuery({
    queryKey: ["file", "home", active.backend.id, active.orgId],
    queryFn: async (): Promise<HomeDirectoryResponse> =>
      getFileClient().getHome(),
    // The agent-server stack can still be booting when this first runs (the
    // desktop app loads the UI as soon as the ingress is reachable). Without
    // retries a single early "Failed to fetch" would be cached and leave the
    // workspace browser permanently empty, so retry a few times with backoff
    // and keep the result only briefly so reopening the browser re-checks.
    retry: 4,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    meta: { disableToast: true },
    staleTime: 60_000,
  });
};
