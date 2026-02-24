"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles, ArrowRight, RefreshCw, Info } from "lucide-react";
import Header from "@/components/Header";

const QUICK_TAGS = [
  "python, sql, pandas",
  "javascript, react, nodejs",
  "java, springboot, docker",
  "machine learning, tensorflow, python",
  "aws, kubernetes, terraform",
  "data analysis, tableau, excel",
];

export default function HomePage() {
  const router = useRouter();
  const [skills, setSkills] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [topN, setTopN] = useState(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // If only resume pasted, extract tokens
    let finalSkills = skills.trim();
    if (!finalSkills && resumeText.trim()) {
      const tokens = resumeText
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2);
      const freq = Array.from(new Set(tokens)).slice(0, 20);
      finalSkills = freq.join(", ");
    }

    if (!finalSkills) {
      setError("Please enter at least one skill or paste your resume text.");
      return;
    }
    setError("");
    setLoading(true);

    const params = new URLSearchParams({
      skills: finalSkills,
      top_n: String(topN),
    });
    router.push(`/results?${params.toString()}`);
  }

  function handleReset() {
    setSkills("");
    setResumeText("");
    setTopN(3);
    setError("");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">

        {/* ── Hero banner ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden border-b border-white/5">
          {/* Background glow blobs */}
          <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96
                          rounded-full bg-[#0066ff]/8 blur-3xl" />
          <div className="pointer-events-none absolute -top-16 right-10 h-64 w-64
                          rounded-full bg-[#00e0ff]/6 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full
                              border border-[#0066ff]/30 bg-[#0066ff]/10
                              px-4 py-1.5 text-xs font-semibold text-[#00e0ff] mb-6">
                <Sparkles size={12} />
                TF-IDF + Cosine Similarity ML Engine
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-txt-primary
                             leading-tight tracking-tight mb-4">
                Discover Your
                <span className="bg-gradient-to-r from-[#00e0ff] to-[#0066ff]
                                 bg-clip-text text-transparent"> Perfect Career Path</span>
              </h1>

              <p className="text-txt-muted text-base sm:text-lg max-w-2xl mx-auto
                            leading-relaxed">
                Enter your skills and our AI engine matches you to the best-fit roles,
                highlights your gaps, and builds a personalised 4-week action plan.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Input form ──────────────────────────────────────────────── */}
        <section className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">

              {/* Skills input */}
              <div>
                <label className="block text-sm font-semibold text-txt-primary mb-2">
                  Your Skills
                  <span className="text-red-400 ml-1">*</span>
                </label>
                <textarea
                  rows={3}
                  value={skills}
                  onChange={e => { setSkills(e.target.value); setError(""); }}
                  placeholder="e.g. python, sql, pandas, machine learning"
                  className="w-full rounded-lg bg-bg-base/60 border border-white/10
                             px-4 py-3 text-txt-primary placeholder-txt-muted
                             text-sm focus:outline-none focus:border-[#0066ff]/60
                             focus:ring-1 focus:ring-[#0066ff]/30 resize-none
                             transition-colors"
                />
                <p className="mt-1.5 text-xs text-txt-muted flex items-center gap-1">
                  <Info size={11} />
                  Separate skills with commas. Or paste your resume below.
                </p>
              </div>

              {/* Quick-fill tags */}
              <div>
                <p className="text-xs font-medium text-txt-muted mb-2">Quick fill:</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setSkills(tag)}
                      className="rounded-full border border-white/10 px-3 py-1
                                 text-xs text-txt-muted hover:border-[#0066ff]/40
                                 hover:text-[#00e0ff] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resume text (optional) */}
              <div>
                <label className="block text-sm font-medium text-txt-muted mb-2">
                  Paste Resume / LinkedIn About{" "}
                  <span className="text-xs">(optional — used if skills field is empty)</span>
                </label>
                <textarea
                  rows={4}
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste resume or profile text here…"
                  className="w-full rounded-lg bg-bg-base/60 border border-white/10
                             px-4 py-3 text-txt-primary placeholder-txt-muted
                             text-sm focus:outline-none focus:border-[#0066ff]/60
                             focus:ring-1 focus:ring-[#0066ff]/30 resize-none
                             transition-colors"
                />
              </div>

              {/* Top N slider */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-txt-muted whitespace-nowrap">
                  Show top
                </label>
                <input
                  type="range"
                  min={1} max={8} step={1}
                  value={topN}
                  onChange={e => setTopN(Number(e.target.value))}
                  className="flex-1 accent-[#0066ff]"
                />
                <span className="w-8 text-center text-sm font-bold text-[#00e0ff]">
                  {topN}
                </span>
                <label className="text-sm font-medium text-txt-muted whitespace-nowrap">
                  matches
                </label>
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400 flex items-center gap-1.5">
                  <Info size={13} />
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary flex-1 sm:flex-none">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30
                                       border-t-white animate-spin" />
                      Finding matches…
                    </span>
                  ) : (
                    <>
                      Find my career matches
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
                <button type="button" onClick={handleReset} className="btn-ghost">
                  <RefreshCw size={14} />
                  Clear
                </button>
              </div>
            </form>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 grid grid-cols-3 gap-4 text-center"
          >
            {[
              { value: "75+", label: "Job Roles" },
              { value: "TF-IDF", label: "ML Engine" },
              { value: "4-Week", label: "Action Plans" },
            ].map(({ value, label }) => (
              <div key={label} className="card py-4 px-2">
                <p className="text-lg font-extrabold text-[#00e0ff]">{value}</p>
                <p className="text-xs text-txt-muted mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-txt-muted">
        AI Career Path Recommender — Built with FastAPI + Next.js
      </footer>
    </div>
  );
}
