import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nKey } from "#/i18n/declaration";
import { LocalScheduleNotice } from "#/components/features/automations/local-schedule-notice";
import {
  LOCAL_SCHEDULE_NOTICE_DISMISSED_STORAGE_KEY,
  readLocalScheduleNoticeDismissed,
} from "#/components/features/automations/local-schedule-notice-storage";

describe("LocalScheduleNotice", () => {
  beforeEach(() => {
    window.localStorage.removeItem(LOCAL_SCHEDULE_NOTICE_DISMISSED_STORAGE_KEY);
  });

  it("renders the notice with a dismiss button", () => {
    render(<LocalScheduleNotice />);

    expect(
      screen.getByTestId("automations-local-schedule-notice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automations-local-schedule-notice-dismiss"),
    ).toHaveAttribute("aria-label", I18nKey.BUTTON$CLOSE);
  });

  it("hides the notice and persists dismissal when dismissed", async () => {
    const user = userEvent.setup();
    render(<LocalScheduleNotice />);

    await user.click(
      screen.getByTestId("automations-local-schedule-notice-dismiss"),
    );

    expect(
      screen.queryByTestId("automations-local-schedule-notice"),
    ).not.toBeInTheDocument();
    expect(readLocalScheduleNoticeDismissed()).toBe(true);
  });

  it("stays hidden when previously dismissed", () => {
    window.localStorage.setItem(
      LOCAL_SCHEDULE_NOTICE_DISMISSED_STORAGE_KEY,
      "true",
    );

    render(<LocalScheduleNotice />);

    expect(
      screen.queryByTestId("automations-local-schedule-notice"),
    ).not.toBeInTheDocument();
  });
});
