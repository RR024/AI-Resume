// lib/types.ts
// Mirror the Pydantic response schemas from the FastAPI backend

export interface RoleRecommendation {
  role: string;
  match_score: number;        // 0–100
  avg_salary: number;         // INR per year
  strengths: string[];
  missing_skills: string[];
  resources: string[];
  action_plan: string[];
  mini_projects: string[];
  headline: string;
  low_confidence: boolean;    // true when match_score < 20%
}

export interface RecommendResponse {
  recommendations: RoleRecommendation[];
  total_results: number;
  input_skills: string;
  no_strong_match: boolean;   // true when ALL results are low-confidence
  suggestion: string | null;  // helpful message when no_strong_match is true
}

export interface RecommendRequest {
  skills: string;
  top_n: number;
}

export interface HealthResponse {
  status: string;
  model_ready: boolean;
  dataset_rows: number | null;
}

// UI-only state type used in the results dashboard
export interface ResultsState {
  data: RecommendResponse | null;
  loading: boolean;
  error: string | null;
}
