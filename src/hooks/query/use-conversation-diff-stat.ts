import { useQuery } from "@tanstack/react-query";
import AgentServerGitService from "#/api/git-service/agent-server-git-service.api";
import { getGitPath } from "#/utils/get-git-path";
import type { GitChangeDiff } from "#/api/open-hands.types";

export interface ConversationDiffStat {
  additions: number;
  deletions: number;
  filesChanged: number;
}

interface UseConversationDiffStatParams {
  conversationId: string | null | undefined;
  conversationUrl: string | null | undefined;
  sessionApiKey: string | null | undefined;
  selectedRepository: string | null | undefined;
  workingDir: string | null | undefined;
  /** Gate the (potentially N-request) fetch; callers should only enable when needed. */
  enabled?: boolean;
}

// Above this many lines we skip the O(n*m) line-LCS and fall back to a coarse
// estimate, so a single huge file can't lock up the main thread.
const MAX_LCS_LINES = 4000;

/** Length of the longest common subsequence of two line arrays. */
function lcsLength(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  if (a.length > MAX_LCS_LINES || b.length > MAX_LCS_LINES) {
    // Coarse fallback: treat the shorter file as fully retained.
    return Math.min(a.length, b.length);
  }
  let prev = new Array<number>(b.length + 1).fill(0);
  let curr = new Array<number>(b.length + 1).fill(0);
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1] + 1
          : Math.max(prev[j], curr[j - 1]);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** Added/removed line counts for a single file diff. */
function countDiff(diff: GitChangeDiff & { diff?: string }): {
  additions: number;
  deletions: number;
} {
  // Prefer a unified diff string when the runtime provides one — it's exact.
  if (diff.diff) {
    let additions = 0;
    let deletions = 0;
    diff.diff.split("\n").forEach((line) => {
      if (line.startsWith("+") && !line.startsWith("+++")) additions += 1;
      else if (line.startsWith("-") && !line.startsWith("---")) deletions += 1;
    });
    return { additions, deletions };
  }

  const original = diff.original ? diff.original.split("\n") : [];
  const modified = diff.modified ? diff.modified.split("\n") : [];
  const common = lcsLength(original, modified);
  return {
    additions: modified.length - common,
    deletions: original.length - common,
  };
}

/**
 * Aggregate +/- line counts across all of a conversation's git changes.
 *
 * There is no numstat endpoint, so this fetches the change list and each
 * (non-deleted) file's diff, counting added/removed lines client-side. It is
 * therefore an N-request fetch — callers must gate it via `enabled` (e.g. only
 * for the open drawer or for cards currently in view).
 */
export function useConversationDiffStat({
  conversationId,
  conversationUrl,
  sessionApiKey,
  selectedRepository,
  workingDir,
  enabled = true,
}: UseConversationDiffStatParams) {
  const gitPath = getGitPath(selectedRepository, workingDir?.trim());

  return useQuery<ConversationDiffStat>({
    queryKey: [
      "conversation_diff_stat",
      conversationId,
      conversationUrl,
      sessionApiKey,
      gitPath,
    ],
    enabled: Boolean(enabled && conversationId),
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    meta: { disableToast: true },
    queryFn: async () => {
      const changes = await AgentServerGitService.getGitChanges(
        conversationUrl,
        sessionApiKey,
        gitPath,
      );
      if (!Array.isArray(changes) || changes.length === 0) {
        return { additions: 0, deletions: 0, filesChanged: 0 };
      }

      const perFile = await Promise.all(
        changes.map(async (change) => {
          // Deleted files no longer exist on disk; the diff endpoint 400s.
          if (change.status === "D") return { additions: 0, deletions: 0 };
          try {
            const diff = (await AgentServerGitService.getGitChangeDiff(
              conversationUrl,
              sessionApiKey,
              `${gitPath}/${change.path}`,
            )) as GitChangeDiff & { diff?: string };
            return countDiff(diff);
          } catch {
            return { additions: 0, deletions: 0 };
          }
        }),
      );

      return perFile.reduce<ConversationDiffStat>(
        (acc, file) => ({
          additions: acc.additions + file.additions,
          deletions: acc.deletions + file.deletions,
          filesChanged: acc.filesChanged,
        }),
        { additions: 0, deletions: 0, filesChanged: changes.length },
      );
    },
  });
}
