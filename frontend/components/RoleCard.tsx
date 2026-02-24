"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, BookOpen, Target,
  Zap, CheckCircle2, AlertCircle, Lightbulb, Code2, AlertTriangle
} from "lucide-react";
import type { RoleRecommendation } from "@/lib/types";

interface Props {
  rec: RoleRecommendation;
  rank: number;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "from-[#0bd97a] to-[#047a52] text-[#001022]" :
    score >= 60 ? "from-[#00e0ff] to-[#0066ff] text-[#001022]" :
    score >= 40 ? "from-[#f59e0b] to-[#d97706] text-[#001022]" :
                  "from-[#94a3b8] to-[#64748b] text-white";
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-gradient-to-r ${color}`}>
      {score.toFixed(1)}% match
    </span>
  );
}

export default function RoleCard({ rec, rank }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: rank * 0.08 }}
      className="card overflow-hidden"
    >
      {/* ── Card header (always visible) ───────────────────────────────── */}
      <div className="p-5">

        {/* Low-confidence warning banner */}
        {rec.low_confidence && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/8 border
                          border-amber-500/20 px-3 py-2 mb-4 text-xs text-amber-400">
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
            <span>
              <strong>Weak match</strong> — this role was the closest in our dataset
              but your skills don&apos;t strongly align. Results may not be accurate.
            </span>
          </div>
        )}
        <div className="flex items-start justify-between gap-3 flex-wrap">

          <div className="flex items-start gap-3 min-w-0">
            {/* Rank badge */}
            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-[#0066ff]/15
                            flex items-center justify-center text-[#00e0ff]
                            text-sm font-bold border border-[#0066ff]/20">
              {rank}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-txt-primary truncate">{rec.role}</h3>
              <p className="text-txt-muted text-xs mt-0.5 italic">{rec.headline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <ScoreBadge score={rec.match_score} />
            <span className="pill-salary text-xs">
              ₹{(rec.avg_salary / 100000).toFixed(1)}L/yr
            </span>
          </div>
        </div>

        {/* Skill chips preview */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rec.strengths.slice(0, 5).map(s => (
            <span key={s} className="skill-chip border-[#0bd97a]/30 text-[#0bd97a] bg-[#0bd97a]/5">
              {s}
            </span>
          ))}
          {rec.missing_skills.slice(0, 3).map(s => (
            <span key={s} className="skill-chip border-[#f59e0b]/30 text-[#f59e0b] bg-[#f59e0b]/5">
              {s}
            </span>
          ))}
          {(rec.strengths.length + rec.missing_skills.length) > 8 && (
            <span className="skill-chip border-white/10 text-txt-muted">
              +{rec.strengths.length + rec.missing_skills.length - 8} more
            </span>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className="mt-4 flex items-center gap-1.5 text-xs font-medium text-[#00e0ff]
                     hover:text-white transition-colors"
        >
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {open ? "Hide details" : "View full details — skills, resources & action plan"}
        </button>
      </div>

      {/* ── Expanded section ────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-5 pb-5 pt-4 space-y-5">

              {/* Strengths */}
              {rec.strengths.length > 0 && (
                <div>
                  <p className="section-title flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-[#0bd97a]" />
                    Strengths — you already have these
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.strengths.map(s => (
                      <span key={s} className="skill-chip border-[#0bd97a]/30 text-[#0bd97a] bg-[#0bd97a]/8">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {rec.missing_skills.length > 0 && (
                <div>
                  <p className="section-title flex items-center gap-1.5">
                    <AlertCircle size={12} className="text-[#f59e0b]" />
                    Skill gaps — learn in this order
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {rec.missing_skills.map((s, i) => (
                      <div key={s}
                           className="flex items-center gap-2 rounded-lg bg-[#f59e0b]/5
                                      border border-[#f59e0b]/15 px-3 py-1.5 text-sm">
                        <span className="text-[#f59e0b] font-bold text-xs w-4">{i + 1}.</span>
                        <span className="text-txt-soft capitalize">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {rec.resources.length > 0 && (
                <div>
                  <p className="section-title flex items-center gap-1.5">
                    <BookOpen size={12} className="text-[#00e0ff]" />
                    Curated learning resources
                  </p>
                  <ul className="space-y-1.5">
                    {rec.resources.map(r => (
                      <li key={r}
                          className="flex items-start gap-2 text-sm text-txt-soft
                                     leading-relaxed">
                        <span className="text-[#00e0ff] mt-0.5 flex-shrink-0">📚</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 4-week plan */}
              {rec.action_plan.length > 0 && (
                <div>
                  <p className="section-title flex items-center gap-1.5">
                    <Target size={12} className="text-[#a855f7]" />
                    4-week action plan
                  </p>
                  <div className="space-y-2">
                    {rec.action_plan.map((step, i) => (
                      <div key={i}
                           className="flex gap-3 rounded-lg bg-[#a855f7]/5
                                      border border-[#a855f7]/15 px-3 py-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full
                                         bg-[#a855f7]/20 text-[#a855f7] text-xs
                                         font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-txt-soft leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mini projects */}
              {rec.mini_projects.length > 0 && (
                <div>
                  <p className="section-title flex items-center gap-1.5">
                    <Code2 size={12} className="text-[#0066ff]" />
                    Mini-project ideas
                  </p>
                  <ul className="space-y-1.5">
                    {rec.mini_projects.map(p => (
                      <li key={p}
                          className="flex items-start gap-2 text-sm text-txt-soft
                                     leading-relaxed">
                        <span className="flex-shrink-0 mt-0.5">🚀</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confidence CTA */}
              <div className={`rounded-lg px-4 py-3 text-sm font-medium
                              ${rec.match_score >= 60
                                ? "bg-[#0bd97a]/10 border border-[#0bd97a]/20 text-[#0bd97a]"
                                : "bg-[#0066ff]/10 border border-[#0066ff]/20 text-[#00e0ff]"}`}>
                <Lightbulb size={14} className="inline mr-2 -mt-0.5" />
                {rec.match_score >= 60
                  ? "You can land internships/roles quickly if you complete the action plan!"
                  : "Follow the 4-week plan and mini-projects — you'll level up fast!"}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
