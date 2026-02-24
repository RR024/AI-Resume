import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Career Path Recommender",
  description:
    "Discover your best-fit career roles using TF-IDF ML matching, get personalised skill-gap analysis and a 4-week action plan.",
  keywords: ["career", "AI", "machine learning", "skills", "job recommendations"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg-base text-txt-primary antialiased">
        {children}
      </body>
    </html>
  );
}
