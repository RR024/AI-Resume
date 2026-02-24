"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Database, Layers, Zap, Shield, Globe } from "lucide-react";
import Header from "@/components/Header";

const SAMPLE_ROLES = [
  { role: "Data Scientist",            salary: "₹12L",   skills: "Python, ML, Statistics, Pandas" },
  { role: "Machine Learning Engineer", salary: "₹14L",   skills: "Python, TensorFlow, MLOps, Docker" },
  { role: "Data Analyst",              salary: "₹7L",    skills: "SQL, Tableau, Excel, Power BI" },
  { role: "Backend Developer",         salary: "₹9L",    skills: "Java, Spring Boot, REST API, Docker" },
  { role: "DevOps Engineer",           salary: "₹13L",   skills: "Linux, Kubernetes, AWS, Terraform" },
  { role: "Full Stack Developer",      salary: "₹11L",   skills: "React, Node.js, MongoDB, REST API" },
  { role: "Cloud Architect",           salary: "₹20L",   skills: "AWS, Azure, GCP, Security" },
  { role: "AI Researcher",             salary: "₹16L",   skills: "Python, Deep Learning, PyTorch, Math" },
  { role: "NLP Engineer",              salary: "₹14L",   skills: "Python, Transformers, HuggingFace, NLP" },
  { role: "Cybersecurity Analyst",     salary: "₹13L",   skills: "Networking, Linux, Pen Testing" },
];

const TECH_STACK = [
  { icon: BrainCircuit, label: "FastAPI (Python)",     desc: "REST API backend",        color: "text-[#00e0ff]" },
  { icon: Layers,       label: "TF-IDF + Cosine Sim",  desc: "ML recommendation engine", color: "text-[#a855f7]" },
  { icon: Database,     label: "Pandas + scikit-learn", desc: "Data processing",          color: "text-[#0bd97a]" },
  { icon: Globe,        label: "Next.js 14",            desc: "React frontend",            color: "text-[#0066ff]" },
  { icon: Zap,          label: "Tailwind CSS",          desc: "Utility-first styling",     color: "text-[#f59e0b]" },
  { icon: Shield,       label: "Pydantic v2",           desc: "Input validation",          color: "text-[#ef4444]" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 space-y-12">

        {/* ── Hero ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-extrabold text-txt-primary mb-3">
            About the Project
          </h1>
          <p className="text-txt-muted max-w-2xl mx-auto leading-relaxed">
            An AI-powered career recommender that analyses your skills using machine learning
            and returns personalised job-role matches, skill-gap analysis, curated learning
            resources, and a 4-week action plan — all in under a second.
          </p>
          <Link href="/" className="btn-primary inline-flex mt-6">
            Try it now
            <ArrowRight size={15} />
          </Link>
        </motion.section>

        {/* ── How it works ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className="text-xl font-bold text-txt-primary mb-5">How it works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { step: "1", title: "Enter skills",   desc: "Type comma-separated skills or paste your resume text." },
              { step: "2", title: "ML matching",    desc: "TF-IDF vectorises your skills then cosine similarity scores every role in the dataset." },
              { step: "3", title: "Get your plan",  desc: "Top matching roles appear with strengths, gaps, resources, and a 4-week roadmap." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="card p-5">
                <div className="h-9 w-9 rounded-lg bg-gradient-score
                                flex items-center justify-center font-extrabold
                                text-[#001022] text-sm mb-3">
                  {step}
                </div>
                <h3 className="font-semibold text-txt-primary mb-1">{title}</h3>
                <p className="text-txt-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Tech stack ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <h2 className="text-xl font-bold text-txt-primary mb-5">Tech stack</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TECH_STACK.map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="card p-4 flex items-center gap-3">
                <Icon size={20} className={`${color} flex-shrink-0`} />
                <div>
                  <p className="text-sm font-semibold text-txt-primary">{label}</p>
                  <p className="text-xs text-txt-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── API reference ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-txt-primary mb-5">API</h2>
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#0066ff] px-2 py-0.5 text-xs font-bold text-white">POST</span>
              <code className="text-[#00e0ff] text-sm">/recommend</code>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="section-title">Request</p>
                <pre className="rounded-lg bg-bg-base p-3 text-xs text-txt-soft
                                overflow-x-auto border border-white/5">{`{
  "skills": "python, sql, pandas",
  "top_n": 3
}`}</pre>
              </div>
              <div>
                <p className="section-title">Response (truncated)</p>
                <pre className="rounded-lg bg-bg-base p-3 text-xs text-txt-soft
                                overflow-x-auto border border-white/5">{`{
  "recommendations": [{
    "role": "Data Scientist",
    "match_score": 82.4,
    "avg_salary": 1200000,
    "strengths": [...],
    "missing_skills": [...],
    "resources": [...],
    "action_plan": [...]
  }],
  "total_results": 3
}`}</pre>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Dataset preview ── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          <h2 className="text-xl font-bold text-txt-primary mb-5">
            Sample Job Roles Dataset
            <span className="ml-2 text-sm font-normal text-txt-muted">(75 roles total including Junior/Senior variants)</span>
          </h2>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-txt-muted uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-txt-muted uppercase tracking-wide">Avg Salary</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-txt-muted uppercase tracking-wide hidden sm:table-cell">Key Skills</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ROLES.map((row, i) => (
                    <tr
                      key={row.role}
                      className={`border-b border-white/5 hover:bg-white/2 transition-colors
                                  ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium text-txt-primary">{row.role}</td>
                      <td className="px-4 py-3">
                        <span className="pill-salary text-xs">{row.salary}/yr</span>
                      </td>
                      <td className="px-4 py-3 text-txt-muted hidden sm:table-cell text-xs">
                        {row.skills}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-white/5 text-xs text-txt-muted">
              Showing 10 of 75 roles. Each base role has a Junior (55% salary) and Senior (160% salary) variant.
            </div>
          </div>
        </motion.section>

      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-txt-muted">
        AI Career Path Recommender — Built with FastAPI + Next.js
      </footer>
    </div>
  );
}
