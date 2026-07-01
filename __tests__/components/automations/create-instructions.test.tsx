import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CreateInstructions } from "#/components/features/automations/create-instructions";
import { I18nKey } from "#/i18n/declaration";

vi.mock("#/hooks/use-create-automation-in-chat", () => ({
  useCreateAutomationInChat: () => vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        [I18nKey.AUTOMATIONS$EMPTY_HOW_TO_CREATE_TITLE]:
          "Create your first scheduled task",
        [I18nKey.AUTOMATIONS$EMPTY_STARTER_SUBLINE]:
          "Pick a quick-start template below, or choose from the recommendations to get started.",
        [I18nKey.AUTOMATIONS$STARTER_STANDUP_DIGEST]: "Standup digest",
        [I18nKey.AUTOMATIONS$STARTER_SHIP_REPORT]: "Ship report",
        [I18nKey.AUTOMATIONS$STARTER_CI_WATCHDOG]: "CI watchdog",
      };
      return translations[key] || key;
    },
  }),
}));

describe("CreateInstructions", () => {
  it("renders the title, subline, and starter templates", () => {
    render(<CreateInstructions />);

    expect(
      screen.getByRole("heading", { name: "Create your first scheduled task" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Pick a quick-start template below, or choose from the recommendations to get started.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automations-starter-templates"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Standup digest" })).toBeInTheDocument();
  });
});
