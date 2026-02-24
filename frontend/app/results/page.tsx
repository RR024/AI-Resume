"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, BarChart3, RefreshCw, Trophy,
  TrendingUp, Users, Layers
} from "lucide-react";
import Header from "@/components/Header";
import RoleCard from "@/components/RoleCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import { fetchRecommendations, getErrorMessage } from "@/lib/api";
import type { RecommendResponse } from "@/lib/types";

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const skills = params.get("skills") ?? "";
  const topN   = Number(params.get("top_n") ?? 3);

  const [data, setData]       = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!skills) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchRecommendations({ skills, top_n: topN });
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [skills, topN]);

  useEffect(() => { load(); }, [load]);

  // Derived summary stats
  const avgScore  = data ? Math.round(data.recommendations.reduce((s, r) => s + r.match_score, 0) / data.recommendations.length) : 0;
  const topSalary = data ? Math.max(...data.recommendations.map(r => r.avg_salary)) : 0;
  const topRole   = data?.recommendations[0];

  // No params guard
  if (!skills) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 text-center">
          <Layers size={40} className="text-txt-muted" />
          <p className="text-txt-muted">No skills provided. Go back and enter your skills first.</p>
          <Link href="/" className="btn-primary">
            <ArrowLeft size={15} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm text-txt-muted
                         hover:text-txt-primary transition-colors mb-3"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <h1 className="text-2xl font-bold text-txt-primary flex items-center gap-2">
              <BarChart3 size={22} className="text-[#00e0ff]" />
              Career Recommendations
            </h1>
            <p className="text-txt-muted text-sm mt-1">
              Skills analysed:{" "}
              <span className="text-txt-soft font-medium">{skills}</span>
            </p>
          </div>

          <button onClick={load} disabled={loading} className="btn-ghost text-sm">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ── Loading ── */}
        {loading && <LoadingSpinner />}

        {/* ── Error ── */}
        {!loading && error && (
          <ErrorMessage message={error} onRetry={load} />
        )}

        {/* ── Results ── */}
        {!loading && !error && data && (
          <>
            {/* Summary strip */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
            >
              {[
                {
                  icon: Trophy,
                  color: "text-[#f59e0b]",
                  bg:    "bg-[#f59e0b]/10 border-[#f59e0b]/20",
                  label: "Top Match",
                  value: topRole?.role ?? "—",
                  small: true,
                },
                {
                  icon: TrendingUp,
                  color: "text-[#00e0ff]",
                  bg:    "bg-[#00e0ff]/10 border-[#00e0ff]/20",
                  label: "Avg Match Score",
                  value: `${avgScore}%`,
                },
                {
                  icon: Users,
                  color: "text-[#a855f7]",
                  bg:    "bg-[#a855f7]/10 border-[#a855f7]/20",
                  label: "Roles Found",
                  value: String(data.total_results),
                },
                {
                  icon: BarChart3,
                  color: "text-[#0bd97a]",
                  bg:    "bg-[#0bd97a]/10 border-[#0bd97a]/20",
                  label: "Top Salary",
                  value: `₹${(topSalary / 100000).toFixed(1)}L`,
                },
              ].map(({ icon: Icon, color, bg, label, value, small }) => (
                <div key={label}
                     className={`card border ${bg} p-4 flex items-center gap-3`}>
                  <div className={`h-9 w-9 rounded-lg flex-shrink-0 flex items-center
                                   justify-center ${bg}`}>
                    <Icon size={17} className={color} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-txt-muted">{label}</p>
                    <p className={`font-bold text-txt-primary ${small ? "text-sm truncate" : "text-lg"}`}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Role cards */}
            <div className="space-y-4">
              {data.recommendations.map((rec, i) => (
                <RoleCard key={rec.role + i} rec={rec} rank={i + 1} />
              ))}
            </div>

            {/* Footer CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 text-center"
            >
              <p className="text-txt-muted text-sm mb-4">
                Want to try different skills?
              </p>
              <Link href="/" className="btn-primary inline-flex">
                <ArrowLeft size={15} />
                Try new skills
              </Link>
            </motion.div>
          </>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && data?.recommendations.length === 0 && (
          <div className="text-center py-20">
            <Layers size={40} className="mx-auto text-txt-muted mb-4" />
            <p className="text-txt-muted">No matches found. Try adding more skills.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-txt-muted">
        AI Career Path Recommender — Built with FastAPI + Next.js
      </footer>
    </div>
  );
}
