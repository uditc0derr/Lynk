import { PrismaClient, Prisma, type EventKind } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  BROWSERS,
  COUNTRIES,
  DEVICES,
  DESKTOP_OSES,
  LINK_SPECS,
  QR_SPECS,
  REFERRERS,
  type LinkSpec,
  type QrSpec,
} from "./seed-data";

const prisma = new PrismaClient();

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260823);

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

type Dist = readonly (readonly [string | null, number])[];

function weighted(dist: Dist): string | null {
  const total = dist.reduce((a, [, w]) => a + w, 0);
  let r = rand() * total;
  for (const [value, weight] of dist) {
    r -= weight;
    if (r <= 0) return value ?? null;
  }
  return dist[dist.length - 1]![0] ?? null;
}

const dist = (pairs: readonly (readonly [string, number])[]): Dist => pairs;

interface EventRow {
  linkId: string;
  userId: string;
  kind: EventKind;
  browser: string | null;
  os: string | null;
  device: string | null;
  referrer: string | null;
  country: string | null;
  createdAt: Date;
}

function daysAgoAt(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(daysBack));
  d.setHours(9 + Math.floor(rand() * 10), Math.floor(rand() * 60), 0, 0);
  return d;
}

function dayStart(daysBack: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setHours(0, 0, 0, 0);
  return d;
}

function clickRow(linkId: string, userId: string, day: Date): EventRow {
  const device = weighted(dist(DEVICES));
  let os: string | null;
  if (device === "Mobile") os = rand() < 0.62 ? "iOS" : "Android";
  else if (device === "Tablet") os = rand() < 0.85 ? "iOS" : "Android";
  else os = weighted(dist(DESKTOP_OSES));

  const browser =
    os === "iOS"
      ? rand() < 0.55
        ? "Safari"
        : pick(BROWSERS.map((b) => b[0]).filter((b) => b !== "Safari"))
      : weighted(dist(BROWSERS));

  const createdAt = new Date(day);
  createdAt.setHours(7 + Math.floor(rand() * 16), Math.floor(rand() * 60), Math.floor(rand() * 60), 0);

  return {
    linkId,
    userId,
    kind: "CLICK",
    browser,
    os,
    device,
    referrer: weighted(REFERRERS),
    country: weighted(COUNTRIES),
    createdAt,
  };
}

function scanRow(linkId: string, userId: string, day: Date): EventRow {
  const os = rand() < 0.68 ? "iOS" : rand() < 0.9 ? "Android" : pick(["macOS", "Windows"]);
  const browser = os === "iOS" || os === "macOS" ? "Safari" : "Chrome";
  const createdAt = new Date(day);
  createdAt.setHours(8 + Math.floor(rand() * 15), Math.floor(rand() * 60), Math.floor(rand() * 60), 0);
  return {
    linkId,
    userId,
    kind: "SCAN",
    browser,
    os,
    device: rand() < 0.93 ? "Mobile" : "Tablet",
    referrer: null,
    country: weighted(COUNTRIES),
    createdAt,
  };
}

const DAYS = 30;

async function seedClicks(
  linkId: string,
  userId: string,
  spec: LinkSpec
): Promise<number> {
  const rows: EventRow[] = [];
  for (let d = DAYS - 1; d >= 0; d -= 1) {
    if (d > spec.ageDays) continue;
    const day = dayStart(d);
    const dow = day.getDay();
    const weekendDip = dow === 0 || dow === 6 ? 0.55 : 1;
    const ramp = Math.min(1.25, 0.55 + ((spec.ageDays - d) / Math.max(spec.ageDays, 1)) * 0.7);
    const noise = 0.75 + rand() * 0.5;
    const count = Math.round((spec.popularity ?? 5) * weekendDip * ramp * noise);
    for (let i = 0; i < count; i += 1) rows.push(clickRow(linkId, userId, day));
  }
  await prisma.event.createMany({ data: rows });
  return rows.length;
}

async function seedScans(
  linkId: string,
  userId: string,
  spec: QrSpec
): Promise<number> {
  const rows: EventRow[] = [];
  const popularity = spec.scanPopularity ?? 0;
  if (!popularity) return 0;
  for (let d = DAYS - 1; d >= 0; d -= 1) {
    if (d > spec.ageDays) continue;
    const day = dayStart(d);
    const dow = day.getDay();
    const weekendBoost = dow === 5 || dow === 6 ? 1.35 : 1;
    const noise = 0.7 + rand() * 0.6;
    const count = Math.round(popularity * weekendBoost * noise);
    for (let i = 0; i < count; i += 1) rows.push(scanRow(linkId, userId, day));
  }
  await prisma.event.createMany({ data: rows });
  return rows.length;
}

async function main() {
  console.log("Seeding LYNK demo data…");

  const email = "demo@lynk.to";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.delete({ where: { id: existing.id } });
    console.log("Removed previous demo user.");
  }

  const passwordHash = await bcrypt.hash("lynkdemo", 10);
  const user = await prisma.user.create({
    data: { email, name: "Udit Pandey", passwordHash },
  });
  console.log(`Created user ${email}`);

  let clicks = 0;
  for (const spec of LINK_SPECS) {
    const link = await prisma.link.create({
      data: {
        slug: spec.slug,
        destination: spec.destination,
        title: spec.title,
        userId: user.id,
        disabled: spec.disabled ?? false,
        expiresAt:
          spec.expiresDaysAgo != null ? daysAgoAt(spec.expiresDaysAgo) : null,
        createdAt: daysAgoAt(spec.ageDays),
      },
    });
    const n = await seedClicks(link.id, user.id, spec);
    clicks += n;
    console.log(`  /${spec.slug}: ${n} clicks`);
  }

  let scans = 0;
  for (const spec of QR_SPECS) {
    let qrLinkId: string | null = null;
    if (spec.dynamic && spec.dynamicSlug && spec.dynamicDestination) {
      const link = await prisma.link.create({
        data: {
          slug: spec.dynamicSlug,
          destination: spec.dynamicDestination,
          title: spec.name,
          userId: user.id,
          isQrTarget: true,
          createdAt: daysAgoAt(spec.ageDays),
        },
      });
      qrLinkId = link.id;
    }
    await prisma.qrCode.create({
      data: {
        userId: user.id,
        name: spec.name,
        type: spec.type,
        content: spec.content as Prisma.InputJsonValue,
        config: spec.config as Prisma.InputJsonValue,
        dynamic: Boolean(spec.dynamic),
        linkId: qrLinkId,
        createdAt: daysAgoAt(spec.ageDays),
      },
    });
    if (qrLinkId) {
      const n = await seedScans(qrLinkId, user.id, spec);
      scans += n;
      console.log(`  ${spec.name}: ${n} scans`);
    } else {
      console.log(`  ${spec.name}: static`);
    }
  }

  console.log(`Done — ${LINK_SPECS.length} links (${clicks} clicks), ${QR_SPECS.length} QR codes (${scans} scans).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
