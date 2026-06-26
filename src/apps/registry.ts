import { isAgentServerToolAvailable } from "#/api/agent-server-compatibility";
import {
  browserApp,
  calendarApp,
  contactsApp,
  documentsApp,
  emailApp,
  memoryApp,
  notesApp,
  researchApp,
  scheduledTasksApp,
} from "#/apps/manifests";
import type { AppManifest, AppScope } from "#/apps/types";

const ALL_APPS: AppManifest[] = [
  memoryApp,
  notesApp,
  emailApp,
  calendarApp,
  contactsApp,
  documentsApp,
  researchApp,
  scheduledTasksApp,
  browserApp,
];

const APP_BY_ID = new Map(ALL_APPS.map((app) => [app.id, app]));

function browserToolsEnabled() {
  return import.meta.env.VITE_ENABLE_BROWSER_TOOLS !== "false";
}

export function getAllApps(): AppManifest[] {
  return ALL_APPS;
}

export function getAppById(id: string): AppManifest | undefined {
  return APP_BY_ID.get(id);
}

export function getAppsByScope(scope: AppScope): AppManifest[] {
  return ALL_APPS.filter((app) => app.scope === scope);
}

export function getWorkApps(): AppManifest[] {
  return getAppsByScope("work");
}

export function getProductApps(): AppManifest[] {
  return getAppsByScope("product");
}

export function isKnownAppId(value: string): boolean {
  return APP_BY_ID.has(value);
}

export function isAppAvailable(app: AppManifest): boolean {
  if (app.id === "browser") {
    return (
      browserToolsEnabled() &&
      app.agentToolNames.every((name) => isAgentServerToolAvailable(name))
    );
  }
  return app.agentToolNames.every((name) => {
    if (name === "memory" || name === "notes" || name === "email") {
      return true;
    }
    return isAgentServerToolAvailable(name) || !app.requiresOdysseus;
  });
}

export function getAvailableWorkApps(): AppManifest[] {
  return getWorkApps().filter(isAppAvailable);
}

export function getDefaultEnabledWorkAppIds(): string[] {
  return getAvailableWorkApps()
    .filter((app) => app.defaultEnabled)
    .map((app) => app.id);
}

export function resolveAgentToolNamesForApps(
  enabledAppIds: Iterable<string>,
): string[] {
  const names = new Set<string>();
  for (const appId of enabledAppIds) {
    const app = APP_BY_ID.get(appId);
    if (!app || !isAppAvailable(app)) {
      continue;
    }
    for (const toolName of app.agentToolNames) {
      names.add(toolName);
    }
  }
  return Array.from(names);
}

export function resolveToolModuleQualnames(
  enabledAppIds: Iterable<string>,
): Record<string, string> {
  const qualnames: Record<string, string> = {};
  for (const appId of enabledAppIds) {
    const app = APP_BY_ID.get(appId);
    if (!app?.toolModules || !isAppAvailable(app)) {
      continue;
    }
    Object.assign(qualnames, app.toolModules);
  }
  return qualnames;
}

export function serializeEnabledAppIds(ids: string[]): string {
  const unique = Array.from(
    new Set(
      ids.filter((id) => isKnownAppId(id) && isAppAvailable(getAppById(id)!)),
    ),
  );
  return unique.join(",");
}

export function parseEnabledAppIds(raw?: string | null): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(
      (entry) => isKnownAppId(entry) && isAppAvailable(getAppById(entry)!),
    );
}

/** Map legacy worktools tag values (browser) to app ids. */
export function migrateLegacyWorkToolIds(toolIds: string[]): string[] {
  return toolIds.map((id) => (id === "browser" ? "browser" : id));
}

export {
  browserApp,
  calendarApp,
  contactsApp,
  documentsApp,
  emailApp,
  memoryApp,
  notesApp,
  researchApp,
  scheduledTasksApp,
};
