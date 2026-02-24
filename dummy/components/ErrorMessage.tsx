"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Wifi } from "lucide-react";

interface Props { message: string; onRetry?: () => void; }

export default function ErrorMessage({ message, onRetry }: Props) {
  const isNetwork = message.toLowerCase().includes("cannot reach") ||
                    message.toLowerCase().includes("network");
  const Icon = isNetwork ? Wifi : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card-nohover border-red-500/20 p-8 text-center max-w-lg mx-auto"
      style={{
        background: "rgba(239,68,68,0.04)",
        border: "1px solid rgba(239,68,68,0.18)",
      }}
    >
      {/* Icon with glow */}
      <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
           style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.2)" }}>
        <Icon size={22} className="text-red-400" />
      </div>

      <h3 className="text-base font-bold text-white mb-2">Something went wrong</h3>
      <p className="text-[#94a3b8] text-sm leading-relaxed mb-6">{message}</p>

      {onRetry && (
        <button onClick={onRetry} className="btn-ghost-v2 mx-auto">
          <RefreshCw size={13} />
          Try again
        </button>
      )}
    </motion.div>
  );
}
