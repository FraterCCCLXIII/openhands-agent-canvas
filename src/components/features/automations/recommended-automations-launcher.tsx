import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActiveBackend } from "#/contexts/active-backend-context";
import { useNavigation } from "#/context/navigation-context";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { useSettings } from "#/hooks/query/use-settings";
import { useIsCreatingConversation } from "#/hooks/use-is-creating-conversation";
import { useConversationStore } from "#/stores/conversation-store";
import {
  setConversationState,
  setPendingTaskDraft,
} from "#/utils/conversation-local-storage";
import type { RecommendedAutomation } from "@openhands/extensions/automations";
import { parseMcpConfig } from "#/utils/mcp-config";
import { flattenMcpConfig } from "#/utils/mcp-installed-servers";
import {
  INTEGRATION_CATALOG as INTEGRATION_MARKETPLACE,
  type IntegrationCatalogEntry as MarketplaceEntry,
} from "@openhands/extensions/integrations";
import {
  findInstalledMatch,
  getInstallableTemplate,
  getMarketplaceEntryById,
} from "#/utils/mcp-marketplace-utils";
import type { Provider } from "#/types/settings";
import { InstallServerModal } from "#/components/features/mcp-page/install-server-modal";
import { RecommendedAutomationsModal } from "./recommended-automations-modal";
import {
  HOME_RECOMMENDED_AUTOMATIONS_PREVIEW_LIMIT,
  RecommendedAutomationsSection,
  type RecommendedAutomationsSectionVariant,
} from "./recommended-automations-section";

interface RecommendedAutomationConversationVariables {
  workingDir?: string;
  repository?: {
    name: string;
    gitProvider: Provider;
    branch?: string;
  };
}

export interface RecommendedAutomationSourceSelection {
  hasSelection: boolean;
  launchWithoutSource: boolean;
  pendingAutomation: RecommendedAutomation | null;
  onRequireSelection: (automation: RecommendedAutomation) => void;
  onPendingAutomationHandled: () => void;
  getConversationVariables: () => RecommendedAutomationConversationVariables;
}

function isSourceSelectionSatisfied(
  sourceSelection?: RecommendedAutomationSourceSelection,
): boolean {
  if (!sourceSelection) return true;
  return sourceSelection.hasSelection || sourceSelection.launchWithoutSource;
}

interface RecommendedAutomationsLauncherProps {
  query?: string;
  onLaunched?: () => void;
  variant?: RecommendedAutomationsSectionVariant;
  sourceSelection?: RecommendedAutomationSourceSelection;
}

function getRequiredEntries(automation: RecommendedAutomation) {
  return automation.requiredIntegrationIds
    .map((id) => getMarketplaceEntryById(id, INTEGRATION_MARKETPLACE))
    .filter((entry): entry is MarketplaceEntry => !!entry);
}

/**
 * Augment the catalog prompt with explicit API instructions so the agent
 * calls the correct automation endpoint instead of guessing (e.g. calling
 * the cloud API when running locally, or vice-versa).
 */
function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

export function buildAutomationPrompt(
  basePrompt: string,
  backendKind: "local" | "cloud",
  backendHost?: string,
): string {
  if (backendKind === "cloud") {
    const endpoint = backendHost
      ? `POST ${trimTrailingSlashes(backendHost)}/api/automation/v1/preset/prompt`
      : "POST /api/automation/v1/preset/prompt on the active OpenHands Cloud backend";

    return [
      basePrompt,
      "",
      "---",
      "**Which API to use:** Create this automation using the active OpenHands Cloud Automations API.",
      `- Endpoint: \`${endpoint}\``,
      "- Auth: `Authorization: Bearer $OPENHANDS_API_KEY`",
    ].join("\n");
  }

  // Local backend — the automation sidecar URL is in <RUNTIME_SERVICES>.
  return [
    basePrompt,
    "",
    "---",
    "**Which API to use:** Create this automation using the **local** OpenHands Automations API that is running alongside this agent.",
    "- Read the Automation backend URL from the `<RUNTIME_SERVICES>` block in your system context.",
    "- Endpoint path: `POST /api/automation/v1/preset/prompt`",
    "- Auth: `X-API-Key: $OPENHANDS_AUTOMATION_API_KEY`",
    "- If no local Automation backend is listed in `<RUNTIME_SERVICES>`, stop and ask me to start the full local automation stack instead of using any remote/cloud automation API.",
  ].join("\n");
}

