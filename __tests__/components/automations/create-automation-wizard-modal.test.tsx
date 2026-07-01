import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateAutomationWizardModal } from "#/components/features/automations/create-automation-wizard/create-automation-wizard-modal";
import { I18nKey } from "#/i18n/declaration";

vi.mock("#/components/features/chat/chat-input-model-control", () => ({
  ChatInputModelControl: () => <div data-testid="chat-input-llm-model" />,
}));

vi.mock("#/hooks/query/use-active-conversation", () => ({
  useActiveConversation: () => ({ data: undefined }),
}));

vi.mock("#/hooks/use-conversation-id", () => ({
  useOptionalConversationId: () => ({ conversationId: undefined }),
}));

vi.mock("#/hooks/use-conversation-name-context-menu", () => ({
  useConversationNameContextMenu: () => ({
    handleShowAgentTools: vi.fn(),
    handleShowSkills: vi.fn(),
    handleShowPlugins: vi.fn(),
    handleShowHooks: vi.fn(),
    systemModalVisible: false,
    setSystemModalVisible: vi.fn(),
    skillsModalVisible: false,
    setSkillsModalVisible: vi.fn(),
    pluginsModalVisible: false,
    setPluginsModalVisible: vi.fn(),
    hooksModalVisible: false,
    setHooksModalVisible: vi.fn(),
    systemMessage: null,
    shouldShowAgentTools: true,
    shouldShowHooks: false,
    shouldShowPlugins: false,
  }),
}));

vi.mock("#/hooks/use-user-providers", () => ({
  useUserProviders: () => ({ providers: [] }),
}));

function renderWizard(isOpen = true) {
  const onClose = vi.fn();
  render(<CreateAutomationWizardModal isOpen={isOpen} onClose={onClose} />);
  return { onClose };
}

describe("CreateAutomationWizardModal", () => {
  it("renders the basics step when open", () => {
    renderWizard();

    expect(
      screen.getByTestId("create-automation-wizard-modal"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("create-automation-wizard-basics-step"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("create-automation-wizard-footer-next"),
    ).toBeDisabled();
  });

  it("does not render when closed", () => {
    renderWizard(false);

    expect(
      screen.queryByTestId("create-automation-wizard-modal"),
    ).not.toBeInTheDocument();
  });

  it("advances from basics to trigger when name is provided", async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.type(
      screen.getByTestId("create-automation-wizard-name"),
      "Weekly digest",
    );
    await user.click(
      screen.getByTestId("create-automation-wizard-footer-next"),
    );

    expect(
      screen.getByTestId("create-automation-wizard-trigger-step"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("create-automation-wizard-trigger-summary"),
    ).toBeInTheDocument();
  });

  it("switches trigger panels when trigger type changes", async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.type(
      screen.getByTestId("create-automation-wizard-name"),
      "Weekly digest",
    );
    await user.click(
      screen.getByTestId("create-automation-wizard-footer-next"),
    );

    expect(
      screen.getByTestId("create-automation-wizard-schedule"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByTestId("create-automation-wizard-trigger-type-event"),
    );
    expect(
      screen.getByTestId("create-automation-wizard-integration-source"),
    ).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderWizard();

    await user.click(
      screen.getByRole("button", { name: I18nKey.BUTTON$CANCEL }),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
