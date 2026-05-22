import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router";
import { I18nKey } from "#/i18n/declaration";
import { AutomationsNavigation } from "#/components/features/automations/automations-navigation";
import { NavigationProvider } from "#/context/navigation-context";

function renderNav(initialPath = "/automations") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <NavigationProvider
        value={{
          currentPath: initialPath,
          conversationId: null,
          navigate: () => {},
          isNavigating: false,
        }}
      >
        <AutomationsNavigation />
      </NavigationProvider>
    </MemoryRouter>,
  );
}

describe("AutomationsNavigation", () => {
  it("renders Your Automations and Marketplace links", () => {
    renderNav();

    expect(
      screen.getByTestId("sidebar-automations-/automations"),
    ).toHaveTextContent(I18nKey.AUTOMATIONS$YOUR_AUTOMATIONS);
    expect(
      screen.getByTestId("sidebar-automations-/automations/marketplace"),
    ).toHaveTextContent(I18nKey.AUTOMATIONS$MARKETPLACE);
  });
});
