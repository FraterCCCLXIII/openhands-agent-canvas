import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { LOOP_HANDLERS, resetLoopMockData } from "#/mocks/loop-handlers";
import { MOCK_LOOPS_RESPONSE } from "#/mocks/loops.mock";
import { getLoopTemplateById } from "#/data/loop-templates";

const server = setupServer(...LOOP_HANDLERS);

describe("Loop MSW Handlers", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    resetLoopMockData();
  });

  it("returns health ok", async () => {
    const res = await fetch("/api/loops/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("lists loops", async () => {
    const res = await fetch("/api/loops/v1");
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.total).toBe(MOCK_LOOPS_RESPONSE.total);
  });

  it("creates a loop from template shape", async () => {
    const template = getLoopTemplateById("morning-triage");
    expect(template).toBeDefined();
    const body = template!.buildDefinition({ name: "My triage" });
    const res = await fetch("/api/loops/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.name).toBe("My triage");
    expect(created.id).toBeTruthy();
  });
});
