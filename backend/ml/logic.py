"""
ml/logic.py
-----------
Pure ML logic: recommendation, skill-gap analysis, resource lookup,
and 4-week action-plan generation.
No framework dependencies — all functions take plain Python objects.
"""

from __future__ import annotations

from typing import Dict, List, Tuple

import pandas as pd

from backend.ml.model import MLModel

# ---------------------------------------------------------------------------
# Knowledge bases (constants)
# ---------------------------------------------------------------------------
RESOURCE_DB: Dict[str, List[str]] = {
    "python":             ["Complete Python Bootcamp (Udemy) — by Jose Portilla", "Python for Data Science (Coursera)"],
    "machine learning":   ["Machine Learning by Andrew Ng (Coursera)", "Hands-On ML with Scikit-Learn, Keras & TF (book)"],
    "deep learning":      ["Deep Learning Specialization (Coursera)", "fast.ai Practical Deep Learning"],
    "nlp":                ["Hugging Face Course", "Natural Language Processing Specialization (Coursera)"],
    "sql":                ["Mode Analytics SQL Tutorial", "SQL for Data Science (Coursera)"],
    "react":              ["React - The Complete Guide (Udemy)", "Official React docs (interactive tutorial)"],
    "docker":             ["Docker for Developers (Udemy)", "Play with Docker labs"],
    "kubernetes":         ["Kubernetes Basics (official)", "CKA practice resources"],
    "aws":                ["AWS Cloud Practitioner / Solutions Architect fundamentals"],
    "data visualization": ["Data Visualization with Tableau (Coursera)", "Storytelling with Data (book)"],
    "statistics":         ["Intro to Statistics (Khan Academy)", "Statistics for Data Science (Coursera)"],
    "pandas":             ["Data Analysis with Pandas (Kaggle)", "Pandas official tutorial"],
    "tensorflow":         ["TensorFlow in Practice Specialization (Coursera)"],
    "pytorch":            ["Deep Learning with PyTorch (Udemy)"],
    "git":                ["Git & GitHub Crash Course (Udemy)"],
    "excel":              ["Excel for Data Analysis (Coursera)"],
    "communication":      ["Improving Communication Skills (Coursera)"],
    "android":            ["Android Development for Beginners (Udemy)", "Android Developer Official Docs"],
    "kotlin":             ["Kotlin for Android Developers (Udemy)", "Kotlinlang.org tutorials"],
    "ios":                ["iOS App Development with Swift (Udemy)", "Apple Developer Tutorials"],
    "swift":              ["Swift Programming: The Big Nerd Ranch Guide", "Apple Swift Playgrounds"],
    "mobile ui":          ["Material Design Guidelines", "Mobile UI/UX courses on Coursera"],
    "rest api":           ["REST API design (Udemy)", "Build APIs with Flask / FastAPI (tutorials)"],
    "leadership":         ["Leadership courses on Coursera", "Managerial Skills resources"],
    "architecture":       ["System Design Primer (GitHub)", "Designing Data-Intensive Applications (book)"],
}

MINI_PROJECTS: Dict[str, List[str]] = {
    "Mobile Developer": [
        "Build a simple ToDo app (Android or iOS) — CRUD + local storage",
        "Build a weather app — REST API integration (public API)",
        "Deploy one app on Play Store / TestFlight (basic release workflow)",
    ],
    "Backend Developer": [
        "Build REST API for a Bookstore using Spring Boot",
        "Implement JWT auth + CRUD endpoints",
        "Containerize with Docker",
    ],
    "Data Scientist": [
        "End-to-end Titanic-like classification project",
        "Exploratory Data Analysis + visual storytelling",
        "Small web demo (Streamlit) showing predictions",
    ],
    "default": [
        "Build a small portfolio project showcasing the missing skills",
        "Convert the project into a short video/demo",
        "Add code to GitHub and write a README",
    ],
}


# ---------------------------------------------------------------------------
# Core logic functions
# ---------------------------------------------------------------------------

def recommend(
    user_skills_text: str,
    model: MLModel,
    top_n: int = 3,
) -> pd.DataFrame:
    """
    Compute cosine-similarity scores and return the top-N matching roles
    as a DataFrame with an extra 'score' column.
    """
    scores = model.similarity_scores(user_skills_text)
    df_result = model.df.copy()
    df_result["score"] = scores
    df_result = df_result.sort_values("score", ascending=False).reset_index(drop=True)
    return df_result.head(top_n).copy()


def get_strengths_and_missing(
    user_skill_list: List[str],
    role_skill_list: List[str],
) -> Tuple[List[str], List[str]]:
    """
    Split role skills into those the user already has (strengths)
    and those they lack (missing skills).
    Matching is fuzzy: a role skill counts as matched if any user skill
    is a substring of it, or vice-versa.
    """
    strengths: List[str] = []
    missing: List[str] = []

    for rs in role_skill_list:
        matched = any(us in rs or rs in us for us in user_skill_list)
        (strengths if matched else missing).append(rs)

    # deduplicate while preserving order
    return list(dict.fromkeys(strengths)), list(dict.fromkeys(missing))


def get_resources_for_skills(skills_list: List[str], limit: int = 4) -> List[str]:
    """
    Look up curated learning resources for each missing skill.
    Falls back to a generic search suggestion when no exact/partial key found.
    """
    collected: List[str] = []

    for sk in skills_list:
        sk_key = sk.strip().lower()
        if sk_key in RESOURCE_DB:
            collected.extend(RESOURCE_DB[sk_key][:limit])
        else:
            for key, resources in RESOURCE_DB.items():
                if key in sk_key or sk_key in key:
                    collected.extend(resources[:limit])
                    break
            else:
                collected.append(f"Search a practical course for '{sk}' on Coursera/Udemy")

    # deduplicate, cap at 6
    seen = set()
    final: List[str] = []
    for r in collected:
        if r not in seen:
            final.append(r)
            seen.add(r)
    return final[:6]


def generate_4_week_plan(missing_skills: List[str]) -> List[str]:
    """
    Produce a simple, heuristic 4-week learning plan based on missing skills.
    """
    if not missing_skills:
        return [
            "Week 1: Build a small capstone project combining your strengths.",
            "Week 2: Polish GitHub repo and write README + demo video.",
            "Week 3: Apply to 10 roles and tailor your resume.",
            "Week 4: Prepare for interviews (DS/Algo/basic system design).",
        ]

    short = missing_skills[:6]
    chunk_size = max(1, len(short) // 4)
    weeks: List[str] = []

    for i in range(4):
        start = i * chunk_size
        chunk = short[start : start + chunk_size]
        if not chunk:
            weeks.append(f"Week {i + 1}: Reinforce earlier topics and build mini-projects.")
        else:
            skills_text = " , ".join(chunk)
            weeks.append(
                f"Week {i + 1}: Learn & practice: {skills_text}"
                " (2-4 small exercises + 1 mini-project task)"
            )

    return weeks


def get_mini_projects(role_name: str) -> list[str]:
    """Return role-specific or default mini-project suggestions."""
    # Try exact match, then strip seniority prefix
    for key in [role_name, role_name.split(" - ")[0], role_name.split(",")[0]]:
        if key in MINI_PROJECTS:
            return MINI_PROJECTS[key]
    return MINI_PROJECTS["default"]
