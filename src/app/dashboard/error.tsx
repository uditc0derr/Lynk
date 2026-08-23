"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 py-20 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-red-50">
        <AlertTriangle className="h-5 w-5 text-red-500" strokeWidth={1.75} />
      </div>
      <h2 className="text-sm font-semibold text-zinc-900">Something went wrong</h2>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-zinc-500">
        We hit an unexpected error loading this page. Your data is safe — try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Retry
      </button>
    </div>
  );
}
