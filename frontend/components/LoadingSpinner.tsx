"use client";

export default function LoadingSpinner({ message = "Computing best matches…" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20">
      {/* Animated rings */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-[#0066ff]/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent
                        border-t-[#00e0ff] animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent
                        border-t-[#0066ff] animate-spin [animation-duration:1.4s]" />
        <div className="absolute inset-[14px] rounded-full bg-[#0066ff]/10
                        animate-pulse-slow" />
      </div>
      <p className="text-txt-muted text-sm font-medium animate-pulse">{message}</p>
    </div>
  );
}
