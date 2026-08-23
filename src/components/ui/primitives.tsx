import type { LucideIcon } from "lucide-react";

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red" | "amber" | "accent";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-zinc-200 bg-zinc-50 text-zinc-600",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    accent: "border-accent-border bg-accent-soft text-indigo-700",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusDot({ tone }: { tone: "green" | "zinc" | "red" }) {
  const tones = { green: "bg-emerald-500", zinc: "bg-zinc-300", red: "bg-red-500" };
  return (
    <span className="relative flex h-[7px] w-[7px]">
      <span className={`absolute h-full w-full rounded-full ${tones[tone]}`} />
    </span>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-zinc-100 ${className}`}
    />
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50">
        <Icon className="h-5 w-5 text-zinc-400" strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-zinc-500">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Avatar({
  name,
  className = "h-8 w-8 text-[11px]",
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 font-semibold text-zinc-600 ${className}`}
    >
      {initials || "?"}
    </span>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-zinc-100/60 p-0.5 ${className}`}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-[6px] px-2.5 py-1 text-[12.5px] font-medium transition-all duration-150 ${
            value === opt.value
              ? "bg-white text-zinc-900 shadow-card"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ColorSwatch({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <label className="relative block h-9 w-9 cursor-pointer">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label ?? "Color"}
        className="absolute inset-0 h-full w-full"
      />
      <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono uppercase text-zinc-400">
        {value}
      </span>
    </label>
  );
}
