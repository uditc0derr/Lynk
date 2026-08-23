import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  MousePointerClick,
  Pencil,
  ScanLine,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getBreakdown, getCount, getDailySeries } from "@/lib/stats";
import { compactNumber, countryName, flagEmoji } from "@/lib/format";
import { TrendChart, BarList } from "@/components/ui/charts";
import { Badge } from "@/components/ui/primitives";

export const metadata: Metadata = { title: "QR analytics" };
export const dynamic = "force-dynamic";

export default async function QrAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const qr = await db.qrCode.findFirst({
    where: { id, userId: user.id },
    include: { link: { select: { slug: true, destination: true } } },
  });
  if (!qr) notFound();

  if (!qr.dynamic || !qr.link) {
    return (
      <div className="space-y-6">
        <BackLink id={qr.id} />
        <section className="rounded-xl border border-zinc-200 bg-white p-10 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft">
            <ScanLine className="h-5 w-5 text-indigo-500" />
          </div>
          <h1 className="mt-4 text-[17px] font-semibold tracking-tight text-zinc-950">
            Static codes can&apos;t be tracked
          </h1>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-zinc-500">
            This code encodes its data directly in the pattern, so scans never pass
            through LYNK. Switch it to a dynamic code and every scan is counted —
            while the printed artwork stays exactly the same.
          </p>
          <Link
            href={`/dashboard/qr/${qr.id}`}
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-zinc-700"
          >
            <Pencil className="h-3.5 w-3.5" /> Open in editor to make it dynamic
          </Link>
        </section>
      </div>
    );
  }

  const where = { linkId: qr.linkId! };
  const [scansTotal, scans7, scans30, series, devices, browsers, oses, countries, recent] =
    await Promise.all([
      db.event.count({ where: { linkId: qr.linkId!, kind: "SCAN" } }),
      getCount(where as { linkId: string }, 7),
      getCount({ linkId: qr.linkId! }, 30),
      getDailySeries({ linkId: qr.linkId!, kind: "SCAN" }, 30),
      getBreakdown({ linkId: qr.linkId!, kind: "SCAN" }, "device"),
      getBreakdown({ linkId: qr.linkId!, kind: "SCAN" }, "browser"),
      getBreakdown({ linkId: qr.linkId!, kind: "SCAN" }, "os"),
      getBreakdown({ linkId: qr.linkId!, kind: "SCAN" }, "country", 30, 8),
      db.event.findMany({
        where: { linkId: qr.linkId!, kind: "SCAN" },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);

  const avgPerDay = Math.round(scans30 / 30);
  const bestDay = [...series].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/qr/${qr.id}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-700"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to “{qr.name}”
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="truncate text-[22px] font-semibold tracking-tight text-zinc-950">
              {qr.name}
            </h1>
            <Badge tone="accent">Dynamic</Badge>
          </div>
          <p className="mt-1 font-mono text-[12.5px] text-zinc-400">lynk.to/q/{qr.link.slug}</p>
        </div>
        <a
          href={qr.link.destination}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-xs items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[12.5px] text-zinc-600 shadow-card transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          <span className="truncate">{qr.link.destination.replace(/^https?:\/\//, "")}</span>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
        </a>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          ["Scans · all time", compactNumber(scansTotal)],
          ["Scans · 30 days", compactNumber(scans30)],
          ["Scans · 7 days", compactNumber(scans7)],
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
          <h2 className="text-[14px] font-semibold text-zinc-900">Scans over time</h2>
          <p className="text-xs text-zinc-400">
            Last 30 days · peak{" "}
            <span className="tabular font-medium text-zinc-500">
              {bestDay ? `${bestDay.count} on ${bestDay.date}` : "—"}
            </span>
          </p>
        </div>
        <div className="mt-4">
          <TrendChart data={series} height={220} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Devices", items: devices },
          { title: "Browsers", items: browsers },
          { title: "Operating systems", items: oses },
        ].map((b) => (
          <section key={b.title} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
            <h3 className="mb-4 text-[13px] font-semibold text-zinc-900">{b.title}</h3>
            {b.items.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-zinc-400">No data yet</p>
            ) : (
              <BarList items={b.items} />
            )}
          </section>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border border-zinc-200 bg-white shadow-card">
          <h3 className="border-b border-zinc-100 px-5 py-3.5 text-[13px] font-semibold text-zinc-900">
            Recent scans
          </h3>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-zinc-400">
              No scans yet — print it, place it, and watch this fill up.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recent.map((ev) => (
                <li key={ev.id} className="flex items-center gap-3 px-5 py-2.5 text-[13px]">
                  <span className="w-16 shrink-0 tabular text-xs text-zinc-400">
                    {new Date(ev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-zinc-600">{ev.os} · {ev.browser}</span>
                  <span className="hidden shrink-0 sm:block">
                    <Badge>{ev.device ?? "Unknown"}</Badge>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-zinc-400">
                    {flagEmoji(ev.country)} {countryName(ev.country)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
          <h3 className="text-[13px] font-semibold text-zinc-900">Regions</h3>
          {countries.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-zinc-400">No data yet</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {countries.slice(0, 6).map((c) => (
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
        </section>
      </div>

      <p className="flex items-center gap-1.5 text-[11.5px] text-zinc-400">
        <MousePointerClick className="h-3 w-3" />
        Clicks on the short URL are tracked separately on the underlying link.
      </p>
    </div>
  );
}

function BackLink({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/qr/${id}`}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-zinc-700"
    >
      <ArrowLeft className="h-3.5 w-3.5" /> Back to editor
    </Link>
  );
}
