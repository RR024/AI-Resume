"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div className="card p-6 border-red-500/20 bg-red-500/5 flex flex-col items-center
                    gap-4 text-center mx-auto max-w-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-full
                      bg-red-500/10 border border-red-500/20">
        <AlertTriangle size={22} className="text-red-400" />
      </div>
      <div>
        <p className="font-semibold text-red-400 mb-1">Something went wrong</p>
        <p className="text-txt-muted text-sm leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost text-sm gap-2">
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
