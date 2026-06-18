import { useMutation, useQueryClient } from "@tanstack/react-query";

import AgentServerConversationService from "#/api/conversation-service/agent-server-conversation-service.api";
import ProfilesService from "#/api/profiles-service/profiles-service.api";
import SettingsService from "#/api/settings-service/settings-service.api";
import type { ReasoningEffort } from "#/constants/reasoning-effort";
import { invalidateConversationQueries } from "#/hooks/mutation/conversation-mutation-utils";
import {
  LLM_PROFILES_QUERY_KEYS,
  SETTINGS_QUERY_KEYS,
} from "#/hooks/query/query-keys";

interface UpdateReasoningEffortVariables {
  profileName: string;
  effort: ReasoningEffort;
  conversationId: string | null;
}

/**
 * Persists reasoning effort on the named profile and applies it to the
 * running conversation (via profile re-switch) or globally (via activate).
 */
export function useUpdateReasoningEffort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileName,
      effort,
      conversationId,
    }: UpdateReasoningEffortVariables) => {
      const profile = await ProfilesService.getProfile(profileName);
      const model =
        typeof profile.config.model === "string" ? profile.config.model : "";
      if (!model) {
        throw new Error(`Profile '${profileName}' has no model.`);
      }
      await ProfilesService.saveProfile(profileName, {
        llm: {
          ...profile.config,
          model,
          reasoning_effort: effort,
        },
      });
      await AgentServerConversationService.switchProfile(
        conversationId,
        profileName,
      );
    },
    onSuccess: (_data, { conversationId, profileName }) => {
      void queryClient.invalidateQueries({
        queryKey: LLM_PROFILES_QUERY_KEYS.all,
      });
      if (conversationId) {
        invalidateConversationQueries(queryClient, conversationId);
      } else {
        SettingsService.invalidateCache();
        void queryClient.invalidateQueries({
          queryKey: SETTINGS_QUERY_KEYS.personal(),
        });
        void queryClient.invalidateQueries({
          queryKey: [...LLM_PROFILES_QUERY_KEYS.all, "detail", profileName],
        });
      }
    },
    meta: { disableToast: true },
  });
}
