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
