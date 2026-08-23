import { Prisma, type EventKind } from "@prisma/client";
import { db } from "./db";

export interface DailyPoint {
  date: string;
  count: number;
}

interface EventWhere {
  userId?: string;
  linkId?: string;
  kind?: EventKind;
}

function buildConditions(where: EventWhere, since: Date) {
  const conds = [Prisma.sql`"createdAt" >= ${since}`];
  if (where.userId) conds.push(Prisma.sql`"userId" = ${where.userId}`);
  if (where.linkId) conds.push(Prisma.sql`"linkId" = ${where.linkId}`);
  if (where.kind) conds.push(Prisma.sql`"kind" = ${where.kind}::"EventKind"`);
  return Prisma.join(conds, " AND ");
}

export function sinceDate(days: number) {
  const since = new Date(Date.now() - (days - 1) * 86400000);
  since.setUTCHours(0, 0, 0, 0);
  return since;
}

export async function getDailySeries(
  where: EventWhere,
  days: number
): Promise<DailyPoint[]> {
  const since = sinceDate(days);
  const rows = await db.$queryRaw<{ d: Date; count: number }[]>`
    SELECT date_trunc('day', "createdAt") AS d, COUNT(*)::int AS count
    FROM "Event"
    WHERE ${buildConditions(where, since)}
    GROUP BY 1 ORDER BY 1`;
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.d.toISOString().slice(0, 10), Number(row.count));
  }
  const out: DailyPoint[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * 86400000);
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: map.get(key) ?? 0 });
  }
  return out;
}

export async function getCount(where: EventWhere, days?: number) {
  return db.event.count({
    where: {
      ...(where.userId ? { userId: where.userId } : {}),
      ...(where.linkId ? { linkId: where.linkId } : {}),
      ...(where.kind ? { kind: where.kind } : {}),
      ...(days
        ? { createdAt: { gte: sinceDate(days) } }
        : {}),
    },
  });
}

type BreakdownField = "browser" | "os" | "device" | "referrer" | "country";

export async function getBreakdown(
  where: EventWhere,
  field: BreakdownField,
  days = 30,
  take = 6
): Promise<{ label: string; count: number }[]> {
  const since = sinceDate(days);
  const nullLabel = field === "referrer" ? "Direct" : "Unknown";
  const rows = await db.$queryRaw<{ label: string | null; count: number }[]>`
    SELECT ${Prisma.raw(`"${field}"`)} AS label, COUNT(*)::int AS count
    FROM "Event"
    WHERE ${buildConditions(where, since)}
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT ${take}`;
  return rows.map((r) => ({
    label: r.label ?? nullLabel,
    count: Number(r.count),
  }));
}
