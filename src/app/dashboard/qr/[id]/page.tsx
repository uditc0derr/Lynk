import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { QrTypeKey } from "@/lib/qr/payload";
import { QrEditor, type ExistingQr } from "@/components/qr-editor/editor";

export const metadata: Metadata = { title: "Edit QR code" };
export const dynamic = "force-dynamic";

export default async function EditQrPage({
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

  const existing: ExistingQr = {
    id: qr.id,
    name: qr.name,
    type: qr.type as QrTypeKey,
    content: (qr.content as Record<string, string>) ?? {},
    config: qr.config as never,
    dynamic: qr.dynamic,
    scanSlug: qr.link?.slug ?? null,
    destination: qr.link?.destination ?? null,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-950">
          Edit QR code
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Changes update the saved design instantly for everyone you share it with.
        </p>
      </div>
      <QrEditor existing={existing} />
    </div>
  );
}
