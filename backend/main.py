"""
main.py
-------
FastAPI application entry-point.

Startup behaviour
-----------------
- TF-IDF vectorizer is fitted once when the server starts.
- The dataset and pre-computed TF-IDF matrix are kept in memory.
- Each request uses the shared in-memory artefacts — no reloading.

Run locally
-----------
    uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

Or via the convenience script at the repo root:
    python -m backend.main
"""

from __future__ import annotations

import logging
import math
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, Response

from backend.config import settings
from backend.ml.logic import (
    generate_4_week_plan,
    get_mini_projects,
    get_resources_for_skills,
    get_strengths_and_missing,
    recommend,
)
from backend.ml.model import MLModel, model as _global_model
from backend.schemas import (
    HealthResponse,
    LOW_CONFIDENCE_THRESHOLD,
    RecommendRequest,
    RecommendResponse,
    RoleRecommendation,
)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — replaces deprecated @app.on_event("startup")
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML artefacts before serving any request."""
    logger.info("Loading ML model from: %s", settings.csv_path)
    _global_model.load(settings.csv_path)
    logger.info("ML model loaded and ready.")
    yield
    # (optional teardown logic goes here)
    logger.info("Shutting down — cleaning up.")


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Production-grade REST API for AI-based career path recommendations "
        "using TF-IDF vectorization and cosine similarity."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Dependency injection — provides the loaded model to route handlers
# ---------------------------------------------------------------------------
def get_model() -> MLModel:
    """FastAPI dependency that returns the shared, pre-loaded ML model."""
    if not _global_model.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML model is not ready yet. Please try again in a moment.",
        )
    return _global_model


# ---------------------------------------------------------------------------
# Utility routes
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    """Redirect bare root to the interactive API docs."""
    return RedirectResponse(url="/docs")


@app.get("/favicon.ico", include_in_schema=False)
def favicon() -> Response:
    """Return an empty 204 so browsers stop logging 404s."""
    return Response(status_code=204)


@app.get("/sw.js", include_in_schema=False)
def service_worker() -> Response:
    """
    Swagger UI probes for a service worker on first load.
    Return an empty script so the browser doesn't log a 404.
    """
    return Response(content="", media_type="application/javascript", status_code=200)


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse, tags=["Monitoring"])
def health_check(ml_model: MLModel = Depends(get_model)) -> HealthResponse:
    """
    Liveness / readiness probe.
    Returns 200 when the ML model is loaded and the service is accepting requests.
    """
    return HealthResponse(
        status="ok",
        model_ready=ml_model.is_ready,
        dataset_rows=len(ml_model.df) if ml_model.df is not None else None,
    )


@app.post(
    "/recommend",
    response_model=RecommendResponse,
    status_code=status.HTTP_200_OK,
    tags=["Recommendations"],
    summary="Get career path recommendations based on skills",
)
def recommend_careers(
    request: RecommendRequest,
    ml_model: MLModel = Depends(get_model),
) -> RecommendResponse:
    """
    Given a comma-separated list of skills, returns the top-N best-matching
    job roles together with:

    - Match score (cosine similarity %)
    - Average salary
    - Skill strengths (what the user already has)
    - Missing skills (gaps to fill)
    - Curated learning resources
    - 4-week personalised action plan
    - Mini-project ideas
    """
    try:
        top_df = recommend(request.skills, ml_model, top_n=request.top_n)
    except Exception as exc:
        logger.exception("Error during recommendation: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while computing recommendations.",
        ) from exc

    # Normalise user skill list once — used for every role below
    user_skill_list = [
        s.strip()
        for s in request.skills.lower().replace("/", ",").replace(";", ",").split(",")
        if s.strip()
    ]

    recommendations: list[RoleRecommendation] = []

    for _, row in top_df.iterrows():
        # ── Score calibration ──────────────────────────────────────────────
        # Raw TF-IDF cosine similarity is compressed toward 0 on short keyword
        # lists — a perfect match typically peaks at 0.5–0.65, never 1.0.
        # Square-root calibration expands the mid-range to an intuitive scale
        # while preserving relative ranking (monotonic transform).
        raw_cosine = float(row["score"])          # 0.0 – 1.0
        calibrated = math.sqrt(raw_cosine)        # sqrt stretches mid-range up
        score_pct = round(min(calibrated * 100, 98.0), 1)

        role_skill_list = [
            s.strip()
            for s in str(row["skills"]).lower().split(",")
            if s.strip()
        ]

        strengths, missing = get_strengths_and_missing(user_skill_list, role_skill_list)
        resources = get_resources_for_skills(missing)
        action_plan = generate_4_week_plan(missing)
        mini_projects = get_mini_projects(str(row["role"]))

        # Motivational headline
        if score_pct >= 85:
            headline = "Excellent fit — polish your portfolio & start applying!"
        elif score_pct >= 75:
            headline = "Solid fit — close a few skill gaps to level up!"
        elif score_pct >= 60:
            headline = "Good match — follow the 4-week plan to get job-ready!"
        elif score_pct >= LOW_CONFIDENCE_THRESHOLD:
            headline = "Promising path — build the missing skills step by step!"
        else:
            headline = "Closest available match — your skill set may need a niche role not yet in our dataset."

        is_low_confidence = score_pct < LOW_CONFIDENCE_THRESHOLD

        recommendations.append(
            RoleRecommendation(
                role=str(row["role"]),
                match_score=score_pct,
                avg_salary=int(row["avg_salary"]),
                strengths=strengths,
                missing_skills=missing,
                resources=resources,
                action_plan=action_plan,
                mini_projects=mini_projects,
                headline=headline,
                low_confidence=is_low_confidence,
            )
        )

    # Determine whether ALL results are low-confidence
    all_low = all(r.low_confidence for r in recommendations)
    suggestion = (
        "None of the roles in our dataset closely match your skills. "
        "Try adding more recognised skill keywords (e.g. 'python', 'react', 'aws'), "
        "or your role may not yet be in our dataset — more roles are added regularly."
        if all_low else None
    )

    return RecommendResponse(
        recommendations=recommendations,
        total_results=len(recommendations),
        input_skills=request.skills,
        no_strong_match=all_low,
        suggestion=suggestion,
    )


# ---------------------------------------------------------------------------
# Entry-point for `python -m backend.main`
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
