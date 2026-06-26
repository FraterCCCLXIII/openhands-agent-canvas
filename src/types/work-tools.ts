import {
  getAppById,
  getAvailableWorkApps,
  getDefaultEnabledWorkAppIds,
  isAppAvailable,
  isKnownAppId,
  migrateLegacyWorkToolIds,
  parseEnabledAppIds,
  resolveAgentToolNamesForApps,
  serializeEnabledAppIds,
} from "#/apps/registry";
import type { AppManifest } from "#/apps/types";
import { WORK_ENABLED_APPS_TAG } from "#/apps/types";

/** @deprecated Use WORK_ENABLED_APPS_TAG — kept for backward compatibility. */
export const WORK_ENABLED_TOOLS_TAG = WORK_ENABLED_APPS_TAG;

/** Self-closing tag the agent emits to request an optional Work app. */
export const WORK_TOOL_REQUEST_TAG = "WORK_APP_REQUEST";
export const WORK_APP_REQUEST_TAG = WORK_TOOL_REQUEST_TAG;

export type WorkOptionalToolId = string;

export interface WorkOptionalToolDefinition {
  id: WorkOptionalToolId;
  agentToolName: string;
  labelKey: string;
  descriptionKey: string;
}

export const WORK_BASE_TOOL_NAMES = [
  "file_editor",
  "task_tracker",
  "canvas_ui",
] as const;

function appToOptionalTool(app: AppManifest): WorkOptionalToolDefinition {
  return {
    id: app.id,
    agentToolName: app.agentToolNames[0] ?? app.id,
    labelKey: `APPS$${app.id.toUpperCase()}_LABEL`,
    descriptionKey: app.descriptionKey,
  };
}

export function getWorkOptionalToolsCatalog(): WorkOptionalToolDefinition[] {
  return getAvailableWorkApps().map(appToOptionalTool);
}

export function isKnownWorkOptionalToolId(
  value: string,
): value is WorkOptionalToolId {
  return isKnownAppId(value);
}

export function isWorkOptionalToolAvailable(
  toolId: WorkOptionalToolId,
): boolean {
  const app = getAppById(toolId);
  return Boolean(app && isAppAvailable(app));
}

export function getAvailableWorkOptionalTools(): WorkOptionalToolDefinition[] {
  return getAvailableWorkApps().map(appToOptionalTool);
}

export function serializeWorkOptionalToolIds(ids: string[]): string {
  return serializeEnabledAppIds(migrateLegacyWorkToolIds(ids));
}

export function parseWorkOptionalToolIds(
  raw?: string | null,
): WorkOptionalToolId[] {
  return parseEnabledAppIds(raw);
}

export function resolveWorkAgentToolNames(
  enabledOptionalToolIds: Iterable<string>,
): string[] {
  const names = new Set<string>(WORK_BASE_TOOL_NAMES);
  for (const toolName of resolveAgentToolNamesForApps(
    migrateLegacyWorkToolIds(Array.from(enabledOptionalToolIds)),
  )) {
    names.add(toolName);
  }
  return Array.from(names);
}

export interface WorkToolRequest {
  toolId: WorkOptionalToolId;
  reason: string;
}

const WORK_TOOL_REQUEST_PATTERN =
  /<WORK_(?:TOOL|APP)_REQUEST\s+(?:tool|app)="([^"]+)"(?:\s+reason="([^"]*)")?\s*\/?>/gi;

export function parseWorkToolRequests(text: string): WorkToolRequest[] {
  const requests: WorkToolRequest[] = [];
  const pattern = new RegExp(WORK_TOOL_REQUEST_PATTERN.source, "gi");
  let match = pattern.exec(text);

  while (match) {
    const toolId = match[1];
    if (isKnownWorkOptionalToolId(toolId)) {
      requests.push({
        toolId,
        reason: match[2]?.trim() ?? "",
      });
    }
    match = pattern.exec(text);
  }

  return requests;
}

export function stripWorkToolRequests(text: string): string {
  return text.replace(WORK_TOOL_REQUEST_PATTERN, "").trim();
}

export function getWorkOptionalToolDefinition(toolId: WorkOptionalToolId) {
  const app = getAppById(toolId);
  return app ? appToOptionalTool(app) : undefined;
}

export function getDefaultWorkEnabledAppIds(): string[] {
  return getDefaultEnabledWorkAppIds();
}

export { parseEnabledAppIds, serializeEnabledAppIds };
