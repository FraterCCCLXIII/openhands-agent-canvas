import { beforeEach, describe, expect, it } from "vitest";
import { usePinnedAutomationsStore } from "#/stores/pinned-automations-store";

const BACKEND_ID = "default-local";

describe("pinned-automations store", () => {
  beforeEach(() => {
    window.localStorage.clear();
    usePinnedAutomationsStore.setState({ pinsByBackendId: {} });
  });

  it("pins an automation at the front of the backend list", () => {
    usePinnedAutomationsStore
      .getState()
      .pinAutomation(BACKEND_ID, "github-pr-reviewer");
    usePinnedAutomationsStore
      .getState()
      .pinAutomation(BACKEND_ID, "slack-standup-digest");

    expect(
      usePinnedAutomationsStore.getState().pinsByBackendId[BACKEND_ID],
    ).toEqual(["slack-standup-digest", "github-pr-reviewer"]);
  });

  it("does not duplicate pins for the same automation", () => {
    usePinnedAutomationsStore
      .getState()
      .pinAutomation(BACKEND_ID, "github-pr-reviewer");
    usePinnedAutomationsStore
      .getState()
      .pinAutomation(BACKEND_ID, "github-pr-reviewer");

    expect(
      usePinnedAutomationsStore.getState().pinsByBackendId[BACKEND_ID],
    ).toEqual(["github-pr-reviewer"]);
  });

  it("toggles pin state", () => {
    usePinnedAutomationsStore
      .getState()
      .togglePin(BACKEND_ID, "github-pr-reviewer");
    expect(
      usePinnedAutomationsStore.getState().pinsByBackendId[BACKEND_ID],
    ).toEqual(["github-pr-reviewer"]);

    usePinnedAutomationsStore
      .getState()
      .togglePin(BACKEND_ID, "github-pr-reviewer");
    expect(
      usePinnedAutomationsStore.getState().pinsByBackendId[BACKEND_ID],
    ).toEqual([]);
  });

  it("prunes pins that no longer exist", () => {
    usePinnedAutomationsStore
      .getState()
      .pinAutomation(BACKEND_ID, "github-pr-reviewer");
    usePinnedAutomationsStore
      .getState()
      .pinAutomation(BACKEND_ID, "gone-id");
    usePinnedAutomationsStore
      .getState()
      .pruneMissingAutomations(BACKEND_ID, ["github-pr-reviewer"]);

    expect(
      usePinnedAutomationsStore.getState().pinsByBackendId[BACKEND_ID],
    ).toEqual(["github-pr-reviewer"]);
  });
});
