import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarClock, ScanLine } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBreakdown, getCount, getDailySeries } from "@/lib/stats";
import {
  compactNumber,
  countryName,
  flagEmoji,
  formatDateTime,
  relativeTime,
} from "@/lib/format";
import { TrendChart, BarList } from "@/components/ui/charts";
import { Badge } from "@/components/ui/primitives";
import { ShortUrlField } from "@/components/ui/copy";

export const metadata: Metadata = { title: "Link details" };
export const dynamic = "force-dynamic";

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const link = await db.link.findFirst({
    where: { id, userId: user.id },
    include: { qrCode: true },
  });
  if (!link || link.isQrTarget) notFound();

  const where = { linkId: id };
  const [clicksTotal, clicks7, clicks30, scansTotal, series, devices, browsers, referrers, countries, recent] =
    await Promise.all([
      db.event.count({ where: { linkId: id, kind: "CLICK" } }),
      getCount(where as { linkId: string }, 7),
      getCount({ linkId: id }, 30),
      db.event.count({ where: { linkId: id, kind: "SCAN" } }),
      getDailySeries({ linkId: id }, 30),
      getBreakdown({ linkId: id }, "device"),
      getBreakdown({ linkId: id }, "browser"),
      getBreakdown({ linkId: id }, "referrer"),
      getBreakdown({ linkId: id }, "country", 30, 8),
      db.event.findMany({
        where: { linkId: id },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);

  const expired = link.expiresAt && link.expiresAt < new Date();
  const statusTone = link.disabled ? "neutral" : expired ? "amber" : "green";
  const statusLabel = link.disabled ? "Disabled" : expired ? "Expired" : "Active";

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/links"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All links
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-[22px] font-semibold tracking-tight text-zinc-950">
              {link.title || link.destination.replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)}
            </h1>
            <Badge tone={statusTone}>{statusLabel}</Badge>
          </div>
          <p className="mt-1 truncate text-[13px] text-zinc-500">{link.destination}</p>
        </div>
        <div className="w-full max-w-sm">
          <ShortUrlField slug={link.slug} />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          ["Clicks · all time", compactNumber(clicksTotal)],
          ["Clicks · 30 days", compactNumber(clicks30)],
          ["Clicks · 7 days", compactNumber(clicks7)],
          ["QR scans", compactNumber(scansTotal)],
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
        <h2 className="text-[14px] font-semibold text-zinc-900">Clicks over time</h2>
        <p className="text-xs text-zinc-400">Last 30 days</p>
        <div className="mt-4">
          <TrendChart data={series} height={220} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Devices", items: devices },
          { title: "Browsers", items: browsers },
          { title: "Referrers", items: referrers },
        ].map((b) => (
          <section key={b.title} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
            <h3 className="mb-4 text-[13px] font-semibold text-zinc-900">{b.title}</h3>
            {b.items.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-zinc-400">No data yet</p>
            ) : (
              <BarList
                items={b.items.map((i) => ({
                  ...i,
                  extra:
                    b.title === "Referrers" && i.label !== "Direct" ? (
                      <span aria-hidden className="text-zinc-300">↗</span>
                    ) : undefined,
                }))}
              />
            )}
          </section>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border border-zinc-200 bg-white shadow-card">
          <h3 className="border-b border-zinc-100 px-5 py-3.5 text-[13px] font-semibold text-zinc-900">
            Recent activity
          </h3>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-zinc-400">
              No traffic recorded yet — share the link to start collecting.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recent.map((ev) => (
                <li key={ev.id} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                  <span className="w-16 shrink-0 tabular text-xs text-zinc-400">
                    {relativeTime(ev.createdAt)}
                  </span>
                  <Badge tone={ev.kind === "SCAN" ? "accent" : "neutral"}>
                    {ev.kind === "SCAN" ? "Scan" : "Click"}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-zinc-600">{ev.referrer ?? "Direct"}</span>
                  <span className="hidden shrink-0 text-xs text-zinc-400 sm:block">
                    {ev.browser} · {ev.os}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-zinc-400">
                    {flagEmoji(ev.country)} {countryName(ev.country)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
            <h3 className="text-[13px] font-semibold text-zinc-900">Regions</h3>
            {countries.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-zinc-400">No data yet</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {countries.slice(0, 5).map((c) => (
                  <li key={c.label} className="flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 text-zinc-600">
                      {flagEmoji(c.label) && <span aria-hidden>{flagEmoji(c.label)}</span>}
                      {countryName(c.label)}
                    </span>
                    <span className="tabular text-zinc-400">{compactNumber(c.count)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 border-t border-zinc-100 pt-3 text-[11.5px] leading-relaxed text-zinc-400">
              Regions are approximated from coarse signals. LYNK never stores IP addresses or
              identifiers.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
            <h3 className="text-[13px] font-semibold text-zinc-900">Details</h3>
            <dl className="mt-3 space-y-2 text-[13px]">
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-zinc-400">Created</dt>
                <dd className="truncate text-zinc-600">{formatDateTime(link.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="flex shrink-0 items-center gap-1 text-zinc-400">
                  <CalendarClock className="h-3 w-3" /> Expires
                </dt>
                <dd className="truncate text-zinc-600">
                  {link.expiresAt ? formatDateTime(link.expiresAt) : "Never"}
                </dd>
              </div>
              {link.qrCode && (
                <div className="flex justify-between gap-3">
                  <dt className="flex shrink-0 items-center gap-1 text-zinc-400">
                    <ScanLine className="h-3 w-3" /> Used by QR
                  </dt>
                  <dd className="truncate">
                    <Link href={`/dashboard/qr/${link.qrCode.id}`} className="font-medium text-accent hover:underline">
                      {link.qrCode.name}
                    </Link>
                  </dd>
                </div>
              )}
            </dl>
            <a
              href={link.destination}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:text-indigo-700"
            >
              Open destination <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