export function RecommendedAutomationsLauncher({
  query,
  onLaunched,
  variant = "default",
  sourceSelection,
}: RecommendedAutomationsLauncherProps) {
  const activeBackend = useActiveBackend();
  const { navigate } = useNavigation();
  const { data: settings } = useSettings();
  const createConversation = useCreateConversation();
  const isCreatingConversation = useIsCreatingConversation();
  const setMessageToSend = useConversationStore(
    (state) => state.setMessageToSend,
  );
  const [pendingAutomation, setPendingAutomation] =
    useState<RecommendedAutomation | null>(null);
  const [installQueue, setInstallQueue] = useState<MarketplaceEntry[]>([]);
  const [isAllAutomationsModalOpen, setIsAllAutomationsModalOpen] =
    useState(false);
  const completedInstallRef = useRef(false);
  const launchInFlightRef = useRef(false);
  const isHomeVariant = variant === "home";

  const installedMcpServers = useMemo(
    () =>
      flattenMcpConfig(parseMcpConfig(settings?.agent_settings?.mcp_config)),
    [settings?.agent_settings?.mcp_config],
  );

  const launchAutomation = useCallback(
    (automation: RecommendedAutomation) => {
      if (
        launchInFlightRef.current ||
        createConversation.isPending ||
        isCreatingConversation
      ) {
        return;
      }

      if (sourceSelection && !isSourceSelectionSatisfied(sourceSelection)) {
        sourceSelection.onRequireSelection(automation);
        return;
      }

      launchInFlightRef.current = true;

      const prompt = buildAutomationPrompt(
        automation.prompt,
        activeBackend.backend.kind,
        activeBackend.backend.host,
      );

      createConversation.mutate(
        sourceSelection?.getConversationVariables() ?? {},
        {
          onSuccess: (conversation) => {
            if (
              conversation.conversation_id.startsWith("task-") &&
              conversation.task_id
            ) {
              setPendingTaskDraft(conversation.task_id, prompt);
            } else {
              setConversationState(conversation.conversation_id, {
                draftMessage: prompt,
              });
            }
            onLaunched?.();
            navigate?.(`/conversations/${conversation.conversation_id}`);
            window.setTimeout(() => setMessageToSend(prompt), 0);
          },
          onError: () => {
            launchInFlightRef.current = false;
          },
        },
      );
    },
    [
      activeBackend.backend.host,
      activeBackend.backend.kind,
      createConversation,
      isCreatingConversation,
      navigate,
      onLaunched,
      setMessageToSend,
      sourceSelection,
    ],
  );

  useEffect(() => {
    if (!sourceSelection) return;

    const { pendingAutomation, onPendingAutomationHandled } = sourceSelection;

    if (!pendingAutomation || !isSourceSelectionSatisfied(sourceSelection))
      return;
    if (
      launchInFlightRef.current ||
      createConversation.isPending ||
      isCreatingConversation ||
      installQueue.length > 0
    ) {
      return;
    }

    onPendingAutomationHandled();
    launchAutomation(pendingAutomation);
  }, [
    createConversation.isPending,
    installQueue.length,
    isCreatingConversation,
    launchAutomation,
    sourceSelection?.hasSelection,
    sourceSelection?.launchWithoutSource,
    sourceSelection?.pendingAutomation,
  ]);

  const getMissingEntries = useCallback(
    (automation: RecommendedAutomation) =>
      getRequiredEntries(automation).filter((entry) => {
        const template = getInstallableTemplate(entry);
        return !template || !findInstalledMatch(template, installedMcpServers);
      }),
    [installedMcpServers],
  );

  const handleSelectAutomation = (automation: RecommendedAutomation) => {
    setIsAllAutomationsModalOpen(false);

    if (
      launchInFlightRef.current ||
      createConversation.isPending ||
      isCreatingConversation ||
      installQueue.length > 0
    ) {
      return;
    }

    const missingEntries = getMissingEntries(automation);
    if (missingEntries.length === 0) {
      launchAutomation(automation);
      return;
    }

    setPendingAutomation(automation);
    setInstallQueue(missingEntries);
  };

  const cancelInstallFlow = () => {
    if (completedInstallRef.current) {
      completedInstallRef.current = false;
      return;
    }
    setPendingAutomation(null);
    setInstallQueue([]);
  };

  const handleInstallSuccess = () => {
    completedInstallRef.current = true;

    setInstallQueue((currentQueue) => {
      const nextQueue = currentQueue.slice(1);

      if (nextQueue.length === 0) {
        const automation = pendingAutomation;
        window.setTimeout(() => {
          setPendingAutomation(null);
          if (automation) launchAutomation(automation);
        }, 0);
      }

      return nextQueue;
    });
  };

  const installEntry = installQueue[0] ?? null;
  const automationRecommendationsEnabled =
    settings?.enable_automation_recommendations ?? true;

  // Recommended automations are a local-backend-only feature; cloud
  // automations are managed elsewhere.
  if (activeBackend.backend.kind === "cloud") return null;
  if (!automationRecommendationsEnabled) return null;

  return (
    <>
      <RecommendedAutomationsSection
        backendKind={activeBackend.backend.kind}
        installedServers={installedMcpServers}
        query={query}
        onSelect={handleSelectAutomation}
        variant={variant}
        limit={
          isHomeVariant ? HOME_RECOMMENDED_AUTOMATIONS_PREVIEW_LIMIT : undefined
        }
        onViewMore={
          isHomeVariant ? () => setIsAllAutomationsModalOpen(true) : undefined
        }
      />

      {isAllAutomationsModalOpen ? (
        <RecommendedAutomationsModal
          backendKind={activeBackend.backend.kind}
          installedServers={installedMcpServers}
          onClose={() => setIsAllAutomationsModalOpen(false)}
          onSelect={handleSelectAutomation}
        />
      ) : null}

      {installEntry && (
        <InstallServerModal
          key={installEntry.id}
          entry={installEntry}
          onClose={cancelInstallFlow}
          onSuccess={handleInstallSuccess}
        />
      )}
    </>
  );
}
