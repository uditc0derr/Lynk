import Link from "next/link";
import { Mark as LogoMark } from "@/components/logo";

export function StatusScreen({
  code,
  title,
  body,
}: {
  code: string;
  title: string;
  body: string;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-zinc-50 px-6">
      <div className="w-full max-w-sm animate-fade-in text-center">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <LogoMark className="h-7 w-7" />
          <span className="text-[15px] font-semibold tracking-tight text-zinc-900">
            lynk
          </span>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-card">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-400">
            {code}
          </p>
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">
            {title}
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-500">{body}</p>
        </div>
        <Link
          href="/"
          className="mt-6 inline-flex text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-700"
        >
          What is LYNK? →
        </Link>
      </div>
    </main>
  );
}
