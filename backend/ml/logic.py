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
    # ── Data / ML / AI ───────────────────────────────────────────────────────
    "Data Scientist": [
        "End-to-end classification project (Titanic / Heart Disease) — EDA → model → evaluation",
        "Build an interactive Streamlit dashboard that shows live predictions",
        "Kaggle competition entry with a write-up notebook on GitHub",
    ],
    "Machine Learning Engineer": [
        "Train, version and serve an ML model via FastAPI + Docker",
        "Build an MLflow experiment tracker with model registry",
        "Recreate a classic paper (e.g. logistic regression from scratch) and benchmark it",
    ],
    "Data Analyst": [
        "Sales / e-commerce dashboard in Tableau or Power BI with 5+ KPI charts",
        "SQL-based cohort analysis — retention, churn, LTV",
        "Python EDA + storytelling notebook on a public dataset (Kaggle)",
    ],
    "Business Analyst": [
        "Write a full BRD + use-case diagram for a fictional HRMS system",
        "Build an Excel / Google Sheets model with pivot tables and scenario analysis",
        "Create a 10-slide stakeholder presentation with data-driven recommendations",
    ],
    "AI Researcher": [
        "Reproduce a recent NeurIPS/ICML paper and publish a blog post",
        "Implement a custom loss function and benchmark on CIFAR-10",
        "Build a small benchmark dataset and open-source it on HuggingFace",
    ],
    "NLP Engineer": [
        "Fine-tune a BERT model on a custom text classification task",
        "Build a retrieval-augmented Q&A chatbot with LangChain + FAISS",
        "Named-entity recognition API using HuggingFace Transformers + FastAPI",
    ],
    "Computer Vision Engineer": [
        "Real-time object detection app using YOLOv8 + OpenCV",
        "Build an image segmentation pipeline and visualise masks",
        "Fine-tune ResNet on a custom image dataset and deploy via Gradio",
    ],
    "MLOps Engineer": [
        "Set up a full CI/CD pipeline: train → test → containerise → deploy to cloud",
        "Build a model-monitoring dashboard that alerts on data drift",
        "Automate ML workflow with Kubeflow or Airflow DAGs",
    ],
    "Data Science Manager": [
        "Draft a data strategy document with OKRs for a hypothetical team",
        "Build a team skills-matrix tracker and growth roadmap in Notion/spreadsheet",
        "Create a project retrospective template and run it on a past personal project",
    ],
    # ── Engineering / Backend / Full-stack ───────────────────────────────────
    "Backend Developer": [
        "Build a fully documented REST API for a Bookstore — Spring Boot + PostgreSQL",
        "Implement JWT auth, role-based access control and refresh-token rotation",
        "Containerise the app with Docker and add a GitHub Actions CI pipeline",
    ],
    "Frontend Developer": [
        "Clone a popular site's UI (e.g. GitHub profile page) pixel-perfect with React",
        "Build a reusable component library published as an npm package",
        "Implement a dark-mode toggle + i18n support in an existing app",
    ],
    "Full Stack Developer": [
        "Full-stack social media MVP — auth, posts, likes, real-time notifications",
        "E-commerce checkout flow — cart, payment (Stripe test mode), order history",
        "Deploy on Vercel (frontend) + Railway (backend) with a shared PostgreSQL DB",
    ],
    "Django Developer": [
        "Blog platform with Django — user auth, rich-text posts, tags and pagination",
        "Build a REST API with Django REST Framework and document it with Swagger UI",
        "Integrate Celery + Redis for background email tasks and test with pytest",
    ],
    "Flutter Developer": [
        "Cross-platform expense tracker with local SQLite and chart visualisations",
        "Flutter app consuming a public REST API (e.g. OpenWeather) with state management",
        "Implement push notifications and Firebase Auth in a simple chat app",
    ],
    # ── Mobile ───────────────────────────────────────────────────────────────
    "Mobile Developer": [
        "ToDo app with CRUD, local Room/CoreData storage and MVVM architecture",
        "Weather app integrating a public REST API with animated weather icons",
        "Publish a polished app to Play Store / TestFlight and document the release process",
    ],
    # ── DevOps / Infrastructure ──────────────────────────────────────────────
    "DevOps Engineer": [
        "Build a CI/CD pipeline (GitHub Actions) that lints, tests and deploys to AWS ECS",
        "Provision infrastructure with Terraform — VPC, EC2, RDS, S3",
        "Set up Prometheus + Grafana monitoring stack with custom alerting rules",
    ],
    "Cloud Engineer": [
        "Deploy a 3-tier web app on AWS (or GCP/Azure) using IaC",
        "Design and implement a multi-region failover architecture",
        "Build a cost dashboard that tracks cloud spend by service tag",
    ],
    "Cloud Architect": [
        "Design a reference architecture diagram (draw.io) for a highly-available SaaS product",
        "Implement a zero-downtime blue/green deployment on Kubernetes",
        "Write an Architecture Decision Record (ADR) for a cloud migration scenario",
    ],
    "SRE (Site Reliability Engineer)": [
        "Set up an SLO/SLI/Error-Budget tracking dashboard in Grafana",
        "Write a runbook for a simulated production incident and conduct a post-mortem",
        "Automate on-call escalation with PagerDuty API or equivalent",
    ],
    "Automation Engineer": [
        "End-to-end test suite with Selenium + pytest for a demo e-commerce site",
        "API test collection in Postman / RestAssured with CI integration",
        "Implement a data-driven testing framework with parameterised test cases",
    ],
    # ── QA ───────────────────────────────────────────────────────────────────
    "QA Engineer": [
        "Write a comprehensive test plan + 50-case test suite for a login module",
        "Build a Selenium automation suite for a public demo app (e.g. SauceDemo)",
        "Track and triage 20 mock bugs in Jira with priority, steps, and screenshots",
    ],
    # ── Security ─────────────────────────────────────────────────────────────
    "Cybersecurity Analyst": [
        "Set up a home lab (VirtualBox) — run a Kali Linux vs DVWA penetration test",
        "Analyse a PCAP file with Wireshark, document findings in a security report",
        "Build a simple SIEM-style log aggregator in Python with alerting rules",
    ],
    "Security Engineer": [
        "Conduct a OWASP Top-10 audit on a deliberately vulnerable app (DVWA / Juice Shop)",
        "Write a vulnerability assessment report with CVSS scoring",
        "Implement secrets management using HashiCorp Vault in a Docker Compose stack",
    ],
    # ── Data Engineering ─────────────────────────────────────────────────────
    "Data Engineer": [
        "Build an end-to-end ETL pipeline: source API → transform (Spark/Pandas) → warehouse",
        "Orchestrate a multi-step pipeline with Apache Airflow DAGs and alert on failure",
        "Implement CDC (Change Data Capture) from a PostgreSQL source to a data lake",
    ],
    "Business Intelligence Engineer": [
        "Design a star-schema data model and build a Power BI / Tableau workbook",
        "Write complex SQL with window functions for a sales trends analysis",
        "Build an automated report that emails a PDF summary every Monday",
    ],
    # ── Product / Management ─────────────────────────────────────────────────
    "Product Manager": [
        "Write a full PRD (Product Requirement Document) for a new feature you've imagined",
        "Create a prioritised backlog with user stories, acceptance criteria and story points",
        "Build a product roadmap in Notion or Jira and present it as a 5-minute stakeholder pitch",
    ],
    "Technical Program Manager": [
        "Create a risk register and mitigation plan for a hypothetical project",
        "Build a project timeline in Jira with milestones, dependencies and critical path",
        "Write an OKR-aligned quarterly planning document for a 5-person engineering team",
    ],
    # ── Specialised / Emerging ────────────────────────────────────────────────
    "Game Developer": [
        "Build a 2D platformer in Unity with physics, collectibles and a score HUD",
        "Implement a simple enemy AI using finite state machines",
        "Create a shader pack and demonstrate 3 visual effects (glow, dissolve, water)",
    ],
    "Blockchain Developer": [
        "Write and deploy an ERC-20 token smart contract on a testnet",
        "Build a simple DeFi staking dApp with MetaMask wallet integration",
        "Audit a sample Solidity contract and write a vulnerability report",
    ],
    "AR/VR Developer": [
        "Build an AR scene in Unity + ARFoundation that places 3D objects on flat surfaces",
        "Create a VR mini-game with hand interactions using XR Interaction Toolkit",
        "Implement a spatial UI panel with gaze + pinch input for an XR app",
    ],
    "Embedded Systems Engineer": [
        "Build a temperature/humidity data-logger on Arduino and display readings on LCD",
        "Implement a FreeRTOS task scheduler for a sensor-fusion application",
        "Write and test a UART driver in C without using vendor HAL",
    ],
    "Robotics Engineer": [
        "Simulate a 2-DOF robotic arm in ROS2 + Gazebo with joint control",
        "Implement a PID controller for balancing a simulated pendulum",
        "Build a line-following robot with sensor calibration and obstacle avoidance",
    ],
    # ── Design / Content ──────────────────────────────────────────────────────
    "UI/UX Designer": [
        "Design a high-fidelity mobile app prototype in Figma with a complete design system",
        "Conduct 3 user interviews and synthesise insights into a usability report",
        "Redesign an existing app screen, document the before/after rationale",
    ],
    "Technical Writer": [
        "Write complete API documentation (OpenAPI-style) for a public REST API",
        "Create an onboarding guide for a CLI tool with examples and a troubleshooting FAQ",
        "Build a docs site with MkDocs or Docusaurus and publish it on GitHub Pages",
    ],
    # ── Business / People ─────────────────────────────────────────────────────
    "Sales Engineer": [
        "Build a product demo script and record a 5-minute screen-share walkthrough",
        "Create a competitive battlecard comparing your product vs two competitors",
        "Write a proof-of-concept proposal document for a mock enterprise deal",
    ],
    "HR Analytics": [
        "Build an attrition-prediction model on the IBM HR Analytics dataset",
        "Create an HR KPI dashboard (headcount, turnover rate, time-to-hire) in Power BI",
        "Perform a compensation equity analysis and present findings in a slide deck",
    ],
    # ── Fallback ─────────────────────────────────────────────────────────────
    "default": [
        "Build a portfolio project that demonstrates each of your missing skills end-to-end",
        "Record a short demo video of the project and publish it on YouTube / Loom",
        "Push the full source to GitHub with a detailed README, setup guide and live demo link",
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
    """Return role-specific or default mini-project suggestions.

    Lookup order:
    1. Exact match
    2. Strip leading seniority words (Junior / Senior / Lead / Staff)
    3. Partial key containment (role contains key or key contains role)
    4. Default fallback
    """
    import re as _re

    candidates = [role_name]
    # Strip seniority prefix: "Senior Data Scientist" → "Data Scientist"
    stripped = _re.sub(r'^(junior|senior|lead|staff|principal)\s+', '', role_name, flags=_re.IGNORECASE).strip()
    if stripped != role_name:
        candidates.append(stripped)
    # Also try splitting on " - " and ","
    candidates.append(role_name.split(" - ")[0].strip())
    candidates.append(role_name.split(",")[0].strip())

    for key_candidate in candidates:
        if key_candidate in MINI_PROJECTS:
            return MINI_PROJECTS[key_candidate]

    # Partial containment fallback
    role_lower = role_name.lower()
    for key in MINI_PROJECTS:
        if key == "default":
            continue
        if key.lower() in role_lower or role_lower in key.lower():
            return MINI_PROJECTS[key]

    return MINI_PROJECTS["default"]
