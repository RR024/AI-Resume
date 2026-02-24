// lib/api.ts
// Axios instance + typed API functions

import axios, { AxiosError } from "axios";
import type { RecommendRequest, RecommendResponse, HealthResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30_000, // 30 s — generous for cold-start on free tiers
});

// ── Typed API wrappers ────────────────────────────────────────────────────────

export async function fetchRecommendations(
  payload: RecommendRequest
): Promise<RecommendResponse> {
  const { data } = await apiClient.post<RecommendResponse>("/recommend", payload);
  return data;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>("/health");
  return data;
}

// ── Error helper ─────────────────────────────────────────────────────────────

export function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
      return "Cannot reach the backend. Make sure the server is running on " + BASE_URL;
    }
    if (err.response?.status === 422) {
      const detail = err.response.data?.detail;
      if (Array.isArray(detail)) {
        return detail.map((d: { msg: string }) => d.msg).join(", ");
      }
      return "Invalid input. Please check your skills.";
    }
    if (err.response?.status === 503) {
      return "The ML model is still loading. Please try again in a moment.";
    }
    return err.response?.data?.detail ?? err.message ?? "Request failed";
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred.";
}
