import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Link2,
  Plus,
  QrCode,
  ScanLine,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCount, getDailySeries } from "@/lib/stats";
import { compactNumber, relativeTime, countryName, flagEmoji } from "@/lib/format";
import { Sparkline, TrendChart } from "@/components/ui/charts";
import { Badge } from "@/components/ui/primitives";
import { CopyShortLink } from "@/components/ui/copy";
import { Button } from "@/components/ui/button";

export default async function OverviewPage() {
  const user = await requireUser();

  const [linkCount, qrCount, clicks30, scans30, clickSeries, scanSeries, recentLinks, recentEvents] =
    await Promise.all([
      db.link.count({ where: { userId: user.id, isQrTarget: false } }),
      db.qrCode.count({ where: { userId: user.id } }),
      getCount({ userId: user.id, kind: "CLICK" }, 30),
      getCount({ userId: user.id, kind: "SCAN" }, 30),
      getDailySeries({ userId: user.id, kind: "CLICK" }, 30),
      getDailySeries({ userId: user.id, kind: "SCAN" }, 30),
      db.link.findMany({
        where: { userId: user.id, isQrTarget: false },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { events: true } } },
      }),
      db.event.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { link: { select: { title: true, slug: true } } },
      }),
    ]);

  const totalAll = await db.event.count({ where: { userId: user.id } });

  const stats = [
    {
      label: "Links",
      value: compactNumber(linkCount),
      icon: Link2,
      spark: clickSeries.slice(-12).map((d) => d.count),
    },
    {
      label: "Clicks · 30d",
      value: compactNumber(clicks30),
      icon: ArrowUpRight,
      spark: clickSeries.slice(-12).map((d) => d.count),
    },
    {
      label: "QR codes",
      value: compactNumber(qrCount),
      icon: QrCode,
      spark: [2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 6],
    },
    {
      label: "Scans · 30d",
      value: compactNumber(scans30),
      icon: ScanLine,
      spark: scanSeries.slice(-12).map((d) => d.count),
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-zinc-950">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Here&apos;s how your links and codes are doing.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/dashboard/links?new=1">
            <Button variant="secondary" size="sm">
              <Plus className="h-3.5 w-3.5" /> New link
            </Button>
          </Link>
          <Link href="/dashboard/qr/new">
            <Button size="sm">
              <QrCode className="h-3.5 w-3.5" /> New QR
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-card transition-colors hover:border-zinc-300"
          >
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-zinc-500">{s.label}</p>
              <s.icon className="h-3.5 w-3.5 text-zinc-300" strokeWidth={2} />
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="text-[26px] font-semibold leading-none tabular tracking-tight text-zinc-950">
                {s.value}
              </p>
              <Sparkline data={s.spark} width={72} height={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-[14px] font-semibold text-zinc-900">Traffic</h2>
              <p className="text-xs text-zinc-400">Clicks and scans, last 30 days</p>
            </div>
            <Link
              href="/dashboard/analytics"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Full analytics <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-4">
            <TrendChart
              data={clickSeries.map((d) => ({ ...d }))}
              secondary={scanSeries.map((d) => ({ ...d }))}
              labels={["clicks", "scans"]}
              height={210}
            />
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
            <h2 className="text-[14px] font-semibold text-zinc-900">Recent links</h2>
            <Link
              href="/dashboard/links"
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-700"
            >
              View all
            </Link>
          </div>
          {recentLinks.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-[13px] text-zinc-500">No links yet.</p>
              <Link href="/dashboard/links?new=1" className="mt-1 inline-block text-[13px] font-medium text-accent hover:underline">
                Create your first one
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recentLinks.map((l) => (
                <li key={l.id} className="group flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/links/${l.id}`}
                      className="block truncate text-[13px] font-medium text-zinc-800 hover:text-accent"
                    >
                      {l.title || l.destination.replace(/^https?:\/\/(www\.)?/, "")}
                    </Link>
                    <p className="truncate font-mono text-xs text-zinc-400">
                      /{l.slug} · {compactNumber(l._count.events)} clicks
                    </p>
                  </div>
                  {!l.disabled && !(l.expiresAt && new Date(l.expiresAt) < new Date()) ? (
                    <Badge tone="green">Live</Badge>
                  ) : (
                    <Badge tone="neutral">{l.disabled ? "Off" : "Expired"}</Badge>
                  )}
                  <CopyShortLink
                    slug={l.slug}
                    className="text-zinc-300 opacity-0 transition-opacity hover:bg-zinc-100 hover:text-zinc-600 group-hover:opacity-100"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
          <h2 className="text-[14px] font-semibold text-zinc-900">Activity</h2>
          <span className="flex items-center gap-1.5 text-xs text-zinc-400">
            <BarChart3 className="h-3.5 w-3.5" />
            {totalAll.toLocaleString("en-US")} events all time
          </span>
        </div>
        {recentEvents.length === 0 ? (
          <p className="px-5 py-10 text-center text-[13px] text-zinc-500">
            Activity will appear here as people click your links.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {recentEvents.map((ev) => (
              <li key={ev.id} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                <span className="w-16 shrink-0 tabular text-xs text-zinc-400">
                  {relativeTime(ev.createdAt)}
                </span>
                <Badge tone={ev.kind === "SCAN" ? "accent" : "neutral"}>
                  {ev.kind === "SCAN" ? "QR scan" : "Click"}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-zinc-600">
                  {ev.link?.title || `/${ev.link?.slug ?? ""}`}
                </span>
                <span className="hidden shrink-0 items-center gap-1.5 text-xs text-zinc-400 sm:flex">
                  {flagEmoji(ev.country)}
                  {countryName(ev.country)}
                  <span aria-hidden>·</span>
                  {ev.browser ?? "Unknown"}
                  <span aria-hidden>·</span>
                  {ev.device ?? "Desktop"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";
