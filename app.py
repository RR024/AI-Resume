# app.py
"""
AI Career Path Recommender — ML version (Dark Mode Premium UI)
Final: Premium UI + Motivational Action Plans (Option C)
- Keeps TF-IDF + cosine similarity logic
- Keeps dark theme, cards, expanders
- Removed quick-tags & JSON download (per your request)
- Enhanced expander content to show motivational action plan + curated resources
"""

import streamlit as st
import pandas as pd
import numpy as np
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------------
# DATA + ML LOGIC (same)
# ---------------------------
def create_job_dataset(path="job_roles.csv"):
    rows = [
        ("Data Scientist", "python, machine learning, statistics, pandas, numpy, sklearn, data visualization, SQL, deep learning, communication", 1200000),
        ("Machine Learning Engineer", "python, tensorflow, pytorch, machine learning, algorithms, system design, docker, kubernetes, mlops", 1400000),
        ("Data Analyst", "excel, sql, tableau, power bi, pandas, data cleaning, visualization, statistics", 700000),
        ("Business Analyst", "excel, sql, communication, stakeholder management, requirement gathering, powerpoint, tableau", 850000),
        ("Backend Developer", "java, springboot, sql, rest api, microservices, jdbc, docker, git", 900000),
        ("Frontend Developer", "html, css, javascript, react, responsive design, webpack, ui/ux basics", 800000),
        ("Full Stack Developer", "javascript, react, nodejs, express, sql, mongodb, rest api, docker", 1100000),
        ("DevOps Engineer", "linux, docker, kubernetes, ci/cd, aws, terraform, monitoring, scripting", 1300000),
        ("AI Researcher", "python, deep learning, pytorch, tensorflow, research, math, numpy, publications", 1600000),
        ("NLP Engineer", "python, nlp, transformers, huggingface, tokenization, pytorch, text preprocessing", 1400000),
        ("Computer Vision Engineer", "python, opencv, deep learning, convolutional networks, pytorch, tensorflow", 1450000),
        ("Product Manager", "product management, communication, stakeholder management, analytics, roadmap, prioritization", 1500000),
        ("QA Engineer", "testing, selenium, automation, pytest, test plans, bug reporting", 700000),
        ("Cloud Engineer", "aws, azure, gcp, cloud architecture, terraform, docker, kubernetes", 1400000),
        ("Mobile Developer", "android, kotlin, java, ios, swift, mobile ui, rest api", 1000000),
        ("Cybersecurity Analyst", "networking, security, linux, incident response, penetration testing, wireshark", 1300000),
        ("Business Intelligence Engineer", "sql, tableau, power bi, data modeling, etl, redshift, bigquery", 1200000),
        ("Data Engineer", "python, spark, sql, etl, airflow, data pipelines, aws", 1350000),
        ("SRE (Site Reliability Engineer)", "linux, monitoring, terraform, kubernetes, python, incident management", 1450000),
        ("Automation Engineer", "selenium, python, test automation, ci/cd, jenkins, pytest", 900000),
        ("Technical Writer", "technical writing, communication, documentation, markdown, product knowledge", 700000),
        ("Sales Engineer", "communication, product knowledge, sales, demos, crm, negotiation", 850000),
        ("HR Analytics", "excel, sql, python, analytics, communication, dashboards", 800000),
        ("Cloud Architect", "architectural design, aws, azure, gcp, security, cost optimization", 2000000),
        ("Robotics Engineer", "c++, robotics, control systems, sensors, python, ros", 1300000),
    ]
    df = pd.DataFrame(rows, columns=["role", "skills", "avg_salary"])
    extras = []
    for role, skills, sal in rows:
        extras.append((f"Junior {role}", skills + ", basics, eagerness to learn", int(sal*0.55)))
        extras.append((f"Senior {role}", skills + ", leadership, architecture, mentoring", int(sal*1.6)))
    df = pd.concat([df, pd.DataFrame(extras, columns=["role","skills","avg_salary"])], ignore_index=True)
    df.to_csv(path, index=False)
    return df


