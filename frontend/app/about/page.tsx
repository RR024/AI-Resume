"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Database, Layers, Zap, Shield, Globe, Code2 } from "lucide-react";
import Header from "@/components/Header";

const SAMPLE_ROLES = [
  { role: "Data Scientist",           salary: "₹12L",  skills: "Python, ML, Statistics, Pandas" },
  { role: "ML Engineer",              salary: "₹14L",  skills: "Python, TensorFlow, MLOps, Docker" },
  { role: "Data Analyst",             salary: "₹7L",   skills: "SQL, Tableau, Excel, Power BI" },
  { role: "Backend Developer",        salary: "₹9L",   skills: "Java, Spring Boot, REST API, Docker" },
  { role: "DevOps Engineer",          salary: "₹13L",  skills: "Linux, Kubernetes, AWS, Terraform" },
  { role: "Full Stack Developer",     salary: "₹11L",  skills: "React, Node.js, MongoDB, REST API" },
  { role: "Cloud Architect",          salary: "₹20L",  skills: "AWS, Azure, GCP, Security" },
  { role: "AI Researcher",            salary: "₹16L",  skills: "Python, Deep Learning, PyTorch" },
  { role: "Game Developer",           salary: "₹11L",  skills: "Unity, Unreal, C#, C++" },
  { role: "Blockchain Developer",     salary: "₹16L",  skills: "Solidity, Ethereum, Web3" },
];

const STACK = [
  { icon: BrainCircuit, label: "FastAPI", desc: "Python REST backend", color: "text-[#67e8f9]", bg: "rgba(6,182,212,0.08)"   },
  { icon: Layers,       label: "TF-IDF + Cosine", desc: "ML engine", color: "text-[#c4b5fd]", bg: "rgba(124,58,237,0.08)"  },
  { icon: Database,     label: "scikit-learn", desc: "Data processing", color: "text-[#6ee7b7]", bg: "rgba(16,185,129,0.08)"  },
  { icon: Globe,        label: "Next.js 14", desc: "React frontend", color: "text-[#67e8f9]", bg: "rgba(6,182,212,0.08)"   },
  { icon: Zap,          label: "Tailwind CSS", desc: "Styling", color: "text-[#fcd34d]", bg: "rgba(245,158,11,0.08)"  },
  { icon: Shield,       label: "Pydantic v2", desc: "Input validation", color: "text-[#f9a8d4]", bg: "rgba(236,72,153,0.08)"  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Enter your skills", desc: "Type your current skills separated by commas, or paste your resume text.", color: "#a78bfa" },
  { step: "02", title: "ML scores all roles", desc: "TF-IDF vectorises your skills and cosine-similarity scores every role in the dataset.", color: "#67e8f9" },
  { step: "03", title: "Top matches returned", desc: "The highest-scoring roles are returned with match %, salary, and gap analysis.", color: "#6ee7b7" },
  { step: "04", title: "Action plan generated", desc: "A personalised 4-week plan, curated resources, and mini-projects are generated per role.", color: "#fcd34d" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 space-y-16">

        {/* ── Hero ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 text-xs font-semibold"
               style={{ background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.22)", color: "#a78bfa" }}>
            <Code2 size={11} /> Open Source Project
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-4">
            About the{" "}
            <span className="grad-text-purple-cyan">Project</span>
          </h1>
          <p className="text-[#64748b] text-base max-w-2xl mx-auto leading-relaxed mb-8">
            An ML-powered career intelligence tool that analyses your skills and returns
            deeply personalised role matches, skill-gap breakdowns, curated learning
            resources, and a 4-week action plan — all under 200ms.
          </p>
          <Link href="/" className="btn-holographic inline-flex">
            Try it now <ArrowRight size={14} />
          </Link>
        </motion.section>

        <div className="divider-glow" />

        {/* ── How it works ── */}
        <section>
          <motion.h2
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-extrabold text-white mb-8"
          >
            How it works
          </motion.h2>
          <motion.div
            variants={container} initial="hidden" whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {HOW_IT_WORKS.map(({ step, title, desc, color }) => (
              <motion.div
                key={step} variants={item}
                className="glass-card p-6 relative overflow-hidden"
              >
                {/* Large step number watermark */}
                <span className="absolute top-3 right-4 text-6xl font-black opacity-5 text-white select-none">
                  {step}
                </span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 text-sm font-extrabold"
                     style={{ background: `${color}18`, border: `1px solid ${color}30`, color }}>
                  {step}
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{title}</h3>
                <p className="text-[#64748b] text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Tech Stack ── */}
        <section>
          <motion.h2
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-extrabold text-white mb-8"
          >
            Tech stack
          </motion.h2>
          <motion.div
            variants={container} initial="hidden" whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {STACK.map(({ icon: Icon, label, desc, color, bg }) => (
              <motion.div
                key={label} variants={item}
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: bg, border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: "rgba(255,255,255,0.04)" }}>
                  <Icon size={17} className={color} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{label}</p>
                  <p className="text-[10px] text-[#475569]">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Dataset sample ── */}
        <section>
          <motion.h2
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-extrabold text-white mb-2"
          >
            Sample Roles in Dataset
          </motion.h2>
          <p className="text-[#475569] text-sm mb-6">
            108 total roles (36 base × 3 seniority variants). Sampling below:
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card-nohover overflow-hidden"
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Role</th>
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest hidden sm:table-cell">Key Skills</th>
                  <th className="text-right px-5 py-3 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Avg Salary</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_ROLES.map(({ role, salary, skills }, i) => (
                  <motion.tr
                    key={role}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 text-white text-xs font-semibold">{role}</td>
                    <td className="px-5 py-3 text-[#64748b] text-xs hidden sm:table-cell">{skills}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="skill-tag-v2 skill-tag-green text-[10px]">{salary}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </section>

        {/* ── API Reference ── */}
        <section>
          <motion.h2
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-extrabold text-white mb-6"
          >
            API Reference
          </motion.h2>
          <div className="space-y-3">
            {[
              { method: "POST", path: "/recommend", desc: "Get ranked career recommendations for given skills" },
              { method: "GET",  path: "/health",    desc: "Check API health and model status" },
            ].map(({ method, path, desc }) => (
              <motion.div
                key={path}
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="glass-card p-4 flex items-center gap-4 flex-wrap"
              >
                <span className="rounded-lg px-2.5 py-1 text-[10px] font-extrabold tracking-widest"
                      style={{
                        background: method === "POST" ? "rgba(124,58,237,0.15)" : "rgba(16,185,129,0.12)",
                        color: method === "POST" ? "#c4b5fd" : "#6ee7b7",
                        border: `1px solid ${method === "POST" ? "rgba(124,58,237,0.25)" : "rgba(16,185,129,0.2)"}`,
                      }}>
                  {method}
                </span>
                <code className="text-[#67e8f9] text-xs font-mono">{path}</code>
                <span className="text-[#475569] text-xs">{desc}</span>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      <footer className="border-t border-white/5 py-5 text-center text-[11px] text-[#334155]">
        AI Career Path — FastAPI · scikit-learn · Next.js 14
      </footer>
    </div>
  );
}
