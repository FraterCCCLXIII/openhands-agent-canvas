import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateAutomationSectionRevealButton } from "#/components/features/automations/create-automation-section-reveal-button";

describe("CreateAutomationSectionRevealButton", () => {
  it("toggles reveal state when clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <CreateAutomationSectionRevealButton
        section="triggers"
        label="Trigger Events"
        ariaLabel="Add Triggers"
        isRevealed={false}
        onToggle={onToggle}
      />,
    );

    const button = screen.getByTestId("create-automation-reveal-triggers");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-label", "Add Triggers");
    expect(button).toHaveTextContent("Trigger Events");
    expect(button.querySelector("svg")).not.toBeNull();

    await user.click(button);
    expect(onToggle).toHaveBeenCalledWith("triggers");
  });

  it("shows a count badge for bubbled sections with items", () => {
    render(
      <CreateAutomationSectionRevealButton
        section="repositories"
        label="Repositories"
        ariaLabel="Add Repositories"
        itemCount={2}
        isRevealed={false}
        onToggle={vi.fn()}
      />,
    );

    expect(
      screen.getByTestId("create-automation-reveal-repositories-count"),
    ).toHaveTextContent("2");
  });

  it("reflects the revealed state on the trigger", () => {
    render(
      <CreateAutomationSectionRevealButton
        section="plugins"
        label="Plugins"
        ariaLabel="Add Plugins"
        isRevealed
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByTestId("create-automation-reveal-plugins")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
