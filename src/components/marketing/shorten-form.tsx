"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, Scissors } from "lucide-react";
import { api, shortUrl } from "@/lib/api";
import { CopyButton } from "@/components/ui/copy";
import { DEFAULT_QR_CONFIG } from "@/lib/qr/types";
import { QrThumb } from "@/components/qr/qr-preview";

export function ShortenForm({ compact = false }: { compact?: boolean }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ slug: string; destination: string; authed: boolean } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await api<{ link: { slug: string; destination: string }; authed: boolean }>(
        "/api/shorten",
        { method: "POST", json: { destination: url.trim() } }
      );
      setResult({ ...res.link, authed: res.authed });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const short = shortUrl(result.slug);
    return (
      <div className="animate-pop-in">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-[0_8px_30px_-12px_rgba(9,9,11,0.12)]">
          <div className="shrink-0 rounded-lg border border-zinc-100 bg-white p-1">
            <QrThumb text={short} config={DEFAULT_QR_CONFIG} size={52} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Link is live
            </p>
            <p className="mt-0.5 truncate font-mono text-[13.5px] font-medium text-zinc-900">
              {short.replace(/^https?:\/\//, "")}
            </p>
            <p className="truncate text-xs text-zinc-400">{result.destination}</p>
          </div>
          <CopyButton value={short} label="Copy short link" className="shrink-0 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800" />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
          {!result.authed ? (
            <p className="text-xs leading-relaxed text-zinc-500">
              Want to edit it later?{" "}
              <Link href="/signup" className="font-medium text-accent hover:underline">
                Create a free account
              </Link>
            </p>
          ) : (
            <p className="text-xs text-zinc-500">Saved to your dashboard.</p>
          )}
          <div className="flex items-center gap-3">
            <a
              href={result.destination}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Test it
            </a>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setUrl("");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-indigo-700"
            >
              Shorten another
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className={`flex flex-col gap-2 sm:flex-row ${compact ? "" : "sm:gap-2.5"}`}>
        <div className="relative min-w-0 flex-1">
          <Scissors className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-300" />
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your long URL…"
            aria-label="URL to shorten"
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-[15px] text-zinc-900 shadow-card outline-none transition-all placeholder:text-zinc-400 hover:border-zinc-300 focus:border-accent focus:ring-4 focus:ring-accent/10"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:bg-zinc-700 disabled:opacity-60"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Shorten
        </button>
      </div>
      {error && (
        <p className="mt-2 px-1 text-[13px] font-medium text-red-600 animate-fade-in">{error}</p>
      )}
      {!compact && !error && (
        <p className="mt-3 px-1 text-[13px] text-zinc-400">
          Free to use · No account needed · Editable after you sign up
        </p>
      )}
    </form>
  );
}
