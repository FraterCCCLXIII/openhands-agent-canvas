import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateAutomationSectionHeader } from "#/components/features/automations/create-automation-section-header";

describe("CreateAutomationSectionHeader", () => {
  it("calls onHide when the minus button is clicked", async () => {
    const user = userEvent.setup();
    const onHide = vi.fn();

    render(
      <CreateAutomationSectionHeader
        label="Repositories"
        hideAriaLabel="Hide Repositories"
        hideTestId="create-automation-repositories-hide"
        onHide={onHide}
      />,
    );

    await user.click(screen.getByTestId("create-automation-repositories-hide"));

    expect(onHide).toHaveBeenCalledTimes(1);
  });
});
