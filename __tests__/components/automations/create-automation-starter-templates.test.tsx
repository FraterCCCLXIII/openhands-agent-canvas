import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nKey } from "#/i18n/declaration";
import { CreateAutomationStarterTemplates } from "#/components/features/automations/create-automation-starter-templates";

const createAutomationInChat = vi.fn();

vi.mock("#/hooks/use-create-automation-in-chat", () => ({
  useCreateAutomationInChat: () => createAutomationInChat,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        [I18nKey.AUTOMATIONS$STARTER_STANDUP_DIGEST]: "Standup digest",
        [I18nKey.AUTOMATIONS$STARTER_SHIP_REPORT]: "Ship report",
        [I18nKey.AUTOMATIONS$STARTER_CI_WATCHDOG]: "CI watchdog",
        [I18nKey.AUTOMATIONS$STARTER_STANDUP_DIGEST_PROMPT]:
          "standup-digest-prompt",
        [I18nKey.AUTOMATIONS$STARTER_SHIP_REPORT_PROMPT]: "ship-report-prompt",
        [I18nKey.AUTOMATIONS$STARTER_CI_WATCHDOG_PROMPT]: "ci-watchdog-prompt",
      };
      return translations[key] || key;
    },
  }),
}));

describe("CreateAutomationStarterTemplates", () => {
  beforeEach(() => {
    createAutomationInChat.mockReset();
  });

  it("renders all starter template buttons", () => {
    render(<CreateAutomationStarterTemplates />);

    expect(
      screen.getByTestId("automations-starter-templates"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Standup digest" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ship report" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CI watchdog" })).toBeInTheDocument();
  });

  it("launches create-in-chat with the template prompt and optional callback", async () => {
    const onLaunch = vi.fn();
    const user = userEvent.setup();
    render(<CreateAutomationStarterTemplates onLaunch={onLaunch} />);

    await user.click(screen.getByTestId("automations-starter-ship-report"));

    expect(createAutomationInChat).toHaveBeenCalledWith(
      "ship-report-prompt",
      onLaunch,
    );
  });
});
