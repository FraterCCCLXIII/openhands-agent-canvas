/** App scope: product-wide (Code + Work) or Work-only. */
export type AppScope = "product" | "work";

export interface AppManifest {
  id: string;
  version: string;
  scope: AppScope;
  displayName: string;
  descriptionKey: string;
  /** Required Odysseus token scopes when requiresOdysseus is true. */
  odysseusScopes: string[];
  /** Agent-server tool names this app registers. */
  agentToolNames: string[];
  /** Python module qualnames keyed by tool name (without _tool suffix). */
  toolModules?: Record<string, string>;
  optionalConversationTab?: string;
  defaultEnabled?: boolean;
  requiresOdysseus?: boolean;
}

export interface OdysseusConnectionSettings {
  url: string | null;
  token: string | null;
  memoryEnabled: boolean;
  memoryInjectOnStart: boolean;
}

export interface OdysseusCapabilities {
  integration: string;
  token_scopes: string[];
  tools: Record<
    string,
    {
      read?: boolean;
      write?: boolean;
      draft?: boolean;
      send?: boolean;
      launch?: boolean;
      actions?: string[];
      available?: boolean;
    }
  >;
}

export const ODYSSEUS_TOKEN_SECRET_NAME = "ODYSSEUS_API_TOKEN";
export const ODYSSEUS_URL_ENV = "ODYSSEUS_URL";

export const WORK_ENABLED_APPS_TAG = "workapps";
