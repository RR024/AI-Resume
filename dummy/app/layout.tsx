import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Career Path — Find Your Role",
  description: "ML-powered career recommender with skill gap analysis, learning resources & 4-week action plans.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* Aurora background — fixed, behind everything */}
        <div className="aurora-bg" aria-hidden="true">
          <div className="aurora-orb-1" />
          <div className="aurora-orb-2" />
        </div>
        {/* Subtle grid overlay */}
        <div className="grid-overlay" aria-hidden="true" />

        <div className="page-wrapper">{children}</div>
      </body>
    </html>
  );
}
