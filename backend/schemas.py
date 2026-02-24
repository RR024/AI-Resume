"""
schemas.py
----------
Pydantic v2 models for all API request / response contracts.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Request
# ---------------------------------------------------------------------------

class RecommendRequest(BaseModel):
    """Body for POST /recommend."""

    skills: str = Field(
        ...,
        min_length=2,
        max_length=2000,
        description="Comma-separated skills string, e.g. 'python, sql, pandas'",
        examples=["python, sql, pandas"],
    )
    top_n: int = Field(
        default=3,
        ge=1,
        le=10,
        description="Number of top role recommendations to return (1-10)",
    )

    @field_validator("skills")
    @classmethod
    def skills_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("skills must not be blank")
        return stripped


# ---------------------------------------------------------------------------
# Response ── nested building blocks
# ---------------------------------------------------------------------------

class RoleRecommendation(BaseModel):
    """A single recommended career role with full details."""

    role: str = Field(..., description="Job role title")
    match_score: float = Field(..., description="Cosine-similarity match score as a percentage (0-100)")
    avg_salary: int = Field(..., description="Average annual salary in INR")
    strengths: List[str] = Field(..., description="Skills the user already has that match this role")
    missing_skills: List[str] = Field(..., description="Skills gaps — things to learn next")
    resources: List[str] = Field(..., description="Curated learning resources for the missing skills")
    action_plan: List[str] = Field(..., description="4-week personalised learning roadmap")
    mini_projects: List[str] = Field(..., description="Suggested hands-on projects for this role")
    headline: str = Field(..., description="Motivational headline based on match score")


class RecommendResponse(BaseModel):
    """Top-level response for POST /recommend."""

    recommendations: List[RoleRecommendation]
    total_results: int = Field(..., description="Number of recommendations returned")
    input_skills: str = Field(..., description="Echo of the normalised input skills")


# ---------------------------------------------------------------------------
# Health-check
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str
    model_ready: bool
    dataset_rows: Optional[int] = None
