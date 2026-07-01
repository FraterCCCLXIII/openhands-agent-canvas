import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nKey } from "#/i18n/declaration";
import { ScheduledTasksIntroModal } from "#/components/features/automations/scheduled-tasks-intro-modal";
import {
  SCHEDULED_TASKS_INTRO_DISMISSED_STORAGE_KEY,
  readScheduledTasksIntroDismissed,
} from "#/components/features/automations/scheduled-tasks-intro-storage";
import { SCHEDULED_TASKS_INTRO_DOCS_URL } from "#/components/features/automations/scheduled-tasks-intro.constants";

describe("ScheduledTasksIntroModal", () => {
  beforeEach(() => {
    window.localStorage.removeItem(SCHEDULED_TASKS_INTRO_DISMISSED_STORAGE_KEY);
  });

  it("renders the intro modal with video and documentation link", () => {
    render(<ScheduledTasksIntroModal />);

    expect(
      screen.getByTestId("scheduled-tasks-intro-modal"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: I18nKey.AUTOMATIONS$SCHEDULED_TASKS_INTRO_TITLE,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("scheduled-tasks-intro-video"),
    ).toHaveAttribute(
      "src",
      expect.stringContaining("o-5Esj459GQ"),
    );
    expect(screen.getByTestId("scheduled-tasks-intro-docs-link")).toHaveAttribute(
      "href",
      SCHEDULED_TASKS_INTRO_DOCS_URL,
    );
  });

  it("closes without persisting when dismissed without checking the box", async () => {
    const user = userEvent.setup();
    render(<ScheduledTasksIntroModal />);

    await user.click(screen.getByTestId("scheduled-tasks-intro-got-it"));

    expect(
      screen.queryByTestId("scheduled-tasks-intro-modal"),
    ).not.toBeInTheDocument();
    expect(readScheduledTasksIntroDismissed()).toBe(false);
  });

  it("persists dismissal when the checkbox is checked before closing", async () => {
    const user = userEvent.setup();
    render(<ScheduledTasksIntroModal />);

    await user.click(screen.getByTestId("scheduled-tasks-intro-dont-show"));
    await user.click(screen.getByTestId("scheduled-tasks-intro-got-it"));

    expect(
      screen.queryByTestId("scheduled-tasks-intro-modal"),
    ).not.toBeInTheDocument();
    expect(readScheduledTasksIntroDismissed()).toBe(true);
  });

  it("stays hidden when previously dismissed", () => {
    window.localStorage.setItem(
      SCHEDULED_TASKS_INTRO_DISMISSED_STORAGE_KEY,
      "true",
    );

    render(<ScheduledTasksIntroModal />);

    expect(
      screen.queryByTestId("scheduled-tasks-intro-modal"),
    ).not.toBeInTheDocument();
  });
});