@st.cache_data
def load_and_vectorize(path="job_roles.csv"):
    if not os.path.exists(path):
        df = create_job_dataset(path)
    else:
        df = pd.read_csv(path)
    df["skills_clean"] = df["skills"].astype(str).str.lower().str.replace(r"[^a-z0-9, ]", " ", regex=True)
    vectorizer = TfidfVectorizer(ngram_range=(1,2), stop_words='english')
    X = vectorizer.fit_transform(df["skills_clean"])
    return df, vectorizer, X


def recommend(user_skills_text, df, vectorizer, X, top_n=3):
    user_skills_text = user_skills_text.lower().strip().replace(",", " ")
    user_vec = vectorizer.transform([user_skills_text])
    sims = cosine_similarity(user_vec, X).flatten()
    df_result = df.copy()
    df_result["score"] = sims
    df_result = df_result.sort_values("score", ascending=False).reset_index(drop=True)
    top = df_result.head(top_n).copy()
    return top, sims


# ---------------------------
# Knowledge base: curated resources and mini-projects
# ---------------------------
RESOURCE_DB = {
    "python": ["Complete Python Bootcamp (Udemy) — by Jose Portilla", "Python for Data Science (Coursera)"],
    "machine learning": ["Machine Learning by Andrew Ng (Coursera)", "Hands-On ML with Scikit-Learn, Keras & TF (book)"],
    "deep learning": ["Deep Learning Specialization (Coursera)", "fast.ai Practical Deep Learning"],
    "nlp": ["Hugging Face Course", "Natural Language Processing Specialization (Coursera)"],
    "sql": ["Mode Analytics SQL Tutorial", "SQL for Data Science (Coursera)"],
    "react": ["React - The Complete Guide (Udemy)", "Official React docs (interactive tutorial)"],
    "docker": ["Docker for Developers (Udemy)", "Play with Docker labs"],
    "kubernetes": ["Kubernetes Basics (official)", "CKA practice resources"],
    "aws": ["AWS Cloud Practitioner / Solutions Architect fundamentals"],
    "data visualization": ["Data Visualization with Tableau (Coursera)", "Storytelling with Data (book)"],
    "statistics": ["Intro to Statistics (Khan Academy)", "Statistics for Data Science (Coursera)"],
    "pandas": ["Data Analysis with Pandas (Kaggle)", "Pandas official tutorial"],
    "tensorflow": ["TensorFlow in Practice Specialization (Coursera)"],
    "pytorch": ["Deep Learning with PyTorch (Udemy)"],
    "git": ["Git & GitHub Crash Course (Udemy)"],
    "excel": ["Excel for Data Analysis (Coursera)"],
    "communication": ["Improving Communication Skills (Coursera)"],
    "android": ["Android Development for Beginners (Udemy)", "Android Developer Official Docs"],
    "kotlin": ["Kotlin for Android Developers (Udemy)", "Kotlinlang.org tutorials"],
    "ios": ["iOS App Development with Swift (Udemy)", "Apple Developer Tutorials"],
    "swift": ["Swift Programming: The Big Nerd Ranch Guide", "Apple Swift Playgrounds"],
    "mobile ui": ["Material Design Guidelines", "Mobile UI/UX courses on Coursera"],
    "rest api": ["REST API design (Udemy)", "Build APIs with Flask / FastAPI (tutorials)"],
    "leadership": ["Leadership courses on Coursera", "Managerial Skills resources"],
    "architecture": ["System Design Primer (GitHub)", "Designing Data-Intensive Applications (book)"],
}

MINI_PROJECTS = {
    "Mobile Developer": [
        "1) Build a simple ToDo app (Android or iOS) — CRUD + local storage",
        "2) Build a weather app — REST API integration (public API)",
        "3) Deploy one app on Play Store / TestFlight (basic release workflow)"
    ],
    "Backend Developer": [
        "1) Build REST API for a Bookstore using Spring Boot",
        "2) Implement JWT auth + CRUD endpoints",
        "3) Containerize with Docker"
    ],
    "Data Scientist": [
        "1) End-to-end Titanic-like classification project",
        "2) Exploratory Data Analysis + visual storytelling",
        "3) Small web demo (Streamlit) showing predictions"
    ],
    # fallback mini projects:
    "default": [
        "1) Build a small portfolio project showcasing the missing skills",
        "2) Convert the project into a short video/demo",
        "3) Add code to GitHub and write a README"
    ]
}

