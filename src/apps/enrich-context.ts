import { buildMemoryContextSuffix } from "#/apps/odysseus-client";
import { getOdysseusConnectionSettings } from "#/stores/odysseus-store";

export async function fetchMemoryContextSuffix(
  query?: string,
): Promise<string> {
  const { url, token, memoryEnabled, memoryInjectOnStart } =
    getOdysseusConnectionSettings();
  if (
    !url?.trim() ||
    !token?.trim() ||
    !memoryEnabled ||
    !memoryInjectOnStart
  ) {
    return "";
  }

  return buildMemoryContextSuffix(url, token, query?.trim() || "user");
}

export function appendSuffix(
  existing: string | undefined,
  addition?: string,
): string {
  if (!addition?.trim()) {
    return existing?.trim() ?? "";
  }
  if (!existing?.trim()) {
    return addition.trim();
  }
  return `${existing.trim()}\n\n${addition.trim()}`;
}
