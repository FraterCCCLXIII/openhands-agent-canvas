import axios from "axios";
import type {
  LoopDefinition,
  LoopRun,
  LoopRunsResponse,
  LoopsResponse,
} from "#/types/loop";
import { LOOP_API_BASE_PATH } from "#/constants/loop-api";
import {
  getActiveBackend,
  getEffectiveLocalBackend,
} from "../backend-registry/active-store";
import { NoBackendAvailableError } from "../agent-server-client-options";
import { callCloudProxy } from "../cloud/proxy";

export interface LoopHealthResponse {
  status: "ok" | "error";
  message?: string;
}

const localLoopAxios = axios.create();

localLoopAxios.interceptors.request.use((config) => {
  const backend = getEffectiveLocalBackend();
  if (!backend) throw new NoBackendAvailableError();
  // eslint-disable-next-line no-param-reassign
  if (!config.baseURL) config.baseURL = backend.host;

  const apiKey = backend.apiKey?.trim();
  if (apiKey) {
    config.headers.set("X-Session-API-Key", apiKey);
  }
  return config;
});

function buildPaginationQuery(limit: number, offset: number): string {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return params.toString();
}

class LoopService {
  static async checkHealth(): Promise<LoopHealthResponse> {
    const active = getActiveBackend().backend;

    if (active.kind === "cloud") {
      return callCloudProxy<LoopHealthResponse>({
        backend: active,
        method: "GET",
        path: `${LOOP_API_BASE_PATH}/health`,
      });
    }

    const { data } = await localLoopAxios.get<LoopHealthResponse>(
      `${LOOP_API_BASE_PATH}/health`,
    );
    return data;
  }

  static async listLoops(
    params: { limit?: number; offset?: number } = {},
  ): Promise<LoopsResponse> {
    const { limit = 50, offset = 0 } = params;
    const active = getActiveBackend().backend;

    if (active.kind === "cloud") {
      return callCloudProxy<LoopsResponse>({
        backend: active,
        method: "GET",
        path: `${LOOP_API_BASE_PATH}/v1?${buildPaginationQuery(limit, offset)}`,
      });
    }

    const { data } = await localLoopAxios.get<LoopsResponse>(
      `${LOOP_API_BASE_PATH}/v1`,
      { params: { limit, offset } },
    );
    return data;
  }

  static async getLoop(id: string): Promise<LoopDefinition> {
    const active = getActiveBackend().backend;

    if (active.kind === "cloud") {
      return callCloudProxy<LoopDefinition>({
        backend: active,
        method: "GET",
        path: `${LOOP_API_BASE_PATH}/v1/${id}`,
      });
    }

    const { data } = await localLoopAxios.get<LoopDefinition>(
      `${LOOP_API_BASE_PATH}/v1/${id}`,
    );
    return data;
  }

  static async createLoop(
    body: Omit<
      LoopDefinition,
      "id" | "created_at" | "updated_at" | "last_triggered_at" | "inbox_count"
    >,
  ): Promise<LoopDefinition> {
    const active = getActiveBackend().backend;

    if (active.kind === "cloud") {
      return callCloudProxy<LoopDefinition>({
        backend: active,
        method: "POST",
        path: `${LOOP_API_BASE_PATH}/v1`,
        body,
      });
    }

    const { data } = await localLoopAxios.post<LoopDefinition>(
      `${LOOP_API_BASE_PATH}/v1`,
      body,
    );
    return data;
  }

  static async toggleLoop(
    id: string,
    enabled: boolean,
  ): Promise<LoopDefinition> {
    const active = getActiveBackend().backend;

    if (active.kind === "cloud") {
      return callCloudProxy<LoopDefinition>({
        backend: active,
        method: "PATCH",
        path: `${LOOP_API_BASE_PATH}/v1/${id}`,
        body: { enabled },
      });
    }

    const { data } = await localLoopAxios.patch<LoopDefinition>(
      `${LOOP_API_BASE_PATH}/v1/${id}`,
      { enabled },
    );
    return data;
  }

  static async deleteLoop(id: string): Promise<void> {
    const active = getActiveBackend().backend;

    if (active.kind === "cloud") {
      await callCloudProxy<void>({
        backend: active,
        method: "DELETE",
        path: `${LOOP_API_BASE_PATH}/v1/${id}`,
      });
      return;
    }

    await localLoopAxios.delete(`${LOOP_API_BASE_PATH}/v1/${id}`);
  }

  static async dispatchLoop(id: string): Promise<LoopRun> {
    const active = getActiveBackend().backend;

    if (active.kind === "cloud") {
      return callCloudProxy<LoopRun>({
        backend: active,
        method: "POST",
        path: `${LOOP_API_BASE_PATH}/v1/${id}/dispatch`,
      });
    }

    const { data } = await localLoopAxios.post<LoopRun>(
      `${LOOP_API_BASE_PATH}/v1/${id}/dispatch`,
    );
    return data;
  }

  static async listLoopRuns(
    id: string,
    limit = 20,
    offset = 0,
  ): Promise<LoopRunsResponse> {
    const active = getActiveBackend().backend;

    if (active.kind === "cloud") {
      return callCloudProxy<LoopRunsResponse>({
        backend: active,
        method: "GET",
        path: `${LOOP_API_BASE_PATH}/v1/${id}/runs?${buildPaginationQuery(limit, offset)}`,
      });
    }

    const { data } = await localLoopAxios.get<LoopRunsResponse>(
      `${LOOP_API_BASE_PATH}/v1/${id}/runs`,
      { params: { limit, offset } },
    );
    return data;
  }
}

export default LoopService;
