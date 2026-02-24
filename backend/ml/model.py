"""
ml/model.py
-----------
Responsible for loading the dataset and precomputing the TF-IDF
matrix exactly once at application startup.  All inference calls
share the same in-memory objects — no re-training per request.
"""

from __future__ import annotations

import logging
import os
import re
from typing import Optional

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
_BASE_ROWS: list[tuple[str, str, int]] = [
    ("Data Scientist",                "python, machine learning, statistics, pandas, numpy, sklearn, data visualization, SQL, deep learning, communication",                1_200_000),
    ("Machine Learning Engineer",     "python, tensorflow, pytorch, machine learning, algorithms, system design, docker, kubernetes, mlops",                                1_400_000),
    ("Data Analyst",                  "excel, sql, tableau, power bi, pandas, data cleaning, visualization, statistics",                                                   700_000),
    ("Business Analyst",              "excel, sql, communication, stakeholder management, requirement gathering, powerpoint, tableau",                                      850_000),
    ("Backend Developer",             "java, springboot, sql, rest api, microservices, jdbc, docker, git",                                                                 900_000),
    ("Frontend Developer",            "html, css, javascript, react, responsive design, webpack, ui/ux basics",                                                            800_000),
    ("Full Stack Developer",          "javascript, react, nodejs, express, sql, mongodb, rest api, docker",                                                                1_100_000),
    ("DevOps Engineer",               "linux, docker, kubernetes, ci/cd, aws, terraform, monitoring, scripting",                                                           1_300_000),
    ("AI Researcher",                 "python, deep learning, pytorch, tensorflow, research, math, numpy, publications",                                                   1_600_000),
    ("NLP Engineer",                  "python, nlp, transformers, huggingface, tokenization, pytorch, text preprocessing",                                                 1_400_000),
    ("Computer Vision Engineer",      "python, opencv, deep learning, convolutional networks, pytorch, tensorflow",                                                        1_450_000),
    ("Product Manager",               "product management, communication, stakeholder management, analytics, roadmap, prioritization",                                     1_500_000),
    ("QA Engineer",                   "testing, selenium, automation, pytest, test plans, bug reporting",                                                                  700_000),
    ("Cloud Engineer",                "aws, azure, gcp, cloud architecture, terraform, docker, kubernetes",                                                                1_400_000),
    ("Mobile Developer",              "android, kotlin, java, ios, swift, mobile ui, rest api",                                                                           1_000_000),
    ("Cybersecurity Analyst",         "networking, security, linux, incident response, penetration testing, wireshark",                                                    1_300_000),
    ("Business Intelligence Engineer","sql, tableau, power bi, data modeling, etl, redshift, bigquery",                                                                    1_200_000),
    ("Data Engineer",                 "python, spark, sql, etl, airflow, data pipelines, aws",                                                                            1_350_000),
    ("SRE (Site Reliability Engineer)","linux, monitoring, terraform, kubernetes, python, incident management",                                                            1_450_000),
    ("Automation Engineer",           "selenium, python, test automation, ci/cd, jenkins, pytest",                                                                        900_000),
    ("Technical Writer",              "technical writing, communication, documentation, markdown, product knowledge",                                                      700_000),
    ("Sales Engineer",                "communication, product knowledge, sales, demos, crm, negotiation",                                                                  850_000),
    ("HR Analytics",                  "excel, sql, python, analytics, communication, dashboards",                                                                          800_000),
    ("Cloud Architect",               "architectural design, aws, azure, gcp, security, cost optimization",                                                               2_000_000),
    ("Robotics Engineer",             "c++, robotics, control systems, sensors, python, ros",                                                                             1_300_000),
    # ── Additional niche / high-demand roles ────────────────────────────────
    ("Game Developer",                "unity, unreal engine, c++, c#, game physics, 3d modeling, opengl, gameplay programming",                                           1_100_000),
    ("Blockchain Developer",          "solidity, ethereum, smart contracts, web3, truffle, hardhat, javascript, cryptography",                                             1_600_000),
    ("AR/VR Developer",               "unity, unreal engine, ar, vr, xr, c#, spatial computing, 3d design, openxr",                                                      1_400_000),
    ("Embedded Systems Engineer",     "c, c++, rtos, microcontrollers, firmware, hardware, iot, serial protocols, embedded linux",                                        1_200_000),
    ("Data Science Manager",          "python, machine learning, leadership, team management, stakeholder communication, strategy, data strategy",                         2_200_000),
    ("Technical Program Manager",     "project management, agile, scrum, communication, risk management, roadmap, stakeholder management, jira",                          1_800_000),
    ("Security Engineer",             "penetration testing, security, vulnerability assessment, siem, python, linux, cloud security, compliance",                         1_600_000),
    ("UI/UX Designer",                "figma, sketch, user research, wireframing, prototyping, usability testing, design systems, css",                                   900_000),
    ("Flutter Developer",             "flutter, dart, mobile development, android, ios, rest api, firebase, ui design",                                                   1_000_000),
    ("Django Developer",              "python, django, rest api, postgresql, orm, html, css, docker",                                                                     900_000),
    ("MLOps Engineer",                "mlops, python, docker, kubernetes, mlflow, kubeflow, ci/cd, model deployment, monitoring",                                         1_500_000),
]


