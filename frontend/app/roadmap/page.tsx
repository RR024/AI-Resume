"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  BookOpen,
  Target,
  Code2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  DollarSign,
  Zap,
  AlertCircle,
  Rocket,
  Trophy,
  Calendar,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/Header";
import ScoreRing from "@/components/ScoreRing";
import LoadingSpinner from "@/components/LoadingSpinner";
import { fetchRecommendations, getErrorMessage } from "@/lib/api";
import type { RoleRecommendation } from "@/lib/types";

/* ─────────────────────────────────────────────────────────────
   Suspense shell
───────────────────────────────────────────────────────────── */
export default function RoadmapPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner label="Loading roadmap…" />
          </div>
        </div>
      }
    >
      <RoadmapContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────────────────────────
   Week card – expandable action plan step
───────────────────────────────────────────────────────────── */
function WeekCard({ week, step, index }: { week: number; step: string; index: number }) {
  const [open, setOpen] = useState(index === 0);

  const weekColors = [
    { accent: "#a78bfa", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.20)", dot: "rgba(124,58,237,0.30)" },
    { accent: "#67e8f9", bg: "rgba(6,182,212,0.08)",  border: "rgba(6,182,212,0.20)",  dot: "rgba(6,182,212,0.30)"  },
    { accent: "#6ee7b7", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.20)", dot: "rgba(16,185,129,0.30)" },
    { accent: "#fcd34d", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.20)", dot: "rgba(245,158,11,0.30)" },
  ];
  const c = weekColors[index % 4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${c.border}`, background: c.bg }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span
            className="w-8 h-8 rounded-full text-xs font-black flex items-center justify-center flex-shrink-0"
            style={{ background: c.dot, color: c.accent }}
          >
            W{week}
          </span>
          <span className="text-sm font-bold" style={{ color: c.accent }}>
            Week {week}
          </span>
        </div>
        <span style={{ color: c.accent }}>
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key={`week-${week}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="px-5 pb-5 text-sm leading-relaxed"
              style={{ color: "#94a3b8", borderTop: `1px solid ${c.border}`, paddingTop: 14 }}
            >
              {step}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Mini project card
───────────────────────────────────────────────────────────── */
function ProjectCard({ project, index }: { project: string; index: number }) {
  const icons = ["🚀", "🛠️", "🎯", "⚡", "🔬", "🌐"];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="rounded-2xl p-4"
      style={{
        background: "rgba(236,72,153,0.05)",
        border: "1px solid rgba(236,72,153,0.14)",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{icons[index % icons.length]}</span>
        <div>
          <p className="text-[10px] font-bold text-[#f9a8d4] uppercase tracking-widest mb-1">
            Project {index + 1}
          </p>
          <p className="text-[#94a3b8] text-sm leading-relaxed">{project}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main content
───────────────────────────────────────────────────────────── */
function RoadmapContent() {
  const router = useRouter();
  const params = useSearchParams();
  const roleName = params.get("role") ?? "";
  const skillsQuery = params.get("skills") ?? "";

  const [rec, setRec] = useState<RoleRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Skill-gap tracker state ──────────────────────────────── */
  const [checkedSkills, setCheckedSkills] = useState<Set<string>>(new Set());

  /* ── Load recommendation data ─────────────────────────────── */
  useEffect(() => {
    async function load() {
      // 1. Try sessionStorage first (fast, no network)
      try {
        const cached = sessionStorage.getItem("roadmap_rec");
        if (cached) {
          const parsed: RoleRecommendation = JSON.parse(cached);
          if (parsed.role === roleName || !roleName) {
            setRec(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {}

      // 2. Fall back to API
      if (!skillsQuery) {
        setError("No skill data found. Please go back and run a career match first.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetchRecommendations({ skills: skillsQuery, top_n: 5 });
        const match =
          res.recommendations.find(
            (r) => r.role.toLowerCase() === roleName.toLowerCase()
          ) ?? res.recommendations[0];
        if (!match) throw new Error("Role not found in recommendations.");
        setRec(match);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [roleName, skillsQuery]);

  /* ── Load localStorage progress ──────────────────────────── */
  useEffect(() => {
    if (!rec) return;
    try {
      const stored = localStorage.getItem(`roadmap_progress_${rec.role}`);
      if (stored) {
        setCheckedSkills(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, [rec]);

  /* ── Toggle a skill's checked state ──────────────────────── */
  function toggleSkill(skill: string) {
    setCheckedSkills((prev) => {
      const next = new Set(prev);
      next.has(skill) ? next.delete(skill) : next.add(skill);
      try {
        localStorage.setItem(
          `roadmap_progress_${rec!.role}`,
          JSON.stringify(Array.from(next))
        );
      } catch {}
      return next;
    });
  }

  /* ── Derived ── */
  const gapProgress =
    rec && rec.missing_skills.length > 0
      ? Math.round((checkedSkills.size / rec.missing_skills.length) * 100)
      : 100;

  const readiness =
    rec
      ? Math.min(
          100,
          Math.round(
            rec.match_score * 0.6 +
              gapProgress * 0.4
          )
        )
      : 0;

  function readinessColor(pct: number) {
    if (pct >= 75) return { text: "#6ee7b7", bar: "#10b981" };
    if (pct >= 50) return { text: "#67e8f9", bar: "#06b6d4" };
    if (pct >= 30) return { text: "#fcd34d", bar: "#f59e0b" };
    return { text: "#a78bfa", bar: "#7c3aed" };
  }
  const rc = readinessColor(readiness);

  /* ─────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner label="Loading your career roadmap…" />
        </div>
      </div>
    );
  }

  if (error || !rec) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "rgba(245,158,11,0.10)",
              border: "1px solid rgba(245,158,11,0.20)",
            }}
          >
            <AlertCircle size={24} className="text-amber-400" />
          </div>
          <p className="text-[#94a3b8] max-w-sm">
            {error ?? "Roadmap data not found. Please go back and select a role."}
          </p>
          <button
            onClick={() => router.back()}
            className="btn-ghost-v2"
          >
            <ArrowLeft size={13} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ── Salary formatting ──────────────────────────────────── */
  const salaryFormatted =
    rec.avg_salary >= 100_000
      ? `₹${(rec.avg_salary / 100_000).toFixed(1)}L/yr`
      : `₹${rec.avg_salary.toLocaleString()}/yr`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">

        {/* ── Back navigation ────────────────────────────────── */}
        <button
          onClick={() => router.back()}
          className="btn-ghost-v2 mb-6 text-xs"
        >
          <ArrowLeft size={13} /> Back to Results
        </button>

        {/* ══════════════════════════════════════════════════════
            SECTION 1 — Role Overview
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-6 sm:p-8 mb-6"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(6,182,212,0.06) 100%)",
            border: "1px solid rgba(124,58,237,0.22)",
          }}
        >
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Score ring */}
            <div className="flex-shrink-0">
              <ScoreRing score={rec.match_score} size={100} strokeWidth={7} />
            </div>

            {/* Role info */}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Briefcase size={10} />
                Career Roadmap
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
                {rec.role}
              </h1>
              <p className="text-[#64748b] text-sm italic mb-4">{rec.headline}</p>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-2">
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: "rgba(16,185,129,0.10)",
                    border: "1px solid rgba(16,185,129,0.22)",
                    color: "#6ee7b7",
                  }}
                >
                  <DollarSign size={11} />
                  {salaryFormatted}
                </span>
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: "rgba(6,182,212,0.10)",
                    border: "1px solid rgba(6,182,212,0.22)",
                    color: "#67e8f9",
                  }}
                >
                  <TrendingUp size={11} />
                  {rec.match_score}% match
                </span>
                <span
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: "rgba(124,58,237,0.10)",
                    border: "1px solid rgba(124,58,237,0.22)",
                    color: "#a78bfa",
                  }}
                >
                  <Zap size={11} />
                  {rec.missing_skills.length} gaps to close
                </span>
              </div>
            </div>
          </div>

          {/* Readiness Progress */}
          <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                <Trophy size={11} />
                Overall Readiness
              </span>
              <span className="text-sm font-extrabold" style={{ color: rc.text }}>
                {readiness}%
              </span>
            </div>
            <div
              className="h-2.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${rc.bar}, ${rc.text})` }}
                initial={{ width: 0 }}
                animate={{ width: `${readiness}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="text-[10px] text-[#334155] mt-1.5">
              Based on match score + skills you&apos;ve checked off
            </p>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — Strengths
        ══════════════════════════════════════════════════════ */}
        {rec.strengths.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="rounded-2xl p-5 sm:p-6 mb-5"
            style={{
              background: "rgba(16,185,129,0.05)",
              border: "1px solid rgba(16,185,129,0.15)",
            }}
          >
            <p className="flex items-center gap-2 text-xs font-bold text-[#6ee7b7] uppercase tracking-widest mb-4">
              <CheckCircle2 size={13} />
              Your Strengths — Skills You Already Have
            </p>
            <div className="flex flex-wrap gap-2">
              {rec.strengths.map((skill, i) => (
                <motion.span
                  key={skill}
                  initial={{ opacity: 0, scale: 0.90 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
                  style={{
                    background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    color: "#6ee7b7",
                  }}
                >
                  <CheckCircle2 size={11} />
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — Skill Gap Tracker
        ══════════════════════════════════════════════════════ */}
        {rec.missing_skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="rounded-2xl p-5 sm:p-6 mb-5"
            style={{
              background: "rgba(245,158,11,0.04)",
              border: "1px solid rgba(245,158,11,0.16)",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <p className="flex items-center gap-2 text-xs font-bold text-[#fcd34d] uppercase tracking-widest">
                <AlertCircle size={13} />
                Skill Gap Tracker
              </p>
              <span className="text-xs font-bold" style={{ color: gapProgress === 100 ? "#6ee7b7" : "#fcd34d" }}>
                {checkedSkills.size}/{rec.missing_skills.length} done
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="h-2 rounded-full overflow-hidden mb-4"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <motion.div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${gapProgress}%`,
                  background:
                    gapProgress === 100
                      ? "linear-gradient(90deg, #10b981, #6ee7b7)"
                      : "linear-gradient(90deg, #f59e0b, #fcd34d)",
                }}
              />
            </div>

            {/* Completion message */}
            <AnimatePresence>
              {gapProgress === 100 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 mb-4 text-sm font-semibold text-[#6ee7b7]"
                  style={{
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.20)",
                  }}
                >
                  <Trophy size={14} />
                  All gaps closed! You&apos;re ready to apply. 🎉
                </motion.div>
              )}
            </AnimatePresence>

            {/* Skill checkboxes */}
            <div className="space-y-2">
              {rec.missing_skills.map((skill, i) => {
                const checked = checkedSkills.has(skill);
                return (
                  <motion.button
                    key={skill}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => toggleSkill(skill)}
                    className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200"
                    style={{
                      background: checked
                        ? "rgba(16,185,129,0.08)"
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${checked ? "rgba(16,185,129,0.22)" : "rgba(255,255,255,0.07)"}`,
                    }}
                  >
                    {checked ? (
                      <CheckCircle2 size={16} className="text-[#6ee7b7] flex-shrink-0" />
                    ) : (
                      <Circle size={16} className="text-[#475569] flex-shrink-0" />
                    )}
                    <span
                      className="text-sm capitalize flex-1 leading-snug"
                      style={{
                        color: checked ? "#6ee7b7" : "#94a3b8",
                        textDecoration: checked ? "line-through" : "none",
                        opacity: checked ? 0.75 : 1,
                      }}
                    >
                      {skill}
                    </span>
                    <span
                      className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: checked
                          ? "rgba(16,185,129,0.15)"
                          : "rgba(255,255,255,0.05)",
                        color: checked ? "#6ee7b7" : "#334155",
                      }}
                    >
                      {checked ? "Done" : "To learn"}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <p className="text-[10px] text-[#334155] mt-3">
              ✓ Progress saved automatically in your browser
            </p>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 4 — Learning Resources
        ══════════════════════════════════════════════════════ */}
        {rec.resources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="rounded-2xl p-5 sm:p-6 mb-5"
            style={{
              background: "rgba(6,182,212,0.04)",
              border: "1px solid rgba(6,182,212,0.15)",
            }}
          >
            <p className="flex items-center gap-2 text-xs font-bold text-[#67e8f9] uppercase tracking-widest mb-4">
              <BookOpen size={13} />
              Curated Learning Resources
            </p>

            <div className="space-y-2.5">
              {rec.resources.map((resource, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3 rounded-xl px-4 py-3.5"
                  style={{
                    background: "rgba(6,182,212,0.05)",
                    border: "1px solid rgba(6,182,212,0.10)",
                  }}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">
                    {["📘", "🎥", "📝", "🌐", "🎓", "🔗"][i % 6]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#0e7490] uppercase tracking-widest mb-0.5">
                      Resource {i + 1}
                    </p>
                    <p className="text-[#94a3b8] text-sm leading-relaxed">{resource}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 5 — 4-Week Action Plan
        ══════════════════════════════════════════════════════ */}
        {rec.action_plan.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="rounded-2xl p-5 sm:p-6 mb-5"
            style={{
              background: "rgba(124,58,237,0.04)",
              border: "1px solid rgba(124,58,237,0.15)",
            }}
          >
            <p className="flex items-center gap-2 text-xs font-bold text-[#c4b5fd] uppercase tracking-widest mb-4">
              <Calendar size={13} />
              4-Week Action Plan
            </p>

            <div className="space-y-3">
              {rec.action_plan.map((step, i) => (
                <WeekCard key={i} week={i + 1} step={step} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — Mini Projects
        ══════════════════════════════════════════════════════ */}
        {rec.mini_projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.30 }}
            className="rounded-2xl p-5 sm:p-6 mb-5"
            style={{
              background: "rgba(236,72,153,0.04)",
              border: "1px solid rgba(236,72,153,0.15)",
            }}
          >
            <p className="flex items-center gap-2 text-xs font-bold text-[#f9a8d4] uppercase tracking-widest mb-4">
              <Code2 size={13} />
              Mini Project Suggestions
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rec.mini_projects.map((project, i) => (
                <ProjectCard key={i} project={project} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Final CTA ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6"
          style={{
            background: "rgba(16,185,129,0.07)",
            border: "1px solid rgba(16,185,129,0.18)",
          }}
        >
          <Rocket size={22} className="text-[#6ee7b7] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#6ee7b7] mb-0.5">
              You&apos;re building your career momentum!
            </p>
            <p className="text-xs text-[#475569]">
              Complete the skill gaps, finish the projects, and follow the 4-week plan — you&apos;ll be application-ready.
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="btn-ghost-v2 flex-shrink-0 text-xs"
          >
            <ArrowLeft size={13} />
            All Matches
          </button>
        </motion.div>

      </main>

      <footer className="border-t border-white/5 py-5 text-center text-[11px] text-[#334155]">
        AI Career Path — FastAPI · scikit-learn · Next.js 14
      </footer>
    </div>
  );
}
