"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  className = "",
  label,
  iconOnly = true,
  size = "md",
}: {
  value: string | (() => string);
  className?: string;
  label?: string;
  iconOnly?: boolean;
  size?: "sm" | "md";
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    const text = typeof value === "function" ? value() : value;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label ?? "Copy to clipboard"}
      title={label ?? "Copy"}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 active:scale-[0.97] ${
        size === "sm" ? "h-7 w-7" : "h-8 w-8"
      } ${className}`}
    >
      {copied ? (
        <Check
          className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} text-emerald-600 animate-pop-in`}
        />
      ) : (
        <Copy
          className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"}`}
          strokeWidth={2}
        />
      )}
      {!iconOnly && (
        <span className="text-[13px]">{copied ? "Copied" : (label ?? "Copy")}</span>
      )}
    </button>
  );
}

export function CopyField({ value }: { value: string }) {
  return (
    <div className="flex h-9 items-center overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-card">
      <span className="min-w-0 flex-1 truncate px-3 font-mono text-[13px] text-zinc-700">
        {value}
      </span>
      <CopyButton
        value={value}
        label="Copy link"
        className="mr-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
      />
    </div>
  );
}

export function CopyShortLink({
  slug,
  prefix,
  className,
  size = "sm",
}: {
  slug: string;
  prefix?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <CopyButton
      value={() => `${window.location.origin}/${prefix ? prefix + "/" : ""}${slug}`}
      label="Copy short URL"
      className={className}
      size={size}
    />
  );
}

export function ShortUrlText({ slug, className = "" }: { slug: string; className?: string }) {
  const [url, setUrl] = useState(`/${slug}`);
  useEffect(() => setUrl(`${window.location.origin}/${slug}`), [slug]);
  return <span className={className}>{url.replace(/^https?:\/\//, "")}</span>;
}

export function ShortUrlField({ slug }: { slug: string }) {
  const [url, setUrl] = useState(`/${slug}`);
  useEffect(() => setUrl(`${window.location.origin}/${slug}`), [slug]);
  return <CopyField value={url} />;
}
