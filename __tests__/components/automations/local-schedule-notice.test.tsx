import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  __resetActiveStoreForTests,
  setActiveSelection,
  setRegisteredBackends,
} from "#/api/backend-registry/active-store";
import type { Backend } from "#/api/backend-registry/types";
import { ActiveBackendProvider } from "#/contexts/active-backend-context";
import { I18nKey } from "#/i18n/declaration";
import { LocalScheduleNotice } from "#/components/features/automations/local-schedule-notice";
import {
  LOCAL_SCHEDULE_NOTICE_DISMISSED_STORAGE_KEY,
  readLocalScheduleNoticeDismissed,
} from "#/components/features/automations/local-schedule-notice-storage";

const localBackend: Backend = {
  id: "local-1",
  name: "Local 1",
  host: "http://localhost:8000",
  apiKey: "session-key",
  kind: "local",
};

const cloudBackend: Backend = {
  id: "cloud-1",
  name: "Production",
  host: "https://app.all-hands.dev",
  apiKey: "bearer-key",
  kind: "cloud",
};

function renderNotice() {
  return render(
    <ActiveBackendProvider>
      <LocalScheduleNotice />
    </ActiveBackendProvider>,
  );
}

describe("LocalScheduleNotice", () => {
  beforeEach(() => {
    window.localStorage.removeItem(LOCAL_SCHEDULE_NOTICE_DISMISSED_STORAGE_KEY);
    __resetActiveStoreForTests();
    setRegisteredBackends([localBackend, cloudBackend]);
    setActiveSelection({ backendId: localBackend.id });
  });

  it("renders the notice with a dismiss button on a local backend", () => {
    renderNotice();

    expect(
      screen.getByTestId("automations-local-schedule-notice"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("automations-local-schedule-notice-dismiss"),
    ).toHaveAttribute("aria-label", I18nKey.BUTTON$CLOSE);
  });

  it("does not render on a cloud backend", () => {
    setActiveSelection({ backendId: cloudBackend.id });
    renderNotice();

    expect(
      screen.queryByTestId("automations-local-schedule-notice"),
    ).not.toBeInTheDocument();
  });

  it("hides the notice and persists dismissal when dismissed", async () => {
    const user = userEvent.setup();
    renderNotice();

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

    renderNotice();

    expect(
      screen.queryByTestId("automations-local-schedule-notice"),
    ).not.toBeInTheDocument();
  });
});
