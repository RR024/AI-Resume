"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Trophy, TrendingUp, Users,
  BarChart3, RefreshCw, Layers, AlertTriangle
} from "lucide-react";
import Header from "@/components/Header";
import RoleCard from "@/components/RoleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { fetchRecommendations, getErrorMessage } from "@/lib/api";
import type { RecommendResponse } from "@/lib/types";

/* ── Suspense shell ─────────────────────────────────────────── */
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner label="Loading results…" />
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}

/* ── Main content ───────────────────────────────────────────── */
function ResultsContent() {
  const router   = useRouter();
  const params   = useSearchParams();
  const skills   = params.get("skills") ?? "";
  const topN     = Number(params.get("top_n") ?? 3);

  const [data, setData]       = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!skills) return;
    setLoading(true); setError(null);
    try {
      setData(await fetchRecommendations({ skills, top_n: topN }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [skills, topN]);

  useEffect(() => { load(); }, [load]);

  /* Derived stats */
  const avgScore  = data
    ? Math.round(data.recommendations.reduce((s, r) => s + r.match_score, 0) / data.recommendations.length)
    : 0;
  const topSalary = data ? Math.max(...data.recommendations.map(r => r.avg_salary)) : 0;
  const topRole   = data?.recommendations[0];

  /* No skills guard */
  if (!skills) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
               style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <Layers size={24} className="text-[#a78bfa]" />
          </div>
          <p className="text-[#64748b]">No skills provided. Enter your skills first.</p>
          <Link href="/" className="btn-holographic">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">

        {/* ── Page header ──────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <button
              onClick={() => router.back()}
              className="btn-ghost-v2 mb-4 text-xs"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-center gap-2">
              <BarChart3 size={22} className="text-[#a78bfa]" />
              Career Matches
            </h1>
            <p className="text-[#475569] text-sm">
              Skills:{" "}
              <span className="text-[#94a3b8] font-medium">{skills}</span>
            </p>
          </div>

          <button onClick={load} disabled={loading} className="btn-ghost-v2">
            <RefreshCw size={13} className={loading ? "animate-[spin3d_1s_linear_infinite]" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && <LoadingSpinner label="Matching your skills to roles…" />}

        {/* ── Error ── */}
        {!loading && error && <ErrorMessage message={error} onRetry={load} />}

        {/* ── Results ── */}
        {!loading && !error && data && (
          <AnimatePresence mode="wait">
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* ── Summary stats ── */}
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {[
                  {
                    icon: Trophy, label: "Top Match",
                    value: topRole?.role ?? "—",
                    color: "text-[#fcd34d]",
                    bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.18)",
                    small: true,
                  },
                  {
                    icon: TrendingUp, label: "Avg Match Score",
                    value: `${avgScore}%`,
                    color: "text-[#67e8f9]",
                    bg: "rgba(6,182,212,0.08)", border: "rgba(6,182,212,0.18)",
                  },
                  {
                    icon: Users, label: "Roles Found",
                    value: String(data.total_results),
                    color: "text-[#c4b5fd]",
                    bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.18)",
                  },
                  {
                    icon: BarChart3, label: "Top Salary",
                    value: `₹${(topSalary / 100_000).toFixed(1)}L`,
                    color: "text-[#6ee7b7]",
                    bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.15)",
                  },
                ].map(({ icon: Icon, label, value, color, bg, border, small }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ background: bg }}>
                      <Icon size={16} className={color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#475569] mb-0.5">{label}</p>
                      <p className={`font-extrabold text-white ${small ? "text-sm truncate" : "text-lg"}`}>
                        {value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Divider */}
              <div className="divider-glow mb-8" />

              {/* ── No strong match banner ── */}
              <AnimatePresence>
                {data.no_strong_match && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl flex items-start gap-3 px-5 py-4 mb-6"
                    style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)" }}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                         style={{ background: "rgba(245,158,11,0.12)" }}>
                      <AlertTriangle size={15} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-400 text-sm mb-1">
                        No strong match found in our dataset
                      </p>
                      <p className="text-amber-300/70 text-sm leading-relaxed">
                        {data.suggestion}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Role cards ── */}
              <div className="space-y-4">
                {data.recommendations.map((rec, i) => (
                  <RoleCard key={rec.role + i} rec={rec} rank={i + 1} />
                ))}
              </div>

              {/* ── Footer CTA ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-12 text-center"
              >
                <div className="divider-glow mb-8" />
                <p className="text-[#475569] text-sm mb-5">
                  Want to explore different skills?
                </p>
                <Link href="/" className="btn-holographic inline-flex">
                  <ArrowLeft size={14} />
                  Try new skills
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && data?.recommendations.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                 style={{ background: "rgba(124,58,237,0.10)", border: "1px solid rgba(124,58,237,0.18)" }}>
              <Layers size={22} className="text-[#a78bfa]" />
            </div>
            <p className="text-[#475569]">No matches found. Try adding more skills.</p>
            <Link href="/" className="btn-ghost-v2">
              <ArrowLeft size={13} /> Go back
            </Link>
          </div>
        )}

      </main>

      <footer className="border-t border-white/5 py-5 text-center text-[11px] text-[#334155]">
        AI Career Path — FastAPI · scikit-learn · Next.js 14
      </footer>
    </div>
  );
}
