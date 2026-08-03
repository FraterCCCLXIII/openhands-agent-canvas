import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HomeComposerModeToggle } from "#/components/features/home/home-composer-mode-toggle";
import { HOME_COMPOSER_MODE } from "#/components/features/home/home-composer-mode";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("HomeComposerModeToggle", () => {
  it("reports the selected mode and notifies on change", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <HomeComposerModeToggle
        value={HOME_COMPOSER_MODE.code}
        onChange={onChange}
      />,
    );

    expect(screen.getByTestId("home-composer-mode-code")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(
      screen.getByTestId("home-composer-mode-automation"),
    ).toHaveAttribute("aria-checked", "false");

    await user.click(screen.getByTestId("home-composer-mode-automation"));

    expect(onChange).toHaveBeenCalledWith(HOME_COMPOSER_MODE.automation);
  });
});
