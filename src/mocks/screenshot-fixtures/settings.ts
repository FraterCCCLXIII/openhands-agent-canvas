import type { SettingsValue } from "#/types/settings";

export interface ScreenshotLlmProfileSeed {
  name: string;
  config: Record<string, SettingsValue>;
  api_key_set: boolean;
}

export const SCREENSHOT_LLM_PROFILES: ScreenshotLlmProfileSeed[] = [
  {
    name: "Model",
    config: {
      model: "anthropic/claude-sonnet-4-5-20250929",
      base_url: "",
      temperature: 0.2,
    },
    api_key_set: true,
  },
  {
    name: "Development",
    config: {
      model: "openhands/claude-haiku-4-5-20251001",
      base_url: "",
      temperature: 0.4,
    },
    api_key_set: true,
  },
  {
    name: "Fast iteration",
    config: {
      model: "openhands/minimax-m2.7",
      base_url: "",
      temperature: 0.6,
    },
    api_key_set: false,
  },
];

export const SCREENSHOT_ACTIVE_LLM_PROFILE = "Model";

/** Installed MCP servers shown on /mcp in screenshot mode. */
export const SCREENSHOT_MCP_CONFIG = {
  mcpServers: {
    slack: {
      url: "https://mcp.example.com/slack/sse",
      transport: "sse",
    },
    "github-tools": {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_TOKEN: "${GITHUB_TOKEN}",
      },
    },
  },
};
