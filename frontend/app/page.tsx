"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, ArrowRight, RefreshCw, Zap,
  BrainCircuit, Target, BookOpen, Info,
  UploadCloud, CheckCircle2, XCircle, Loader2
} from "lucide-react";
import Header from "@/components/Header";

/* ── Floating skill pill decorations ────────────────────────── */
const FLOATERS = [
  { label: "Python",          x: "8%",   y: "22%",  delay: 0,    color: "skill-tag-cyan"   },
  { label: "React",           x: "84%",  y: "18%",  delay: 0.4,  color: "skill-tag-purple" },
  { label: "Machine Learning",x: "78%",  y: "58%",  delay: 0.8,  color: "skill-tag-pink"   },
  { label: "Docker",          x: "5%",   y: "65%",  delay: 0.6,  color: "skill-tag-green"  },
  { label: "SQL",             x: "88%",  y: "40%",  delay: 1.2,  color: "skill-tag-amber"  },
  { label: "TypeScript",      x: "12%",  y: "45%",  delay: 1.0,  color: "skill-tag-cyan"   },
  { label: "Kubernetes",      x: "72%",  y: "78%",  delay: 0.3,  color: "skill-tag-purple" },
  { label: "TensorFlow",      x: "3%",   y: "82%",  delay: 0.9,  color: "skill-tag-green"  },
];

const QUICK_TAGS = [
  "python, sql, pandas",
  "javascript, react, nodejs",
  "java, springboot, docker",
  "machine learning, tensorflow",
  "aws, kubernetes, terraform",
  "unity, c#, game development",
];

const STATS = [
  { icon: BrainCircuit, value: "108",   label: "Job roles",       color: "text-[#a78bfa]", glow: "rgba(124,58,237,0.15)" },
  { icon: Zap,          value: "TF-IDF", label: "ML Engine",       color: "text-[#67e8f9]", glow: "rgba(6,182,212,0.15)"  },
  { icon: Target,       value: "4-Week", label: "Action plans",    color: "text-[#f9a8d4]", glow: "rgba(236,72,153,0.12)" },
  { icon: BookOpen,     value: "50+",   label: "Curated resources",color: "text-[#6ee7b7]", glow: "rgba(16,185,129,0.12)" },
];

/* ── Known tech / domain skill keywords for smart extraction ── */
const SKILL_KEYWORDS = new Set([
  "python","java","javascript","typescript","kotlin","swift","c","c++","c#","go","rust","scala","ruby","php","dart","r","matlab",
  "react","nextjs","vuejs","angular","svelte","nodejs","express","fastapi","django","flask","spring","springboot","laravel","rails",
  "html","css","sass","tailwind","bootstrap","graphql","rest","restapi","grpc","websocket",
  "sql","mysql","postgresql","sqlite","mongodb","redis","elasticsearch","cassandra","dynamodb","firebase","supabase",
  "docker","kubernetes","terraform","ansible","jenkins","gitlab","github","cicd","linux","bash","nginx",
  "aws","azure","gcp","cloudflare","heroku","vercel","netlify",
  "pandas","numpy","sklearn","scikit","tensorflow","pytorch","keras","xgboost","lightgbm","opencv","nltk","spacy",
  "spark","hadoop","airflow","kafka","dbt","snowflake","bigquery","redshift","tableau","powerbi","looker","metabase",
  "machine learning","deep learning","nlp","computer vision","llm","mlops","rag","langchain","huggingface","transformers",
  "figma","sketch","xd","illustrator","photoshop","blender","unity","unreal",
  "flutter","android","ios","react native","expo",
  "solidity","ethereum","web3","blockchain","smart contracts",
  "ros","embedded","arduino","raspberry pi","iot","rtos",
  "git","jira","agile","scrum","kanban","devops","sre","microservices","system design","architecture",
  "excel","powerpoint","communication","leadership","management","analytics","statistics","optimization","testing","selenium","pytest",
]);

function extractSkillsFromText(text: string): string {
  const lower = text.toLowerCase().replace(/[^a-z0-9+# \n]/g, " ");
  const found: string[] = [];
  // Multi-word keywords first
  SKILL_KEYWORDS.forEach(kw => {
    if (kw.includes(" ")) {
      if (lower.includes(kw) && !found.includes(kw)) found.push(kw);
    }
  });
  // Single-word keywords
  const words = new Set(lower.split(/\s+/).filter(w => w.length > 1));
  words.forEach(w => {
    if (SKILL_KEYWORDS.has(w) && !found.includes(w)) found.push(w);
  });
  return found.slice(0, 25).join(", ");
}

async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "txt") {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = e => res(e.target?.result as string ?? "");
      reader.onerror = () => rej(new Error("Could not read file"));
      reader.readAsText(file);
    });
  }

  if (ext === "pdf") {
    const buf = await file.arrayBuffer();
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it: any) => it.str ?? "").join(" ") + "\n";
    }
    return text;
  }

  if (ext === "docx") {
    const buf = await file.arrayBuffer();
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    return result.value;
  }

  throw new Error("Unsupported file type. Please use PDF, DOCX, or TXT.");
}

