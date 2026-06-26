import { describe, expect, it, vi } from "vitest";
import { DEFAULT_SETTINGS } from "#/services/settings";
import type { WorkManifest } from "#/types/work-manifest";

const { mockIsAgentServerToolAvailable } = vi.hoisted(() => ({
  mockIsAgentServerToolAvailable: vi.fn(
    (name: string) => name === "browser_tool_set",
  ),
}));

vi.mock("#/api/agent-server-compatibility", () => ({
  isAgentServerToolAvailable: (name: string) =>
    mockIsAgentServerToolAvailable(name),
}));

import {
  buildWorkStartConversationRequest,
  buildWorkSystemSuffix,
} from "#/api/agent-server-adapter";

describe("buildWorkStartConversationRequest", () => {
  const manifest: WorkManifest = {
    id: "workspace-1",
    name: "Personal",
    grantedFolders: ["/tmp/docs"],
    deliverablesPath: "/tmp/docs/deliverables",
    defaultEnabledApps: [],
    defaultOptionalTools: [],
  };

  it("builds a restricted tool profile and work tags", () => {
    const payload = buildWorkStartConversationRequest({
      settings: DEFAULT_SETTINGS,
      query: "Organize receipts",
      workingDir: manifest.deliverablesPath,
      workManifest: manifest,
    });

    const toolNames = payload.agent_settings.tools?.map((tool) => tool.name);
    expect(toolNames).toEqual(["file_editor", "task_tracker", "canvas_ui"]);
    expect(payload.tags).toEqual({
      appmode: "work",
      workwsid: "workspace1",
      workapps: "",
      worktools: "",
    });
    expect(payload.worktree).toBe(false);
  });

  it("includes browser when enabled in the manifest", () => {
    const payload = buildWorkStartConversationRequest({
      settings: DEFAULT_SETTINGS,
      query: "Research vendors",
      workingDir: manifest.deliverablesPath,
      workManifest: {
        ...manifest,
        defaultEnabledApps: ["browser"],
        defaultOptionalTools: ["browser"],
      },
    });

    const toolNames = payload.agent_settings.tools?.map((tool) => tool.name);
    expect(toolNames).toContain("browser_tool_set");
    expect(payload.tags?.worktools).toBe("browser");
    expect(payload.tags?.workapps).toBe("browser");
  });

  it("includes notes tool when notes app is enabled", () => {
    const payload = buildWorkStartConversationRequest({
      settings: DEFAULT_SETTINGS,
      query: "Add a reminder",
      workingDir: manifest.deliverablesPath,
      workManifest: {
        ...manifest,
        defaultEnabledApps: ["notes"],
      },
    });

    const toolNames = payload.agent_settings.tools?.map((tool) => tool.name);
    expect(toolNames).toContain("notes");
  });

  it("includes WORK_APP_REQUEST guidance when apps are off", () => {
    expect(buildWorkSystemSuffix(manifest)).toContain("WORK_APP_REQUEST");
  });

  it("includes granted folders in the work suffix", () => {
    expect(buildWorkSystemSuffix(manifest)).toContain("/tmp/docs");
    expect(buildWorkSystemSuffix(manifest)).toContain(
      "/tmp/docs/deliverables",
    );
  });
});
