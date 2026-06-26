import { http, HttpResponse, delay } from "msw";
import type {
  LoopDefinition,
  LoopRun,
  LoopRunsResponse,
  LoopsResponse,
} from "#/types/loop";
import { LoopRunStatus } from "#/types/loop";
import { cloneMockLoop, MOCK_LOOPS_RESPONSE } from "./loops.mock";

const loops = new Map<string, LoopDefinition>(
  MOCK_LOOPS_RESPONSE.loops.map((loop) => [loop.id, cloneMockLoop(loop)]),
);

const runsByLoop = new Map<string, LoopRun[]>([
  [
    "loop-morning-triage-demo",
    [
      {
        id: "run-1",
        loop_id: "loop-morning-triage-demo",
        status: LoopRunStatus.COMPLETED,
        turn_number: 12,
        findings_count: 4,
        inbox_count: 1,
        state_file_path: ".openhands/loops/loop-morning-triage-demo/triage.md",
        error_detail: null,
        started_at: "2026-06-25T06:00:00.000Z",
        completed_at: "2026-06-25T06:04:12.000Z",
      },
    ],
  ],
]);

export const resetLoopMockData = () => {
  loops.clear();
  MOCK_LOOPS_RESPONSE.loops.forEach((loop) => {
    loops.set(loop.id, cloneMockLoop(loop));
  });
  runsByLoop.clear();
  runsByLoop.set("loop-morning-triage-demo", [
    {
      id: "run-1",
      loop_id: "loop-morning-triage-demo",
      status: LoopRunStatus.COMPLETED,
      turn_number: 12,
      findings_count: 4,
      inbox_count: 1,
      state_file_path: ".openhands/loops/loop-morning-triage-demo/triage.md",
      error_detail: null,
      started_at: "2026-06-25T06:00:00.000Z",
      completed_at: "2026-06-25T06:04:12.000Z",
    },
  ]);
};

export const LOOP_HANDLERS = [
  http.get("*/api/loops/health", async () => {
    await delay(80);
    return HttpResponse.json({ status: "ok" });
  }),

  http.get("*/api/loops/v1", async ({ request }) => {
    await delay(200);
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "50");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const all = Array.from(loops.values());
    const response: LoopsResponse = {
      loops: all.slice(offset, offset + limit),
      total: all.length,
    };
    return HttpResponse.json(response);
  }),

  http.post("*/api/loops/v1", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as Omit<
      LoopDefinition,
      "id" | "created_at" | "updated_at"
    >;
    const now = new Date().toISOString();
    const loop: LoopDefinition = {
      ...body,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
      last_triggered_at: null,
      inbox_count: 0,
    };
    loops.set(loop.id, loop);
    return HttpResponse.json(loop, { status: 201 });
  }),

  http.get("*/api/loops/v1/:id", async ({ params }) => {
    await delay(150);
    const loop = loops.get(params.id as string);
    if (!loop) {
      return HttpResponse.json({ detail: "Loop not found" }, { status: 404 });
    }
    return HttpResponse.json(loop);
  }),

  http.patch("*/api/loops/v1/:id", async ({ params, request }) => {
    await delay(150);
    const id = params.id as string;
    const body = (await request.clone().json()) as Partial<LoopDefinition>;
    const existing = loops.get(id);
    if (!existing) {
      return HttpResponse.json({ detail: "Loop not found" }, { status: 404 });
    }
    const updated: LoopDefinition = {
      ...existing,
      ...body,
      updated_at: new Date().toISOString(),
    };
    loops.set(id, updated);
    return HttpResponse.json(updated);
  }),

  http.delete("*/api/loops/v1/:id", async ({ params }) => {
    await delay(150);
    const id = params.id as string;
    if (!loops.has(id)) {
      return HttpResponse.json({ detail: "Loop not found" }, { status: 404 });
    }
    loops.delete(id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post("*/api/loops/v1/:id/dispatch", async ({ params }) => {
    await delay(200);
    const id = params.id as string;
    if (!loops.has(id)) {
      return HttpResponse.json({ detail: "Loop not found" }, { status: 404 });
    }
    const run: LoopRun = {
      id: crypto.randomUUID(),
      loop_id: id,
      status: LoopRunStatus.PENDING,
      turn_number: 1,
      findings_count: 0,
      inbox_count: 0,
      state_file_path: null,
      error_detail: null,
      started_at: new Date().toISOString(),
      completed_at: null,
    };
    const existing = runsByLoop.get(id) ?? [];
    runsByLoop.set(id, [run, ...existing]);
    return HttpResponse.json(run, { status: 201 });
  }),

  http.get("*/api/loops/v1/:id/runs", async ({ params, request }) => {
    await delay(150);
    const id = params.id as string;
    if (!loops.has(id)) {
      return HttpResponse.json({ detail: "Loop not found" }, { status: 404 });
    }
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const offset = Number(url.searchParams.get("offset") ?? "0");
    const all = runsByLoop.get(id) ?? [];
    const response: LoopRunsResponse = {
      runs: all.slice(offset, offset + limit),
      total: all.length,
    };
    return HttpResponse.json(response);
  }),
];
