import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AutomationViewToggle } from "#/components/features/automations/automation-view-toggle";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("AutomationViewToggle", () => {
  it("renders grid and list options with the list option selectable", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<AutomationViewToggle view="grid" onChange={onChange} />);

    expect(screen.getByTestId("automations-view-toggle-grid")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByTestId("automations-view-toggle-list")).toHaveAttribute(
      "aria-checked",
      "false",
    );

    await user.click(screen.getByTestId("automations-view-toggle-list"));
    expect(onChange).toHaveBeenCalledWith("list");
  });
});
