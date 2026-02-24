import axios from "axios";
import type { RecommendRequest, RecommendResponse, HealthResponse } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const client = axios.create({ baseURL: BASE, timeout: 15_000 });

export async function fetchRecommendations(req: RecommendRequest): Promise<RecommendResponse> {
  const { data } = await client.post<RecommendResponse>("/recommend", req);
  return data;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await client.get<HealthResponse>("/health");
  return data;
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK")
      return "Cannot reach the API server. Make sure the backend is running on port 8000.";
    return err.response?.data?.detail ?? err.message ?? "Request failed";
  }
  return err instanceof Error ? err.message : "An unexpected error occurred.";
}
