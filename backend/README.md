# AI Career Path Recommender — FastAPI Backend

Production-grade REST API built with **FastAPI**, **scikit-learn** (TF-IDF + cosine similarity), and **Pydantic v2**.

---

## Project structure

```
backend/
├── __init__.py
├── main.py            ← FastAPI app, routes, lifespan startup
├── config.py          ← Pydantic-Settings config (env-var / .env override)
├── schemas.py         ← Request / response Pydantic models
├── requirements.txt
├── data/
│   └── job_roles.csv  ← Dataset (loaded once at startup)
└── ml/
    ├── __init__.py
    ├── model.py       ← MLModel class — fits TF-IDF, caches matrix
    └── logic.py       ← recommend(), helpers, RESOURCE_DB, MINI_PROJECTS
```

---

## Local setup

### 1 — Create & activate a virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python -m venv .venv
source .venv/bin/activate
```

### 2 — Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3 — Run the server

Run from the **repository root** (one level above `backend/`) so Python can
resolve the `backend.*` package imports correctly:

```bash
# from repo root  (d:\Client's\AI resume\)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- Swagger UI  → http://localhost:8000/docs
- ReDoc       → http://localhost:8000/redoc
- Health      → http://localhost:8000/health

---

## API reference

### `POST /recommend`

**Request body**

```json
{
  "skills": "python, sql, pandas",
  "top_n": 3
}
```

| Field    | Type   | Required | Default | Notes                      |
|----------|--------|----------|---------|----------------------------|
| `skills` | string | ✅       | —       | Comma-separated skill list |
| `top_n`  | int    | ❌       | 3       | 1 – 10                     |

**Response (200)**

```json
{
  "recommendations": [
    {
      "role": "Data Scientist",
      "match_score": 82.4,
      "avg_salary": 1200000,
      "strengths": ["python", "pandas", "sql"],
      "missing_skills": ["machine learning", "statistics", "sklearn"],
      "resources": [
        "Machine Learning by Andrew Ng (Coursera)",
        "Intro to Statistics (Khan Academy)"
      ],
      "action_plan": [
        "Week 1: Learn & practice — machine learning , statistics (2-4 small exercises + 1 mini-project task)",
        "Week 2: Learn & practice — sklearn , data visualization (2-4 small exercises + 1 mini-project task)",
        "Week 3: Learn & practice — deep learning , communication (2-4 small exercises + 1 mini-project task)",
        "Week 4: Reinforce earlier topics and build mini-projects."
      ],
      "mini_projects": [
        "End-to-end Titanic-like classification project",
        "Exploratory Data Analysis + visual storytelling",
        "Small web demo (Streamlit) showing predictions"
      ],
      "headline": "Excellent fit — polish & showcase!"
    }
  ],
  "total_results": 1,
  "input_skills": "python, sql, pandas"
}
```

### `GET /health`

```json
{
  "status": "ok",
  "model_ready": true,
  "dataset_rows": 75
}
```

---

## Example curl commands

```bash
# Basic recommendation
curl -X POST http://localhost:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"skills": "python, sql, pandas", "top_n": 3}'

# Health check
curl http://localhost:8000/health

# Windows PowerShell
Invoke-RestMethod -Uri http://localhost:8000/recommend `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"skills": "python, sql, pandas", "top_n": 3}'
```

---

## Environment variables / `.env`

Create a `.env` file in the **repo root** (next to `backend/`) to override defaults:

```dotenv
CSV_PATH=backend/data/job_roles.csv
DEBUG=false
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=*
```

---

## Deployment (Render / Railway)

### Render

1. Create a new **Web Service**, connect your repo.
2. **Build command:** `pip install -r backend/requirements.txt`
3. **Start command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Set the `PORT` environment variable in the Render dashboard (Render injects it automatically).

### Railway

1. Connect repo → Railway auto-detects `requirements.txt`.
2. Set **Start command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. Add any required environment variables in the Railway settings panel.

---

## Design decisions

| Decision | Rationale |
|---|---|
| TF-IDF matrix pre-computed at startup | Avoids re-fitting on every request; `O(1)` lookup per call |
| `asynccontextmanager` lifespan | Modern FastAPI pattern; replaces deprecated `@app.on_event` |
| Pydantic v2 `BaseModel` + `field_validator` | Strong input validation with clear error messages |
| `pydantic-settings` for config | Twelve-factor-app compliant; easy .env / env-var override |
| Dependency injection via `Depends(get_model)` | Testable — mock the model in unit tests without monkey-patching |
| Pure-Python ML logic (no Streamlit imports) | Separates UI concerns from business logic completely |
