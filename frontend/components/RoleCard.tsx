"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
  BookOpen, Target, Code2, Lightbulb, AlertTriangle, Flame, Map
} from "lucide-react";
import type { RoleRecommendation } from "@/lib/types";
import ScoreRing from "./ScoreRing";
import clsx from "clsx";

interface Props { rec: RoleRecommendation; rank: number; inputSkills?: string; }

function rankStyle(rank: number) {
  if (rank === 1) return "rank-1 text-white";
  if (rank === 2) return "rank-2 text-[#02020a]";
  if (rank === 3) return "rank-3 text-white";
  return "rank-other text-[#94a3b8]";
}

function cardAccent(score: number) {
  if (score >= 80) return { border: "rgba(16,185,129,0.22)",  glow: "rgba(16,185,129,0.06)",  ring: "#6ee7b7" };
  if (score >= 60) return { border: "rgba(6,182,212,0.22)",   glow: "rgba(6,182,212,0.06)",   ring: "#67e8f9" };
  if (score >= 40) return { border: "rgba(245,158,11,0.22)",  glow: "rgba(245,158,11,0.05)",  ring: "#fcd34d" };
  return                  { border: "rgba(124,58,237,0.22)",  glow: "rgba(124,58,237,0.05)",  ring: "#a78bfa" };
}

