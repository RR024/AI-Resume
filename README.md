
# 💙 AI Career Path Recommender (ML + NLP + Streamlit)
### *Your personal AI-powered guide to choosing the right career with confidence*

<p align="center">
  <img src="https://img.shields.io/badge/Language-Python-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Track-Machine%20Learning-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Domain-AI%20%26%20NLP-purple?style=for-the-badge">
  <img src="https://img.shields.io/badge/UI-Streamlit-red?style=for-the-badge">
  <img src="https://img.shields.io/badge/Goal-Career%20Clarity-orange?style=for-the-badge">
</p>

---

## 🌐 Live Demo  
🔗 https://ai-career-path-recommender-o93nikvymedh6bfpmwewqz.streamlit.app/

---

# 📘 About This Project

Choosing a career can be confusing — especially for students who aren’t sure what skills they have or what they should learn next.

This project solves that problem using **Machine Learning + NLP** to provide instant clarity.

### The ML engine predicts:
- 🎯 Best-matching job roles  
- 📊 Match percentage  
- 🧠 Strengths & missing skills  
- 📚 Recommended courses  
- 🗓️ A personalized 4-week roadmap  
- 🚀 Real mini-project ideas  
- 💸 Salary expectations  

This tool acts as a **personal AI Career Coach**.

---

# ✨ Features

## 🔍 Smart Recommendation System
- Uses TF-IDF + Cosine Similarity  
- Matches users to 75+ job roles  
- Shows match score (%)  

## 💼 Career Insights
- Top recommended jobs  
- Salary range estimates  

## 🧠 Skill Analysis
- Extracts strengths  
- Identifies missing skills  
- Prioritizes the order to learn them  

## 📚 Personalized Learning Resources
- Curated Udemy / Coursera suggestions  
- Auto-generated based on missing skills  

## 🗓️ 4-Week Personalized Roadmap
- Week-by-week plan  
- Exercises  
- Mini-project  
- Interview preparation  

## 🚀 Mini Projects
- Role-specific real-world project ideas  

## 🎨 Premium Dark Mode UI
- Custom CSS  
- Modern cards, badges, and expanders  
- Dashboard-style layout  

## 📝 Resume Input Support
Users can either:
- Type skills manually  
- Paste résumé text  
The system extracts useful tokens automatically.

---

# 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Machine Learning | TF-IDF, Cosine Similarity |
| NLP | Text normalization, token extraction |
| Backend Logic | Python |
| Data Processing | pandas, numpy |
| Frontend | Streamlit + Custom CSS |
| Deployment | Streamlit Cloud |

---

# 🧩 System Architecture

User Input (skills or résumé text)
↓
Text Cleaning / Normalization
↓
TF-IDF Vectorizer (Feature Extraction)
↓
Cosine Similarity (Role Matching)
↓
Top-N Career Recommendations
↓
Strength & Gap Analysis
↓
Personalized Learning Plan
↓
Mini Project Suggestions
↓
Streamlit UI Rendering

yaml
Copy code

---

# 🔁 Workflow

🧑‍💻 Enter Skills / Resume
→ 🧼 Clean Text
→ 🧠 TF-IDF Vectorization
→ 📊 Compare Vectors
→ 🎯 Show Top Job Roles
→ 🧩 Extract Strengths & Gaps
→ 📚 Suggest Courses
→ 🗓️ Generate Roadmap
→ 🚀 Suggest Mini Projects
→ 🎨 Render UI

yaml
Copy code

---

# 🧪 Installation

```bash
git clone https://github.com/Lakshpri/AI-career-path-recommender.git
cd AI-career-path-recommender
pip install -r requirements.txt
streamlit run app.py
▶️ Usage
Run the Streamlit app

Enter your skills or paste résumé text

Click Find my best career matches

Explore:

Recommended careers

Skill gaps

Roadmap

Resources

Mini projects

📂 Folder Structure
cpp
Copy code
│── app.py
│── job_roles.csv
│── requirements.txt
│── README.md
│── assets/ (optional screenshots)
🌱 Future Enhancements
Resume PDF parser

Downloadable PDF career report

Embedding-based similarity (BERT/Sentence Transformers)

FastAPI backend for production

React/Next.js frontend

User login + progress tracking

AI chatbot career assistant
