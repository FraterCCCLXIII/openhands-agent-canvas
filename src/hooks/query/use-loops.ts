import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LoopService from "#/api/loop-service/loop-service.api";
import { useActiveBackend } from "#/contexts/active-backend-context";
import type { LoopDefinition } from "#/types/loop";

export const LOOPS_QUERY_KEY = ["loops"] as const;
export const LOOP_DETAIL_QUERY_KEY = ["loop-detail"] as const;
export const LOOP_RUNS_QUERY_KEY = ["loop-runs"] as const;
export const LOOP_HEALTH_QUERY_KEY = ["loop-health"] as const;

interface UseLoopsOptions {
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

export function useLoopHealth(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const active = useActiveBackend();
  return useQuery({
    queryKey: [...LOOP_HEALTH_QUERY_KEY, active.backend.id, active.orgId],
    queryFn: () => LoopService.checkHealth(),
    staleTime: 30_000,
    enabled,
  });
}

export function useLoops(options: UseLoopsOptions = {}) {
  const { limit = 50, offset = 0, enabled = true } = options;
  const active = useActiveBackend();
  return useQuery({
    queryKey: [
      ...LOOPS_QUERY_KEY,
      { limit, offset },
      active.backend.id,
      active.orgId,
    ],
    queryFn: () => LoopService.listLoops({ limit, offset }),
    staleTime: 0,
    enabled,
  });
}

export function useLoopDetail(id: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const active = useActiveBackend();
  return useQuery({
    queryKey: [...LOOP_DETAIL_QUERY_KEY, id, active.backend.id, active.orgId],
    queryFn: () => LoopService.getLoop(id),
    enabled: enabled && Boolean(id),
  });
}

export function useLoopRuns(
  loopId: string,
  options: { limit?: number; enabled?: boolean } = {},
) {
  const { limit = 20, enabled = true } = options;
  const active = useActiveBackend();
  return useQuery({
    queryKey: [
      ...LOOP_RUNS_QUERY_KEY,
      loopId,
      { limit },
      active.backend.id,
      active.orgId,
    ],
    queryFn: () => LoopService.listLoopRuns(loopId, limit),
    enabled: enabled && Boolean(loopId),
  });
}

export function useCreateLoop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      body: Omit<
        LoopDefinition,
        "id" | "created_at" | "updated_at" | "last_triggered_at" | "inbox_count"
      >,
    ) => LoopService.createLoop(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOOPS_QUERY_KEY });
    },
  });
}

export function useToggleLoop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      LoopService.toggleLoop(id, enabled),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: LOOPS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...LOOP_DETAIL_QUERY_KEY, id],
      });
    },
  });
}

export function useDeleteLoop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => LoopService.deleteLoop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOOPS_QUERY_KEY });
    },
  });
}

export function useDispatchLoop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => LoopService.dispatchLoop(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [...LOOP_RUNS_QUERY_KEY, id] });
      queryClient.invalidateQueries({
        queryKey: [...LOOP_DETAIL_QUERY_KEY, id],
      });
    },
  });
}
