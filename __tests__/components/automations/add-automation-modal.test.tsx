import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddAutomationModal } from "#/components/features/automations/add-automation-modal";
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

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: { name?: string; section?: string }) => {
      if (key === I18nKey.AUTOMATIONS$CREATE_REMOVE_ITEM && options?.name) {
        return `Remove ${options.name}`;
      }
      if (key === I18nKey.AUTOMATIONS$CREATE_HIDE_SECTION && options?.section) {
        return `Hide ${options.section}`;
      }
      return key;
    },
  }),
}));

function renderModal(isOpen = true) {
  const onClose = vi.fn();

  render(<AddAutomationModal isOpen={isOpen} onClose={onClose} />);

  return { onClose };
}

describe("AddAutomationModal", () => {
  it("renders the create automation form when open", () => {
    renderModal();

    expect(screen.getByTestId("add-automation-modal")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: I18nKey.AUTOMATIONS$CREATE_TITLE }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("create-automation-form")).toBeInTheDocument();
    expect(screen.getByTestId("create-automation-name")).toBeInTheDocument();
    expect(screen.getByTestId("create-automation-prompt")).toBeInTheDocument();
    expect(screen.getByTestId("chat-plus-button")).toBeInTheDocument();
    expect(
      screen.getByTestId("create-automation-optional-section-buttons"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("create-automation-repositories"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("create-automation-submit"),
    ).toBeDisabled();
  });

  it("does not render when closed", () => {
    renderModal(false);

    expect(screen.queryByTestId("add-automation-modal")).not.toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();
    const { onClose } = renderModal();

    await user.click(screen.getByTestId("add-automation-modal-close"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("enables create when required fields are filled", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.type(screen.getByTestId("create-automation-name"), "Weekly check");
    await user.type(
      screen.getByTestId("create-automation-prompt"),
      "Review release risk",
    );
    await user.click(screen.getByTestId("create-automation-reveal-repositories"));
    await user.click(screen.getByTestId("create-automation-repositories-add"));
    await user.type(screen.getByTestId("add-repository-input"), "acme/app");
    await user.click(screen.getByTestId("add-repository-confirm"));

    expect(screen.getByTestId("create-automation-submit")).toBeEnabled();
  });

  it("hides a revealed section when the minus control is clicked", async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByTestId("create-automation-reveal-repositories"));
    expect(screen.getByTestId("create-automation-repositories")).toBeInTheDocument();

    await user.click(screen.getByTestId("create-automation-repositories-hide"));

    expect(
      screen.queryByTestId("create-automation-repositories"),
    ).not.toBeInTheDocument();
  });
});
