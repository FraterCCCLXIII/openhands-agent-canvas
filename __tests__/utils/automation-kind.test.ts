import { describe, expect, it } from "vitest";
import { MOCK_AUTOMATIONS_RESPONSE } from "#/mocks/automations.mock";
import {
  getAutomationKind,
  groupAutomationsByKind,
} from "#/utils/automation-kind";

describe("getAutomationKind", () => {
  it("classifies cron automations as routines", () => {
    const routine = MOCK_AUTOMATIONS_RESPONSE.automations.find(
      (automation) => automation.name === "PR Triage Digest",
    );
    expect(routine).toBeDefined();
    expect(getAutomationKind(routine!)).toBe("routine");
  });

  it("classifies github event automations as workflows", () => {
    const workflow = MOCK_AUTOMATIONS_RESPONSE.automations.find(
      (automation) => automation.name === "PR Review on Open",
    );
    expect(workflow).toBeDefined();
    expect(getAutomationKind(workflow!)).toBe("workflow");
  });

  it("classifies slack event automations as responders", () => {
    const responder = {
      ...MOCK_AUTOMATIONS_RESPONSE.automations[0],
      trigger: {
        type: "event",
        source: "slack",
        on: "message.channels",
      },
    };
    expect(getAutomationKind(responder)).toBe("responder");
  });
});

describe("groupAutomationsByKind", () => {
  it("groups mock automations into workflow, routine, and responder buckets", () => {
    const grouped = groupAutomationsByKind(MOCK_AUTOMATIONS_RESPONSE.automations);
    expect(grouped.routine).toHaveLength(5);
    expect(grouped.workflow).toHaveLength(2);
    expect(grouped.responder).toHaveLength(0);
  });
});
