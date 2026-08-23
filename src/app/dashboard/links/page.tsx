import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sinceDate } from "@/lib/stats";
import { LinksView, type LinkRow } from "@/components/dashboard/links-view";

export const metadata: Metadata = { title: "My Links" };
export const dynamic = "force-dynamic";

export default async function LinksPage() {
  const user = await requireUser();

  const [links, counts] = await Promise.all([
    db.link.findMany({
      where: { userId: user.id, isQrTarget: false },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { events: true } } },
    }),
    db.event.groupBy({
      by: ["linkId"],
      where: {
        userId: user.id,
        kind: "CLICK",
        createdAt: { gte: sinceDate(30) },
      },
      _count: { _all: true },
    }),
  ]);

  const c30 = new Map(counts.map((c) => [c.linkId, c._count._all]));

  const rows: LinkRow[] = links.map((l) => ({
    id: l.id,
    slug: l.slug,
    destination: l.destination,
    title: l.title,
    disabled: l.disabled,
    expiresAt: l.expiresAt ? l.expiresAt.toISOString() : null,
    createdAt: l.createdAt.toISOString(),
    clicks: l._count.events,
    clicks30: c30.get(l.id) ?? 0,
  }));

  return <LinksView initialLinks={rows} />;
}
