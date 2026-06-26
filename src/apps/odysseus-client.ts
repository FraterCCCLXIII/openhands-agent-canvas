import type { OdysseusCapabilities } from "#/apps/types";

export class OdysseusApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "OdysseusApiError";
  }
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export async function odysseusFetch<T = unknown>(
  baseUrl: string,
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${normalizeBaseUrl(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...init, headers });
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof (payload as { detail: unknown }).detail === "string"
        ? (payload as { detail: string }).detail
        : text || response.statusText;
    throw new OdysseusApiError(detail, response.status);
  }

  return payload as T;
}

export async function fetchOdysseusCapabilities(
  baseUrl: string,
  token: string,
): Promise<OdysseusCapabilities> {
  return odysseusFetch<OdysseusCapabilities>(
    baseUrl,
    token,
    "/api/openhands/capabilities",
  );
}

export interface MemoryEntry {
  id: string;
  text: string;
  category?: string;
  timestamp?: number;
}

export async function searchOdysseusMemory(
  baseUrl: string,
  token: string,
  query: string,
): Promise<MemoryEntry[]> {
  const body = new URLSearchParams();
  body.set("query", query);
  const result = await odysseusFetch<{ memories?: MemoryEntry[] }>(
    baseUrl,
    token,
    "/api/openhands/memory/search",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    },
  );
  return result.memories ?? [];
}

export function formatMemoryContextSuffix(memories: MemoryEntry[]): string {
  if (memories.length === 0) {
    return "";
  }
  const lines = memories.map(
    (memory, index) =>
      `${index + 1}. [${memory.category ?? "fact"}] ${memory.text}`,
  );
  return [
    "<USER_MEMORY>",
    "Relevant facts about the user from prior sessions:",
    ...lines,
    "",
    "Reminder vs calendar: use Notes (todos with due_date) for reminders;",
    "use Calendar for meetings, appointments, and time blocks.",
    "</USER_MEMORY>",
  ].join("\n");
}

export async function buildMemoryContextSuffix(
  baseUrl: string,
  token: string,
  query: string,
): Promise<string> {
  try {
    const memories = await searchOdysseusMemory(
      baseUrl,
      token,
      query || "user preferences",
    );
    return formatMemoryContextSuffix(memories);
  } catch {
    return "";
  }
}
