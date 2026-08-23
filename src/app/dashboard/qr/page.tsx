import { headers } from "next/headers";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildMatrix } from "@/lib/qr/matrix";
import { renderSVG } from "@/lib/qr/render";
import type { QRStyleConfig } from "@/lib/qr/types";
import { buildQrPayload, type QrTypeKey } from "@/lib/qr/payload";
import { QrCodesView, type QrRow } from "@/components/dashboard/qr-view";

export const metadata: Metadata = { title: "QR Codes" };
export const dynamic = "force-dynamic";

function thumb(text: string, config: QRStyleConfig): string | null {
  try {
    return renderSVG(buildMatrix(text.slice(0, 500), config.ecc), config, "t");
  } catch {
    return null;
  }
}

export default async function QrCodesPage() {
  const user = await requireUser();
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  const origin = `${proto}://${host}`;

  const [codes, scanRows] = await Promise.all([
    db.qrCode.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { link: { select: { slug: true } } },
    }),
    db.$queryRaw<{ linkId: string; count: number }[]>`
      SELECT e."linkId" AS "linkId", COUNT(*)::int AS count
      FROM "Event" e
      JOIN "QrCode" q ON q."linkId" = e."linkId"
      WHERE e."kind" = 'SCAN' AND q."userId" = ${user.id}
      GROUP BY 1`,
  ]);

  const scansByLinkId = new Map(scanRows.map((r) => [r.linkId, Number(r.count)]));

  const rows: QrRow[] = codes.map((c) => {
    const config = c.config as unknown as QRStyleConfig;
    let text: string;
    if (c.dynamic && c.link?.slug) {
      text = `${origin}/q/${c.link.slug}`;
    } else {
      text = buildQrPayload(
        c.type as QrTypeKey,
        (c.content as Record<string, string>) ?? {}
      );
    }
    return {
      id: c.id,
      name: c.name,
      type: c.type as QrTypeKey,
      dynamic: c.dynamic,
      scanSlug: c.link?.slug ?? null,
      thumbSvg: text ? thumb(text, config) : null,
      scans: scansByLinkId.get(c.linkId ?? "") ?? 0,
      updatedAt: c.updatedAt.toISOString(),
    };
  });

  return <QrCodesView initial={rows} />;
}
