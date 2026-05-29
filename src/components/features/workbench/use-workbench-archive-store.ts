import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "workbench-archived-conversations";

interface WorkbenchArchiveState {
  /** Conversation ids the user has archived from the Workbench board. */
  archivedIds: string[];
}

interface WorkbenchArchiveActions {
  archive: (conversationId: string) => void;
}

type WorkbenchArchiveStore = WorkbenchArchiveState & WorkbenchArchiveActions;

/**
 * Persisted set of conversations the user has archived in the Workbench.
 *
 * Archiving is intentionally one-way: there is no un-archive action, so an
 * archived conversation stays in the Archived column. The conversation itself
 * is never deleted on the agent-server — the archive is a client-side view
 * preference, persisted to localStorage like the other workbench/panel stores.
 */
export const useWorkbenchArchiveStore = create<WorkbenchArchiveStore>()(
  persist(
    (set) => ({
      archivedIds: [],
      archive: (conversationId) =>
        set((state) =>
          state.archivedIds.includes(conversationId)
            ? state
            : { archivedIds: [...state.archivedIds, conversationId] },
        ),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): WorkbenchArchiveState => ({
        archivedIds: state.archivedIds,
      }),
    },
  ),
);