export default function RoleCard({ rec, rank, inputSkills = "" }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const accent = cardAccent(rec.match_score);

  function handleViewRoadmap() {
    try {
      sessionStorage.setItem("roadmap_rec", JSON.stringify(rec));
      sessionStorage.setItem("roadmap_skills", inputSkills);
    } catch {}
    router.push(`/roadmap?role=${encodeURIComponent(rec.role)}&skills=${encodeURIComponent(inputSkills)}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: rank * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.025) 0%, ${accent.glow} 100%)`,
        border: `1px solid ${accent.border}`,
        borderRadius: 20,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        overflow: "hidden",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
      }}
      whileHover={{ scale: 1.005 }}
    >
      {/* ── Low-confidence ribbon ───────────────────────────────── */}
      {rec.low_confidence && (
        <div className="flex items-center gap-2 px-5 py-2 text-xs font-semibold"
             style={{ background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.15)" }}>
          <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-400/80">
            Weak match — this was the closest result, your skills don&apos;t strongly align.
          </span>
        </div>
      )}

      {/* ── Main header ────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-5">

          {/* Score ring */}
          <ScoreRing score={rec.match_score} size={84} strokeWidth={6} />

          {/* Role info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Rank badge */}
                <span className={clsx("flex-shrink-0 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center", rankStyle(rank))}>
                  {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : rank}
                </span>
                <h3 className="text-lg font-extrabold text-white truncate leading-tight">
                  {rec.role}
                </h3>
              </div>

              {/* Salary */}
              <div className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1
                              text-xs font-bold"
                   style={{ background: "rgba(16,185,129,0.10)", border: "1px solid rgba(16,185,129,0.22)", color: "#6ee7b7" }}>
                ₹{(rec.avg_salary / 100_000).toFixed(1)}L/yr
              </div>
            </div>

            <p className="text-[#64748b] text-xs mb-3 italic">{rec.headline}</p>

            {/* Skill chip preview */}
            <div className="flex flex-wrap gap-1.5">
              {rec.strengths.slice(0, 4).map(s => (
                <span key={s} className="skill-tag-v2 skill-tag-green">✓ {s}</span>
              ))}
              {rec.missing_skills.slice(0, 3).map(s => (
                <span key={s} className="skill-tag-v2 skill-tag-amber">{s}</span>
              ))}
              {(rec.strengths.length + rec.missing_skills.length) > 7 && (
                <span className="skill-tag-v2 skill-tag-muted">
                  +{rec.strengths.length + rec.missing_skills.length - 7} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expand toggle + Roadmap CTA */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setOpen(v => !v)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                       text-xs font-semibold transition-all duration-200"
            style={{
              background: open ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${open ? "rgba(124,58,237,0.30)" : "rgba(255,255,255,0.08)"}`,
              color: open ? "#a78bfa" : "#64748b",
            }}
          >
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {open ? "Collapse details" : "View strengths, gaps & plan"}
          </button>

          <button
            onClick={handleViewRoadmap}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                       text-xs font-semibold transition-all duration-200 whitespace-nowrap"
            style={{
              background: "rgba(16,185,129,0.10)",
              border: "1px solid rgba(16,185,129,0.28)",
              color: "#6ee7b7",
            }}
          >
            <Map size={13} />
            View Full Roadmap
          </button>
        </div>
      </div>

      {/* ── Expanded Section ────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                 className="px-5 sm:px-6 pb-6 pt-5 space-y-6">

              {/* ── Two-column: Strengths + Gaps ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Strengths */}
                {rec.strengths.length > 0 && (
                  <div className="rounded-2xl p-4"
                       style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.12)" }}>
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#6ee7b7] mb-3 uppercase tracking-wider">
                      <CheckCircle2 size={11} />
                      You already have
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.strengths.map(s => (
                        <span key={s} className="skill-tag-v2 skill-tag-green">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing skills */}
                {rec.missing_skills.length > 0 && (
                  <div className="rounded-2xl p-4"
                       style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.12)" }}>
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#fcd34d] mb-3 uppercase tracking-wider">
                      <AlertCircle size={11} />
                      Skill gaps to close
                    </p>
                    <div className="space-y-1.5">
                      {rec.missing_skills.map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(245,158,11,0.2)", color: "#fcd34d" }}>
                            {i + 1}
                          </span>
                          <span className="text-[#d4a843] text-xs capitalize">{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Learning Resources ── */}
              {rec.resources.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#67e8f9] mb-3 uppercase tracking-wider">
                    <BookOpen size={11} />
                    Curated Resources
                  </p>
                  <div className="space-y-2">
                    {rec.resources.map((r, i) => (
                      <motion.div
                        key={r}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 rounded-xl px-4 py-3"
                        style={{ background: "rgba(6,182,212,0.04)", border: "1px solid rgba(6,182,212,0.10)" }}
                      >
                        <span className="text-[#06b6d4] text-sm flex-shrink-0 mt-0.5">📚</span>
                        <span className="text-[#94a3b8] text-xs leading-relaxed">{r}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 4-Week Action Plan (Timeline) ── */}
              {rec.action_plan.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#c4b5fd] mb-4 uppercase tracking-wider">
                    <Target size={11} />
                    4-Week Action Plan
                  </p>
                  <div className="space-y-3">
                    {rec.action_plan.map((step, i) => (
                      <motion.div
                        key={i}
                        className="timeline-item"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <div className="timeline-dot">{i + 1}</div>
                        <div className="rounded-xl px-4 py-3 mb-2"
                             style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}>
                          <span className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest block mb-1">
                            Week {i + 1}
                          </span>
                          <p className="text-[#94a3b8] text-xs leading-relaxed">{step}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Mini Projects ── */}
              {rec.mini_projects.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#fb7185] mb-3 uppercase tracking-wider">
                    <Code2 size={11} />
                    Mini Project Ideas
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rec.mini_projects.map((p, i) => (
                      <motion.div
                        key={p}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2.5 rounded-xl px-4 py-3"
                        style={{ background: "rgba(236,72,153,0.04)", border: "1px solid rgba(236,72,153,0.10)" }}
                      >
                        <span className="text-sm flex-shrink-0">🚀</span>
                        <span className="text-[#94a3b8] text-xs leading-relaxed">{p}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Motivational CTA ── */}
              <div className="rounded-2xl px-5 py-4 flex items-center gap-3"
                   style={{
                     background: rec.match_score >= 60
                       ? "rgba(16,185,129,0.07)"
                       : "rgba(124,58,237,0.08)",
                     border: `1px solid ${rec.match_score >= 60 ? "rgba(16,185,129,0.18)" : "rgba(124,58,237,0.20)"}`,
                   }}>
                <Flame size={16} className={rec.match_score >= 60 ? "text-green-400" : "text-purple-400"} />
                <p className={clsx("text-xs font-semibold", rec.match_score >= 60 ? "text-[#6ee7b7]" : "text-[#a78bfa]")}>
                  {rec.match_score >= 60
                    ? "You're well-positioned for this role! Complete the plan and you're ready to apply."
                    : "Follow the 4-week plan and build 2 mini-projects — you'll be job-ready fast."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
