import { Link2, MoreHorizontal } from "lucide-react";
import { Sparkline, TrendChart } from "@/components/ui/charts";
import { Badge } from "@/components/ui/primitives";

const ROWS = [
  {
    title: "Summer launch — landing page",
    slug: "launch24",
    clicks: 12840,
    trend: [4, 6, 5, 8, 9, 7, 11, 10, 14, 12, 16, 15],
    status: "Active" as const,
  },
  {
    title: "Restaurant menu (PDF)",
    slug: "menu",
    clicks: 8421,
    trend: [8, 9, 12, 10, 13, 15, 12, 14, 17, 16, 18, 20],
    status: "Active" as const,
  },
  {
    title: "Conference talk — slides",
    slug: "slides",
    clicks: 3192,
    trend: [2, 3, 2, 4, 3, 5, 4, 6, 5, 4, 6, 5],
    status: "Expires in 6d" as const,
  },
  {
    title: "Old pricing page",
    slug: "pricing-v1",
    clicks: 0,
    trend: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    status: "Disabled" as const,
  },
];

export function LinksTablePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_20px_60px_-28px_rgba(9,9,11,0.2)]">
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
        <p className="text-[13px] font-semibold text-zinc-900">My links</p>
        <span className="text-xs text-zinc-400">Last 30 days</span>
      </div>
      <table className="w-full text-left">
        <tbody className="divide-y divide-zinc-100">
          {ROWS.map((row) => (
            <tr key={row.slug} className="group transition-colors hover:bg-zinc-50/70">
              <td className="max-w-0 px-5 py-3.5">
                <p className="truncate text-[13.5px] font-medium text-zinc-900">{row.title}</p>
                <p className="mt-0.5 flex items-center gap-1 font-mono text-xs text-zinc-400">
                  <Link2 className="h-3 w-3 shrink-0" />
                  lynk.to/{row.slug}
                </p>
              </td>
              <td className="hidden w-32 py-3.5 pr-5 md:table-cell">
                <Sparkline
                  data={row.trend}
                  color={row.status === "Disabled" ? "#d4d4d8" : "#18181b"}
                />
              </td>
              <td className="w-24 py-3.5 pr-5 text-right tabular text-[13.5px] font-semibold text-zinc-900">
                {row.clicks.toLocaleString("en-US")}
              </td>
              <td className="hidden w-36 py-3.5 pr-5 sm:table-cell">
                <Badge
                  tone={
                    row.status === "Active"
                      ? "green"
                      : row.status === "Disabled"
                        ? "neutral"
                        : "amber"
                  }
                >
                  {row.status}
                </Badge>
              </td>
              <td className="w-10 py-3.5 pr-4 text-right">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AnalyticsBrowserPreview() {
  const bars = [
    { label: "Chrome", pct: 46 },
    { label: "Safari", pct: 27 },
    { label: "Edge", pct: 12 },
    { label: "Firefox", pct: 9 },
  ];
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-card">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-semibold text-zinc-900">Clicks by browser</p>
        <span className="text-xs text-zinc-400">30 days</span>
      </div>
      <ul className="mt-4 space-y-3">
        {bars.map((b) => (
          <li key={b.label}>
            <div className="mb-1 flex justify-between text-[13px]">
              <span className="font-medium text-zinc-700">{b.label}</span>
              <span className="tabular text-zinc-400">{b.pct}%</span>
            </div>
            <div className="h-[5px] overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-accent/80"
                style={{ width: `${b.pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <a
        href="#cta"
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-accent transition-colors hover:text-indigo-700"
      >
        See it on your own data
        <ArrowUpRightMini />
      </a>
    </div>
  );
}

function ArrowUpRightMini() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SERIES = [
  { date: "2026-07-25", count: 182 },
  { date: "2026-07-26", count: 214 },
  { date: "2026-07-27", count: 198 },
  { date: "2026-07-28", count: 246 },
  { date: "2026-07-29", count: 262 },
  { date: "2026-07-30", count: 240 },
  { date: "2026-07-31", count: 205 },
  { date: "2026-08-01", count: 158 },
  { date: "2026-08-02", count: 149 },
  { date: "2026-08-03", count: 231 },
  { date: "2026-08-04", count: 278 },
  { date: "2026-08-05", count: 294 },
  { date: "2026-08-06", count: 311 },
  { date: "2026-08-07", count: 287 },
];

export function AnalyticsChartPreview() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_20px_60px_-28px_rgba(9,9,11,0.2)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-zinc-900">Clicks · last 14 days</p>
          <p className="mt-1.5 text-3xl font-semibold tabular tracking-tight text-zinc-950">
            3,255
          </p>
        </div>
        <div className="flex gap-6 text-right">
          {[
            ["Today", "311"],
            ["Best day", "311"],
            ["Avg / day", "232"],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[11px] uppercase tracking-wide text-zinc-400">{label}</p>
              <p className="mt-0.5 text-[15px] font-semibold tabular text-zinc-800">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <TrendChart data={SERIES} height={180} />
      </div>
    </div>
  );
}
