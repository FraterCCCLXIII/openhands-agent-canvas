import {
  getDefaultEnabledWorkAppIds,
  migrateLegacyWorkToolIds,
  parseEnabledAppIds,
} from "#/apps/registry";

export interface WorkManifest {
  id: string;
  name: string;
  grantedFolders: string[];
  deliverablesPath: string;
  /** Work apps enabled by default for new tasks. */
  defaultEnabledApps: string[];
  /** @deprecated Use defaultEnabledApps */
  defaultOptionalTools?: string[];
}

export function normalizeWorkManifest(
  manifest: WorkManifest | null | undefined,
): WorkManifest | null {
  if (!manifest) {
    return null;
  }

  const hasExplicitApps =
    manifest.defaultEnabledApps !== undefined ||
    manifest.defaultOptionalTools !== undefined;
  const legacy = manifest.defaultOptionalTools ?? [];
  const defaultEnabledApps = hasExplicitApps
    ? (manifest.defaultEnabledApps ?? migrateLegacyWorkToolIds(legacy))
    : getDefaultEnabledWorkAppIds();

  return {
    ...manifest,
    defaultEnabledApps,
    defaultOptionalTools: defaultEnabledApps,
  };
}

export interface WorkRuntimeHealthResponse {
  status: "ok" | "error";
  message?: string;
}

export interface PathValidationResult {
  path: string;
  exists: boolean;
}

export interface ValidatePathsResponse {
  results: PathValidationResult[];
}

export function isWorkManifestReady(
  manifest: WorkManifest | null | undefined,
): boolean {
  return Boolean(
    manifest &&
    manifest.grantedFolders.length > 0 &&
    manifest.deliverablesPath.trim().length > 0,
  );
}

export function getManifestEnabledApps(
  manifest: WorkManifest | null | undefined,
): string[] {
  const normalized = normalizeWorkManifest(manifest);
  return normalized?.defaultEnabledApps ?? getDefaultEnabledWorkAppIds();
}

export function parseManifestEnabledAppsFromTag(
  workapps?: string | null,
  worktools?: string | null,
): string[] {
  const fromApps = parseEnabledAppIds(workapps);
  if (fromApps.length > 0) {
    return fromApps;
  }
  return parseEnabledAppIds(worktools);
}

export const WORK_MODE_TAG = "appmode";
export const WORK_MODE_TAG_VALUE = "work";
export const WORK_WORKSPACE_ID_TAG = "workwsid";
