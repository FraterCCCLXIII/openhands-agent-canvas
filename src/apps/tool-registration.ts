import { memoryApp } from "#/apps/manifests";
import {
  isAppAvailable,
  resolveAgentToolNamesForApps,
  resolveToolModuleQualnames,
} from "#/apps/registry";
import { ODYSSEUS_TOKEN_SECRET_NAME, ODYSSEUS_URL_ENV } from "#/apps/types";
import { getOdysseusConnectionSettings } from "#/stores/odysseus-store";

const CANVAS_UI_TOOL_MODULE = "canvas_ui_tool";

export function isProductMemoryEnabled(): boolean {
  const { url, token, memoryEnabled } = getOdysseusConnectionSettings();
  return Boolean(url?.trim() && token?.trim() && memoryEnabled);
}

export function getProductAgentToolNames(): string[] {
  if (!isProductMemoryEnabled() || !isAppAvailable(memoryApp)) {
    return [];
  }
  return memoryApp.agentToolNames;
}

export function getOdysseusSecretNames(): string[] {
  if (!getOdysseusConnectionSettings().url?.trim()) {
    return [];
  }
  return [ODYSSEUS_TOKEN_SECRET_NAME, ODYSSEUS_URL_ENV];
}

export function buildAppToolModuleQualnames(
  enabledAppIds: Iterable<string>,
  includeProductMemory = isProductMemoryEnabled(),
): Record<string, string> {
  const appIds = new Set(enabledAppIds);
  if (includeProductMemory) {
    appIds.add("memory");
  }
  const qualnames = resolveToolModuleQualnames(appIds);
  if (qualnames.canvas_ui === undefined) {
    qualnames.canvas_ui = CANVAS_UI_TOOL_MODULE;
  }
  return qualnames;
}

export function resolveAllAgentToolNames(
  enabledWorkAppIds: Iterable<string>,
  includeProductMemory = isProductMemoryEnabled(),
): string[] {
  const appIds = new Set(enabledWorkAppIds);
  if (includeProductMemory) {
    appIds.add("memory");
  }
  return resolveAgentToolNamesForApps(appIds);
}
