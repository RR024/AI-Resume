// lib/types.ts — mirrors FastAPI Pydantic schemas

export interface RoleRecommendation {
  role: string;
  match_score: number;
  avg_salary: number;
  strengths: string[];
  missing_skills: string[];
  resources: string[];
  action_plan: string[];
  mini_projects: string[];
  headline: string;
  low_confidence: boolean;
}

export interface RecommendResponse {
  recommendations: RoleRecommendation[];
  total_results: number;
  input_skills: string;
  no_strong_match: boolean;
  suggestion: string | null;
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
