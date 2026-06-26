import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import LoopService from "#/api/loop-service/loop-service.api";
import {
  __resetActiveStoreForTests,
  setActiveSelection,
  setRegisteredBackends,
} from "#/api/backend-registry/active-store";
import { ActiveBackendProvider } from "#/contexts/active-backend-context";
import LoopsList from "#/routes/loops-list";
import type { Backend } from "#/api/backend-registry/types";
import { MOCK_LOOPS_RESPONSE } from "#/mocks/loops.mock";

vi.mock("#/api/loop-service/loop-service.api", () => ({
  default: {
    listLoops: vi.fn(),
    checkHealth: vi.fn(),
    createLoop: vi.fn(),
    dispatchLoop: vi.fn(),
  },
}));

vi.mock("#/utils/custom-toast-handlers", () => ({
  displaySuccessToast: vi.fn(),
  displayErrorToast: vi.fn(),
}));

const localBackend: Backend = {
  id: "local-1",
  name: "Local 1",
  host: "http://localhost:8000",
  apiKey: "session-key",
  kind: "local",
};

function renderList() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <ActiveBackendProvider>
        <MemoryRouter>
          <LoopsList />
        </MemoryRouter>
      </ActiveBackendProvider>
    </QueryClientProvider>,
  );
}

describe("LoopsList", () => {
  beforeEach(() => {
    __resetActiveStoreForTests();
    setRegisteredBackends([localBackend]);
    setActiveSelection({ backendId: localBackend.id });
    vi.mocked(LoopService.checkHealth).mockResolvedValue({ status: "ok" });
    vi.mocked(LoopService.listLoops).mockResolvedValue(MOCK_LOOPS_RESPONSE);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders loops when backend is healthy", async () => {
    renderList();
    await waitFor(() => {
      expect(screen.getByTestId("loops-list-screen")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId("loop-card-loop-morning-triage-demo")).toBeInTheDocument();
    });
  });
});
