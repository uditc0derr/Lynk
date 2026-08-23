import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { recordEvent } from "@/lib/events";
import { StatusScreen } from "@/components/public/status-screen";

export const dynamic = "force-dynamic";

const NOT_FOUND = (
  <StatusScreen
    code="404 · Code not found"
    title="This QR code doesn't exist"
    body="The code you scanned was never created, or has been deleted by its owner."
  />
);

export default async function ScanUrlPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const link = await db.link.findUnique({
    where: { slug },
    select: {
      id: true,
      userId: true,
      destination: true,
      disabled: true,
      expiresAt: true,
      qrCode: { select: { id: true } },
    },
  });

  if (!link || !link.qrCode) return NOT_FOUND;

  if (link.disabled) {
    return (
      <StatusScreen
        code="410 · Paused"
        title="This code is paused"
        body="The owner has temporarily paused this QR code's destination. It may come back soon."
      />
    );
  }
  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    return (
      <StatusScreen
        code="410 · Expired"
        title="This code has expired"
        body="This QR code's destination was set to expire automatically. It is no longer active."
      />
    );
  }

  const h = await headers();
  await recordEvent(h, link.id, link.userId, "SCAN");
  redirect(link.destination);
}
