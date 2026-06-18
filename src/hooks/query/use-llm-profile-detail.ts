import { useQuery } from "@tanstack/react-query";

import ProfilesService from "#/api/profiles-service/profiles-service.api";
import { useActiveBackend } from "#/contexts/active-backend-context";
import {
  CONFIG_CACHE_OPTIONS,
  LLM_PROFILES_QUERY_KEYS,
} from "#/hooks/query/query-keys";

interface UseLlmProfileDetailOptions {
  enabled?: boolean;
}

export function useLlmProfileDetail(
  profileName: string | null,
  options: UseLlmProfileDetailOptions = {},
) {
  const { backend, orgId } = useActiveBackend();

  return useQuery({
    queryKey: [
      ...LLM_PROFILES_QUERY_KEYS.all,
      "detail",
      profileName,
      backend.id,
      orgId,
    ],
    queryFn: () => ProfilesService.getProfile(profileName as string),
    enabled: (options.enabled ?? true) && !!profileName,
    ...CONFIG_CACHE_OPTIONS,
    meta: { disableToast: true },
  });
}
