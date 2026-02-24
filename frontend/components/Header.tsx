"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, Sparkles } from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/",        label: "Home"    },
  { href: "/results", label: "Results" },
  { href: "/about",   label: "About"   },
];

export default function Header() {
  const path = usePathname();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="bg-[#02020a]/70 backdrop-blur-2xl border-b border-white/5">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4]
                              opacity-80 group-hover:opacity-100 transition-opacity blur-[1px] scale-110" />
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4]
                              flex items-center justify-center">
                <BrainCircuit size={16} className="text-white" strokeWidth={2.2} />
              </div>
            </div>
            <span className="font-bold text-sm tracking-tight text-white hidden sm:block">
              AI<span className="grad-text-purple-cyan">Career</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label }) => {
              const active = path === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    "relative px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200",
                    active ? "text-white" : "text-[#64748b] hover:text-[#94a3b8]"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* CTA Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full
                          bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[10px]
                          font-semibold text-[#a78bfa]">
            <Sparkles size={10} />
            ML Powered
          </div>
        </div>
      </div>
    </motion.header>
  );
}
