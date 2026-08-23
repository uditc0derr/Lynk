import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBreakdown, getCount, getDailySeries } from "@/lib/stats";
import { compactNumber } from "@/lib/format";
import { TrendChart, BarList } from "@/components/ui/charts";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const range = (RANGES as readonly number[]).includes(Number(sp.range))
    ? (Number(sp.range) as (typeof RANGES)[number])
    : 30;

  const [clicksTotal, scansTotal, clicksSeries, scansSeries, topLinks, devices, referrers, countries] =
    await Promise.all([
      getCount({ userId: user.id, kind: "CLICK" }, range),
      getCount({ userId: user.id, kind: "SCAN" }, range),
      getDailySeries({ userId: user.id, kind: "CLICK" }, range),
      getDailySeries({ userId: user.id, kind: "SCAN" }, range),
      db.link.findMany({
        where: { userId: user.id, isQrTarget: false },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { _count: { select: { events: true } } },
      }),
      getBreakdown({ userId: user.id }, "device", range),
      getBreakdown({ userId: user.id }, "referrer", range),
      getBreakdown({ userId: user.id }, "country", range, 6),
    ]);

  const total = clicksTotal + scansTotal;
  const avgPerDay = Math.round(total / range);
  const bestDay = [...clicksSeries].sort((a, b) => b.count - a.count)[0];
  const top = [...topLinks].sort((a, b) => b._count.events - a._count.events).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-950">Analytics</h1>
          <p className="mt-1 text-sm text-zinc-500">Clicks and scans across everything you share.</p>
        </div>
        <div />
      </div>

      <RangeTabs current={range} />

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          ["Total traffic", compactNumber(total)],
          ["Clicks", compactNumber(clicksTotal)],
          ["QR scans", compactNumber(scansTotal)],
          ["Daily average", compactNumber(avgPerDay)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-card">
            <dt className="text-[13px] font-medium text-zinc-500">{label}</dt>
            <dd className="mt-2 text-[26px] font-semibold leading-none tabular tracking-tight text-zinc-950">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-[14px] font-semibold text-zinc-900">Trend</h2>
            <p className="text-xs text-zinc-400">
              Last {range} days · best day{" "}
              <span className="tabular font-medium text-zinc-500">
                {bestDay ? `${bestDay.count} on ${bestDay.date}` : "—"}
              </span>
            </p>
          </div>
          <p className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded-full bg-accent" /> Clicks
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded-full bg-zinc-300" /> Scans
            </span>
          </p>
        </div>
        <div className="mt-4">
          <TrendChart
            data={clicksSeries}
            secondary={scansSeries}
            labels={["clicks", "scans"]}
            height={240}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-zinc-200 bg-white shadow-card">
          <h2 className="border-b border-zinc-100 px-5 py-3.5 text-[14px] font-semibold text-zinc-900">
            Top links
          </h2>
          {top.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-zinc-400">
              Create a link to see it here.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {top.map((l, i) => (
                <li key={l.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-5 shrink-0 font-mono text-xs text-zinc-300">{i + 1}</span>
                  <Link href={`/dashboard/links/${l.id}`} className="min-w-0 flex-1 truncate text-[13px] font-medium text-zinc-800 hover:text-accent">
                    {l.title || l.destination.replace(/^https?:\/\/(www\.)?/, "").slice(0, 48)}
                  </Link>
                  <span className="tabular text-[13px] font-semibold text-zinc-700">
                    {compactNumber(l._count.events)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
            <h3 className="mb-4 text-[13px] font-semibold text-zinc-900">Devices</h3>
            {devices.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-zinc-400">No data yet</p>
            ) : (
              <BarList items={devices} />
            )}
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
            <h3 className="mb-4 text-[13px] font-semibold text-zinc-900">Referrers</h3>
            {referrers.length === 0 ? (
              <p className="py-4 text-center text-[13px] text-zinc-400">No data yet</p>
            ) : (
              <BarList items={referrers} />
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-zinc-900">Regions</h3>
          <p className="flex items-center gap-1.5 text-[11.5px] text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Privacy-first · no cookies, no stored IPs
          </p>
        </div>
        {countries.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-zinc-400">No data yet</p>
        ) : (
          <div className="mt-4 max-w-md">
            <BarList items={countries} />
          </div>
        )}
      </section>
    </div>
  );
}

function RangeTabs({ current }: { current: number }) {
  return (
    <nav aria-label="Range" className="-mt-4 mb-1 flex gap-5 border-b border-zinc-200">
      {RANGES.map((r) => (
        <Link
          key={r}
          href={`/dashboard/analytics?range=${r}`}
          aria-current={current === r ? "page" : undefined}
          className={`-mb-px border-b-2 pb-2.5 text-[13px] font-medium transition-colors ${
            current === r
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-400 hover:text-zinc-700"
          }`}
        >
          Last {r} days
        </Link>
      ))}
    </nav>
  );
}