# ---------------------------
# Helpers for user-facing action plan
# ---------------------------
def get_strengths_and_missing(user_list, role_skills_list):
    strengths = []
    missing = []
    for rs in role_skills_list:
        matched = False
        for us in user_list:
            if us in rs or rs in us:
                matched = True
                break
        if matched:
            strengths.append(rs)
        else:
            missing.append(rs)
    # dedupe and keep order
    strengths = list(dict.fromkeys(strengths))
    missing = list(dict.fromkeys(missing))
    return strengths, missing

def get_resources_for_skills(skills_list, limit=4):
    recs = []
    for sk in skills_list:
        sk_key = sk.strip().lower()
        # try to find exact key or substring match
        if sk_key in RESOURCE_DB:
            recs.extend(RESOURCE_DB[sk_key][:limit])
        else:
            # try substring match
            for key in RESOURCE_DB:
                if key in sk_key or sk_key in key:
                    recs.extend(RESOURCE_DB[key][:limit])
                    break
            else:
                recs.append(f"Search a practical course for '{sk}' on Coursera/Udemy")
    # dedupe keep order
    final = []
    seen = set()
    for r in recs:
        if r not in seen:
            final.append(r)
            seen.add(r)
    return final[:6]

def generate_4_week_plan(missing_skills):
    # Simple heuristic-based plan
    weeks = []
    if not missing_skills:
        return [
            "Week 1: Build a small capstone project combining your strengths.",
            "Week 2: Polish GitHub repo and write README + demo video.",
            "Week 3: Apply to 10 roles and tailor your resume.",
            "Week 4: Prepare for interviews (DS/Algo/basic system design)."
        ]
    # prioritize platform vs fundamentals
    short = missing_skills[:6]
    # split into weeks
    for i in range(4):
        start = i * max(1, (len(short)//4)) 
        end = start + max(1, (len(short)//4))
        chunk = short[start:end]
        if not chunk:
            weeks.append(f"Week {i+1}: Reinforce earlier topics and build mini-projects.")
        else:
            weeks.append(f"Week {i+1}: Learn & practice — {' , '.join(chunk)} (2-4 small exercises + 1 mini-project task)")
    return weeks

# ---------------------------
# UI: Dark Mode Premium Styling (same)
# ---------------------------
st.set_page_config(page_title="AI Career Path Recommender — Dark", layout="wide", initial_sidebar_state="auto")

st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&display=swap');

    html, body, [class*="css"]  {
        font-family: 'Inter', sans-serif;
        background: #0b0f1a;
        color: #e6eef8;
    }
    .reportview-container .main .block-container{padding-top:1.5rem; padding-left:2rem; padding-right:2rem;}
    .header { display:flex; align-items:center; gap:16px; }
    .banner {
        background: linear-gradient(90deg, rgba(7,16,33,1) 0%, rgba(7,16,33,0.9) 50%, rgba(2,78,172,0.18) 100%);
        border-radius:12px; padding:22px; box-shadow:0 6px 30px rgba(2,78,172,0.12); border:1px solid rgba(255,255,255,0.03); margin-bottom:18px;
    }
    .app-title { font-size:28px; font-weight:700; color:#eaf3ff; margin:0; }
    .app-sub { color:#b9d6ff; margin:0; font-size:13px; }

    .card {
        background: linear-gradient(180deg, rgba(14,18,28,0.7), rgba(7,12,20,0.65));
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 14px;
        border: 1px solid rgba(255,255,255,0.03);
        box-shadow: 0 6px 24px rgba(2,78,172,0.06);
    }
    .role-title { font-size:18px; font-weight:700; color:#dff0ff; margin-bottom:6px; }
    .score-pill {
        display:inline-block;
        background: linear-gradient(90deg,#00e0ff,#0066ff);
        color:#001022; padding:6px 10px; border-radius:999px; font-weight:700; font-size:13px;
    }
    .pill-salary {
        display:inline-block;
        background: linear-gradient(90deg,#0bd97a,#047a52);
        color:#001022; padding:6px 10px; border-radius:999px; font-weight:700; font-size:13px; margin-left:8px;
    }
    .small { color:#9fb7d9; font-size:13px; }
    .muted { color:#87a6c9; font-size:13px; }

    .streamlit-expanderHeader { color:#dfefff !important; font-weight:700; }

    .plan-step { background: rgba(255,255,255,0.02); padding:8px; border-radius:8px; margin-bottom:6px; }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---- Top banner ----
st.markdown(
    f"""
    <div class="banner">
      <div class="header">
        <div style="display:flex;flex-direction:column;">
          <h1 class="app-title">🚀 AI Career Path Recommender</h1>
          <div class="app-sub">Dark mode • TF-IDF + Cosine Similarity • Motivational action plans</div>
        </div>
      </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# ---------------------------
# Main layout: two columns
# ---------------------------
df_roles, vectorizer, X = load_and_vectorize()

left, right = st.columns([2.4, 1])

with left:
    st.markdown("### 🔎 Tell me your skills")
    st.write("Type comma-separated skills (e.g. `python, sql, pandas`) or paste resume text below.")
    user_skills = st.text_area("Your skills (comma separated)", placeholder="python, sql, pandas, machine learning", height=140)
    resume_text = st.text_area("Paste resume / LinkedIn about section (optional)", placeholder="Paste resume or profile text", height=160)
    submitted = st.button("Find my best career matches ✅", key="find_matches", help="Click to compute best matches")
    st.markdown("---")
    with st.expander("Preview Job Roles Dataset (sample)", expanded=False):
        st.dataframe(df_roles[["role","skills","avg_salary"]].sample(8).reset_index(drop=True), use_container_width=True)

with right:
    st.markdown("### ⚙️ Controls")
    top_n = st.number_input("Number of matches to show", min_value=1, max_value=8, value=3)
    show_all_candidates = st.checkbox("Show top 20 candidates (dataset)", value=False)

# If user pasted resume but not skills, extract tokens
if resume_text and not user_skills.strip():
    tokens = [w for w in "".join(ch if ch.isalnum() else " " for ch in resume_text.lower()).split() if len(w)>2]
    freq = pd.Series(tokens).value_counts().head(20).index.tolist()
    user_skills = ", ".join(freq)

# ---------- Results ----------
if submitted:
    if not user_skills.strip():
        st.error("Please type at least one skill (or paste resume).")
    else:
        with st.spinner("Computing best matches..."):
            top_df, sims = recommend(user_skills, df_roles, vectorizer, X, top_n=top_n)
        st.success("Done — top matches below 🎯")
        # Results area (cards)
        user_list = [u.strip() for u in user_skills.lower().replace("/",",").replace(";",",").split(",") if u.strip()]

        for i, row in top_df.reset_index(drop=True).iterrows():
            role_id = f"role_{i}"
            score_pct = row["score"] * 100

            st.markdown(
                f"""
                <div class="card" id="{role_id}">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <div class="role-title">{i+1}. {row['role']}</div>
                      <div class="small">{row['skills']}</div>
                    </div>
                    <div style="text-align:right;">
                      <div class="score-pill">{score_pct:.1f}%</div>
                      <div class="pill-salary">₹{int(row['avg_salary']):,}/yr</div>
                    </div>
                  </div>
                """,
                unsafe_allow_html=True,
            )

            st.markdown("<div style='height:8px'></div>", unsafe_allow_html=True)

            # Prepare strengths & missing lists
            role_skills_list = [s.strip() for s in row["skills"].lower().split(",") if s.strip()]
            strengths, missing = get_strengths_and_missing(user_list, role_skills_list)

            # Generate curated resources and 4-week plan
            resources = get_resources_for_skills(missing)
            week_plan = generate_4_week_plan(missing)

            # Motivational headline (based on match)
            if score_pct >= 80:
                headline = "Excellent fit — polish & showcase!"
            elif score_pct >= 60:
                headline = "Solid fit — fill a few gaps to level up!"
            elif score_pct >= 40:
                headline = "Good start — focus on core platform skills!"
            else:
                headline = "Great beginner path — follow this 4-week plan!"

            # Expander with structured, motivational action plan
            with st.expander(f"Details — Why this role? • Click to expand", expanded=False):
                st.markdown(f"**{headline}**")
                st.markdown(f"**Match score:** {score_pct:.1f}% — _How close you are to this role_")
                st.markdown("")

                # Strengths
                if strengths:
                    st.markdown("**Strengths (what you already have):**")
                    for s in strengths:
                        st.markdown(f"- ✅ {s.title()}")
                else:
                    st.markdown("**Strengths:**\n- (No exact skill matches found — that's ok!)")

                st.markdown("")

                # Missing skills (clean, prioritized)
                if missing:
                    st.markdown("**Skill gaps — prioritized list (learn in this order):**")
                    # show up to 8 missing with priorities
                    for idx, m in enumerate(missing[:8], start=1):
                        st.markdown(f"- {idx}. **{m.title()}**")
                else:
                    st.markdown("**Skill gaps:** None — you already match the core skills for this role!")

                st.markdown("")

                # Curated resources
                if resources:
                    st.markdown("**Curated learning resources (start here):**")
                    for r in resources:
                        st.markdown(f"- 📚 {r}")
                else:
                    st.markdown("**Curated learning resources:**\n- 🔎 Search ‘practical course for [skill]’ on Coursera / Udemy")

                st.markdown("")

                # 4-week actionable plan
                st.markdown("**4-Week Action Plan — follow this to become interview-ready:**")
                for w in week_plan:
                    st.markdown(f"<div class='plan-step'>{w}</div>", unsafe_allow_html=True)

                st.markdown("")

                # Mini-project suggestion area
                st.markdown("**Mini-project ideas (do 1–2 projects in next 4 weeks):**")
                projects = MINI_PROJECTS.get(row["role"].split(" - ")[0], MINI_PROJECTS.get(row["role"].split(",")[0], MINI_PROJECTS.get("default")))
                # if role exact match key not present, try to map by keywords
                found_projects = projects
                if not found_projects:
                    found_projects = MINI_PROJECTS["default"]
                for p in found_projects:
                    st.markdown(f"- 🚀 {p}")

                st.markdown("")
                # Confidence badge & CTA
                if score_pct >= 60:
                    st.success("Confidence: You can land internships/roles quickly if you complete the action plan!")
                else:
                    st.info("Confidence: Follow the 4-week plan and mini-projects — you'll level up fast!")

            st.markdown("</div>", unsafe_allow_html=True)

        # optional: show top 20
        if show_all_candidates:
            st.markdown("---")
            st.write("Top 20 candidates from dataset:")
            st.dataframe(df_roles.head(20)[["role","skills","avg_salary"]].assign(score=0.0), use_container_width=True)

        # Export area (kept only copy summary button, NO JSON download)
        st.markdown("---")
        cols_e = st.columns([1,1,1])
        summary = f"Skills: {user_skills}\nTop matches:\n"
        for i,row in top_df.head(5).iterrows():
            summary += f"{i+1}. {row['role']} — {row['score']*100:.1f}% — Salary: ₹{int(row['avg_salary']):,}\n"

        with cols_e[0]:
            if st.button("Copy summary (show text)"):
                st.code(summary)
        with cols_e[1]:
            st.write("")  # spacer
        with cols_e[2]:
            st.write("")  # spacer

else:
    st.markdown(
        """
        <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div class="role-title">How it works</div>
                    <div class="small">Type your skills or paste a resume. The ML engine (TF-IDF + cosine similarity) finds the best career matches and shows missing skills & an actionable 4-week roadmap.</div>
                </div>
                <div style="text-align:right;">
                    <div class="muted">Pro tip: try `python, pandas, sql`</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

st.markdown("---")