export default function HomePage() {
  const router = useRouter();
  const [skills, setSkills]   = useState("");
  const [topN, setTopN]       = useState(3);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  // Resume file upload state
  const [resumeFile, setResumeFile]       = useState<File | null>(null);
  const [resumeStatus, setResumeStatus]   = useState<"idle"|"parsing"|"done"|"error">("idle");
  const [resumeError, setResumeError]     = useState("");
  const [isDragging, setIsDragging]       = useState(false);

  async function handleResumeFile(file: File) {
    setResumeFile(file);
    setResumeStatus("parsing");
    setResumeError("");
    try {
      const text = await extractTextFromFile(file);
      const extracted = extractSkillsFromText(text);
      if (!extracted) throw new Error("No recognisable skills found in the resume. Try typing them manually.");
      setSkills(extracted);
      setResumeStatus("done");
      setError("");
    } catch (err: any) {
      setResumeStatus("error");
      setResumeError(err?.message ?? "Failed to parse resume.");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleResumeFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleResumeFile(file);
    e.target.value = "";
  }

  function clearResume() {
    setResumeFile(null);
    setResumeStatus("idle");
    setResumeError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalSkills = skills.trim();
    if (!finalSkills) {
      setError("Please enter at least one skill or upload your resume.");
      return;
    }
    setError("");
    setLoading(true);
    router.push(`/results?skills=${encodeURIComponent(finalSkills)}&top_n=${topN}`);
  }

  function handleReset() {
    setSkills(""); setTopN(3); setError(""); clearResume();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative">

        {/* ── Floating skill decorations (hidden on mobile) ──── */}
        <div className="hidden lg:block pointer-events-none select-none" aria-hidden="true">
          {FLOATERS.map(({ label, x, y, delay, color }) => (
            <motion.div
              key={label}
              className={`absolute skill-tag-v2 ${color} opacity-60`}
              style={{ left: x, top: y }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 0.6, 0.5],
                y: [0, -10, 0],
                scale: [0.8, 1, 1],
              }}
              transition={{
                opacity: { duration: 0.6, delay },
                y: { duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay: delay * 2 },
                scale: { duration: 0.4, delay },
              }}
            >
              {label}
            </motion.div>
          ))}
        </div>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pt-16 pb-10 sm:pt-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 text-xs font-semibold"
                 style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}>
              <Sparkles size={11} />
              AI-Powered Career Intelligence
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none mb-6">
              <span className="text-white">Discover Your{" "}</span>
              <br />
              <span className="grad-text-purple-cyan">
                Ideal Career Path
              </span>
            </h1>

            <p className="text-[#64748b] text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
              Enter your skills and our ML engine finds your best-fit roles, maps your
              skill gaps, and builds a personalised{" "}
              <span style={{ color: "#a78bfa" }}>4-week action plan</span> — instantly.
            </p>
          </motion.div>
        </section>

        {/* ── Input Card ────────────────────────────────────────── */}
        <section className="mx-auto max-w-2xl px-4 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card p-6 sm:p-8"
            style={{ border: "1px solid rgba(124,58,237,0.18)" }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Skills input */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Your Skills
                  <span className="text-red-400 ml-1 text-xs">*</span>
                </label>
                <textarea
                  rows={3}
                  value={skills}
                  onChange={e => { setSkills(e.target.value); setError(""); }}
                  placeholder="e.g. python, sql, machine learning, pandas, react…"
                  className="input-premium"
                />
                <p className="mt-1.5 text-xs text-[#475569] flex items-center gap-1">
                  <Info size={10} />
                  Separate with commas. The more specific, the better the match.
                </p>
              </div>

              {/* Quick fill */}
              <div>
                <p className="text-xs font-medium text-[#475569] mb-2">Quick fill →</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TAGS.map(tag => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => { setSkills(tag); setError(""); }}
                      className="skill-tag-v2 skill-tag-muted hover:skill-tag-purple
                                 transition-all duration-200 cursor-pointer"
                      style={{
                        background: skills === tag ? "rgba(124,58,237,0.12)" : undefined,
                        borderColor: skills === tag ? "rgba(124,58,237,0.35)" : undefined,
                        color: skills === tag ? "#c4b5fd" : undefined,
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Resume Upload ─────────────────────────────── */}
              <div>
                <p className="text-xs font-semibold text-[#475569] mb-2 flex items-center gap-1.5">
                  <UploadCloud size={11} />
                  Or analyse your resume
                </p>

                {/* Drop zone */}
                {resumeStatus === "idle" && (
                  <label
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className="relative flex flex-col items-center justify-center gap-2 rounded-2xl
                               px-5 py-6 cursor-pointer transition-all duration-200"
                    style={{
                      border: `1.5px dashed ${isDragging ? "rgba(124,58,237,0.55)" : "rgba(255,255,255,0.10)"}`,
                      background: isDragging ? "rgba(124,58,237,0.07)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      onChange={handleFileInput}
                    />
                    <UploadCloud
                      size={26}
                      className="transition-colors"
                      style={{ color: isDragging ? "#a78bfa" : "#475569" }}
                    />
                    <p className="text-xs font-medium text-center" style={{ color: isDragging ? "#c4b5fd" : "#64748b" }}>
                      {isDragging
                        ? "Drop to analyse your resume"
                        : <><span className="text-[#a78bfa] font-semibold">Click to browse</span> or drag & drop your resume</>}
                    </p>
                    <p className="text-[10px] text-[#334155]">PDF · DOCX · TXT</p>
                  </label>
                )}

                {/* Parsing state */}
                {resumeStatus === "parsing" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 rounded-2xl px-4 py-4"
                    style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.18)" }}
                  >
                    <Loader2 size={15} className="text-[#a78bfa] animate-spin flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#a78bfa]">Analysing resume…</p>
                      <p className="text-[10px] text-[#475569] truncate">{resumeFile?.name}</p>
                    </div>
                  </motion.div>
                )}

                {/* Done state */}
                {resumeStatus === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 rounded-2xl px-4 py-4"
                    style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.20)" }}
                  >
                    <CheckCircle2 size={15} className="text-[#6ee7b7] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#6ee7b7]">Skills extracted & filled ↑</p>
                      <p className="text-[10px] text-[#475569] truncate">{resumeFile?.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearResume}
                      className="flex-shrink-0 text-[#475569] hover:text-[#94a3b8] transition-colors"
                      title="Remove"
                    >
                      <XCircle size={15} />
                    </button>
                  </motion.div>
                )}

                {/* Error state */}
                {resumeStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 rounded-2xl px-4 py-4"
                    style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.18)" }}
                  >
                    <XCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-red-400">Failed to parse resume</p>
                      <p className="text-[10px] text-[#475569] mt-0.5">{resumeError}</p>
                    </div>
                    <button
                      type="button"
                      onClick={clearResume}
                      className="flex-shrink-0 text-[#475569] hover:text-[#94a3b8] transition-colors"
                    >
                      <RefreshCw size={13} />
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Top-N slider */}
              <div className="flex items-center gap-4 py-1">
                <span className="text-xs font-medium text-[#475569] whitespace-nowrap">
                  Show top
                </span>
                <div className="flex-1 relative">
                  <input
                    type="range" min={1} max={8} step={1} value={topN}
                    onChange={e => setTopN(Number(e.target.value))}
                    className="w-full accent-[#7c3aed] h-1.5 rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #7c3aed ${(topN - 1) / 7 * 100}%, rgba(255,255,255,0.08) ${(topN - 1) / 7 * 100}%)`,
                    }}
                  />
                </div>
                <span className="w-7 text-center text-sm font-extrabold grad-text-purple-cyan">
                  {topN}
                </span>
                <span className="text-xs font-medium text-[#475569] whitespace-nowrap">
                  matches
                </span>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 flex items-center gap-1.5 font-medium"
                  >
                    <Info size={11} /> {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-1">
                <button type="submit" disabled={loading} className="btn-holographic flex-1 sm:flex-none justify-center">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-[spin3d_0.8s_linear_infinite]" />
                      Analysing…
                    </>
                  ) : (
                    <>
                      Find my career matches
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <button type="button" onClick={handleReset} className="btn-ghost-v2">
                  <RefreshCw size={13} />
                  Clear
                </button>
              </div>
            </form>
          </motion.div>
        </section>

        {/* ── Stats Row ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {STATS.map(({ icon: Icon, value, label, color, glow }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="stat-card group cursor-default"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
              >
                <div className="mx-auto w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                     style={{ background: glow }}>
                  <Icon size={16} className={color} />
                </div>
                <p className={`text-xl font-extrabold mb-0.5 ${color}`}>{value}</p>
                <p className="text-[10px] font-medium text-[#475569] leading-tight">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-5 text-center text-[11px] text-[#334155]">
        AI Career Path — FastAPI · scikit-learn · Next.js 14
      </footer>
    </div>
  );
}
