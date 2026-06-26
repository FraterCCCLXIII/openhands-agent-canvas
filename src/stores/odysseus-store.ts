import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OdysseusConnectionSettings } from "#/apps/types";

interface OdysseusStore extends OdysseusConnectionSettings {
  setUrl: (url: string | null) => void;
  setToken: (token: string | null) => void;
  setMemoryEnabled: (enabled: boolean) => void;
  setMemoryInjectOnStart: (enabled: boolean) => void;
  isConnected: () => boolean;
}

export const useOdysseusStore = create<OdysseusStore>()(
  persist(
    (set, get) => ({
      url: null,
      token: null,
      memoryEnabled: false,
      memoryInjectOnStart: true,
      setUrl: (url) => set({ url: url?.trim() || null }),
      setToken: (token) => set({ token: token?.trim() || null }),
      setMemoryEnabled: (memoryEnabled) => set({ memoryEnabled }),
      setMemoryInjectOnStart: (memoryInjectOnStart) =>
        set({ memoryInjectOnStart }),
      isConnected: () => Boolean(get().url?.trim() && get().token?.trim()),
    }),
    { name: "openhands-odysseus" },
  ),
);

export function getOdysseusConnectionSettings(): OdysseusConnectionSettings {
  const state = useOdysseusStore.getState();
  return {
    url: state.url,
    token: state.token,
    memoryEnabled: state.memoryEnabled,
    memoryInjectOnStart: state.memoryInjectOnStart,
  };
}