def _build_default_dataset() -> pd.DataFrame:
    """Create the full dataset (base + Junior / Senior variants)."""
    rows = list(_BASE_ROWS)
    for role, skills, sal in _BASE_ROWS:
        rows.append((f"Junior {role}", skills + ", basics, eagerness to learn", int(sal * 0.55)))
        rows.append((f"Senior {role}", skills + ", leadership, architecture, mentoring", int(sal * 1.60)))
    return pd.DataFrame(rows, columns=["role", "skills", "avg_salary"])


def _load_dataframe(csv_path: str) -> pd.DataFrame:
    """Load CSV; generate and save it if missing."""
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        logger.info("Loaded dataset from %s (%d rows)", csv_path, len(df))
    else:
        logger.warning("CSV not found at %s — generating default dataset.", csv_path)
        df = _build_default_dataset()
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        df.to_csv(csv_path, index=False)
        logger.info("Saved generated dataset to %s", csv_path)
    return df


# ---------------------------------------------------------------------------
# Public model state (populated once via load_model())
# ---------------------------------------------------------------------------
class MLModel:
    """Container for all ML artefacts loaded at startup."""

    def __init__(self) -> None:
        self.df: Optional[pd.DataFrame] = None
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.X = None          # sparse TF-IDF matrix
        self.is_ready: bool = False

    # ------------------------------------------------------------------
    def load(self, csv_path: str) -> None:
        """Load data and fit/precompute everything. Call once at startup."""
        df = _load_dataframe(csv_path)
        df["skills_clean"] = (
            df["skills"]
            .astype(str)
            .str.lower()
            .str.replace(r"[^a-z0-9, ]", " ", regex=True)
        )

        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        X = vectorizer.fit_transform(df["skills_clean"])

        self.df = df
        self.vectorizer = vectorizer
        self.X = X
        self.is_ready = True
        logger.info("TF-IDF model ready — vocab size: %d, dataset rows: %d",
                    len(vectorizer.vocabulary_), len(df))

    # ------------------------------------------------------------------
    def similarity_scores(self, user_skills_text: str):
        """Return a flat array of cosine-similarity scores for every role."""
        if not self.is_ready:
            raise RuntimeError("Model not loaded. Call load() first.")
        cleaned = re.sub(r"[^a-z0-9, ]", " ", user_skills_text.lower().strip().replace(",", " "))
        user_vec = self.vectorizer.transform([cleaned])
        return cosine_similarity(user_vec, self.X).flatten()


# Module-level singleton — imported by main.py and injected via FastAPI
model = MLModel()
