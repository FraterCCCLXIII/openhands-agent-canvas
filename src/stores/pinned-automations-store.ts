import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PinnedAutomationsState {
  pinsByBackendId: Record<string, string[]>;
}

interface PinnedAutomationsActions {
  pinAutomation: (backendId: string, automationId: string) => void;
  unpinAutomation: (backendId: string, automationId: string) => void;
  togglePin: (backendId: string, automationId: string) => void;
  pruneMissingAutomations: (
    backendId: string,
    existingIds: readonly string[],
  ) => void;
}

type PinnedAutomationsStore = PinnedAutomationsState & PinnedAutomationsActions;

const initialState: PinnedAutomationsState = {
  pinsByBackendId: {},
};

function getPinsForBackend(
  pinsByBackendId: Record<string, string[]>,
  backendId: string,
): string[] {
  return pinsByBackendId[backendId] ?? [];
}

export const usePinnedAutomationsStore = create<PinnedAutomationsStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      pinAutomation: (backendId, automationId) => {
        const current = getPinsForBackend(get().pinsByBackendId, backendId);
        if (current.includes(automationId)) {
          return;
        }
        set((state) => ({
          pinsByBackendId: {
            ...state.pinsByBackendId,
            [backendId]: [automationId, ...current],
          },
        }));
      },

      unpinAutomation: (backendId, automationId) => {
        const current = getPinsForBackend(get().pinsByBackendId, backendId);
        if (!current.includes(automationId)) {
          return;
        }
        set((state) => ({
          pinsByBackendId: {
            ...state.pinsByBackendId,
            [backendId]: current.filter((id) => id !== automationId),
          },
        }));
      },

      togglePin: (backendId, automationId) => {
        const current = getPinsForBackend(get().pinsByBackendId, backendId);
        if (current.includes(automationId)) {
          get().unpinAutomation(backendId, automationId);
        } else {
          get().pinAutomation(backendId, automationId);
        }
      },

      pruneMissingAutomations: (backendId, existingIds) => {
        const existing = new Set(existingIds);
        const current = getPinsForBackend(get().pinsByBackendId, backendId);
        const pruned = current.filter((id) => existing.has(id));
        if (pruned.length === current.length) {
          return;
        }
        set((state) => ({
          pinsByBackendId: {
            ...state.pinsByBackendId,
            [backendId]: pruned,
          },
        }));
      },
    }),
    {
      name: "pinned-automations",
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PinnedAutomationsState => ({
        pinsByBackendId: state.pinsByBackendId,
      }),
    },
  ),
);
