"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner({ label = "Analysing your skills…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24">
      {/* Layered rings */}
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-[#7c3aed]/20" />
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent
                        border-t-[#a78bfa] border-r-[#67e8f9]
                        animate-[spin3d_1s_linear_infinite]" />
        {/* Inner glow dot */}
        <div className="absolute inset-[6px] rounded-full
                        bg-gradient-to-br from-[#7c3aed]/30 to-[#06b6d4]/20
                        animate-pulse" />
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#a78bfa] to-[#67e8f9]" />
        </div>
      </div>

      {/* Animated dots */}
      <div className="flex items-center gap-1.5">
        {[0, 0.15, 0.3].map((delay, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 0.9, delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <p className="text-[#475569] text-sm">{label}</p>
    </div>
  );
}
