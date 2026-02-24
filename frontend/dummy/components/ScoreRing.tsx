"use client";

import { useEffect, useState } from "react";

interface Props {
  score: number;   // 0–100
  size?: number;
  strokeWidth?: number;
}

function getGradientId(score: number) {
  if (score >= 80) return "grad-green";
  if (score >= 60) return "grad-cyan";
  if (score >= 40) return "grad-amber";
  return "grad-pink";
}

function getColor(score: number) {
  if (score >= 80) return { from: "#10b981", to: "#6ee7b7", glow: "rgba(16,185,129,0.45)" };
  if (score >= 60) return { from: "#06b6d4", to: "#a78bfa", glow: "rgba(6,182,212,0.45)" };
  if (score >= 40) return { from: "#f59e0b", to: "#fcd34d", glow: "rgba(245,158,11,0.4)" };
  return            { from: "#ec4899", to: "#f9a8d4", glow: "rgba(236,72,153,0.4)" };
}

export default function ScoreRing({ score, size = 88, strokeWidth = 7 }: Props) {
  const [animated, setAnimated] = useState(false);
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const gradId = getGradientId(score) + `-${Math.round(score)}`;
  const { from, to, glow } = getColor(score);

  // Trigger animation after mount
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const offset = animated ? circumference - (score / 100) * circumference : circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* Glow halo behind ring */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-40"
        style={{ background: glow }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="relative"
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={cx} cy={cx} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <circle
          cx={cx} cy={cx} r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34, 1.2, 0.64, 1)" }}
        />
      </svg>

      {/* Score label */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ transform: "none" }}
      >
        <span className="text-base font-extrabold text-white leading-none">
          {score.toFixed(0)}
          <span className="text-[9px] font-bold text-white/50">%</span>
        </span>
      </div>
    </div>
  );
}
