import { beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { I18nKey } from "#/i18n/declaration";
import { AddAutomationMenu } from "#/components/features/automations/add-automation-menu";

const createAutomationInChat = vi.fn();
const mockMutate = vi.fn();

vi.mock("#/hooks/use-create-automation-in-chat", () => ({
  useCreateAutomationInChat: () => createAutomationInChat,
}));

vi.mock("#/hooks/mutation/use-create-conversation", () => ({
  useCreateConversation: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

vi.mock("#/hooks/use-is-creating-conversation", () => ({
  useIsCreatingConversation: () => false,
}));

describe("AddAutomationMenu", () => {
  beforeEach(() => {
    createAutomationInChat.mockReset();
    mockMutate.mockReset();
  });

  it("opens the menu and launches create-in-chat from the first item", async () => {
    const user = userEvent.setup();
    render(
      <AddAutomationMenu onSetupManually={vi.fn()} onUseWizard={vi.fn()} />,
    );

    await user.click(screen.getByTestId("automations-add-automation"));
    expect(
      screen.getByTestId("automations-add-automation-menu"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByTestId("automations-add-automation-create-in-chat"),
    );

    expect(createAutomationInChat).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId("automations-add-automation-menu"),
    ).not.toBeInTheDocument();
  });

  it("opens the wizard callback from the second item", async () => {
    const onUseWizard = vi.fn();
    const user = userEvent.setup();
    render(
      <AddAutomationMenu
        onSetupManually={vi.fn()}
        onUseWizard={onUseWizard}
      />,
    );

    await user.click(screen.getByTestId("automations-add-automation"));
    await user.click(
      screen.getByTestId("automations-add-automation-use-wizard"),
    );

    expect(onUseWizard).toHaveBeenCalledTimes(1);
    expect(createAutomationInChat).not.toHaveBeenCalled();
  });

  it("opens the setup modal callback from the third item", async () => {
    const onSetupManually = vi.fn();
    const user = userEvent.setup();
    render(
      <AddAutomationMenu
        onSetupManually={onSetupManually}
        onUseWizard={vi.fn()}
      />,
    );

    await user.click(screen.getByTestId("automations-add-automation"));
    await user.click(
      screen.getByTestId("automations-add-automation-setup-manually"),
    );

    expect(onSetupManually).toHaveBeenCalledTimes(1);
    expect(createAutomationInChat).not.toHaveBeenCalled();
  });

  it("renders localized menu labels", async () => {
    const user = userEvent.setup();
    render(
      <AddAutomationMenu onSetupManually={vi.fn()} onUseWizard={vi.fn()} />,
    );

    await user.click(screen.getByTestId("automations-add-automation"));

    expect(
      screen.getByRole("button", { name: I18nKey.AUTOMATIONS$CREATE_IN_CHAT }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: I18nKey.AUTOMATIONS$USE_WIZARD }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: I18nKey.AUTOMATIONS$SETUP_MANUALLY }),
    ).toBeInTheDocument();
  });
});
