"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrainCircuit, LayoutDashboard, Info } from "lucide-react";

const NAV = [
  { href: "/",        label: "Home",    icon: BrainCircuit   },
  { href: "/results", label: "Results", icon: LayoutDashboard },
  { href: "/about",   label: "About",   icon: Info            },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-md bg-bg-base/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg
                            bg-gradient-to-br from-[#0066ff] to-[#00e0ff]
                            shadow-glow group-hover:shadow-glow transition-shadow">
              <BrainCircuit size={18} className="text-white" />
            </div>
            <span className="font-bold text-txt-primary text-sm sm:text-base leading-tight">
              AI Career<br className="hidden sm:block" />
              <span className="text-[#00e0ff]"> Recommender</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium
                              transition-all duration-150
                              ${active
                                ? "bg-[#0066ff]/15 text-[#00e0ff]"
                                : "text-txt-muted hover:text-txt-primary hover:bg-white/5"}`}
                >
                  <Icon size={15} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
