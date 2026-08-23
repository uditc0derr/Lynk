import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { updateQrSchema } from "@/lib/validators";

async function getOwnedQr(id: string) {
  const user = await getSessionUser();
  if (!user) return { error: 401 as const };
  const qr = await db.qrCode.findFirst({
    where: { id, userId: user.id },
    include: { link: true },
  });
  if (!qr) return { error: 404 as const };
  return { qr };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owned = await getOwnedQr(id);
  if ("error" in owned) return NextResponse.json({}, { status: owned.error });
  return NextResponse.json({ qr: owned.qr });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owned = await getOwnedQr(id);
  if ("error" in owned) {
    return NextResponse.json(
      { error: owned.error === 401 ? "Unauthorized" : "QR code not found" },
      { status: owned.error }
    );
  }
  const body = await req.json().catch(() => null);
  const parsed = updateQrSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const linkId = owned.qr.linkId;

  let linkUpdate: { destination: string; title?: string } | null = null;
  if (owned.qr.dynamic && linkId && data.destination != null) {
    linkUpdate = {
      destination: data.destination,
      title: data.name ?? undefined,
    };
  }

  const [qr] = await db.$transaction([
    db.qrCode.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.content !== undefined ? { content: data.content as object } : {}),
        ...(data.config !== undefined ? { config: data.config as object } : {}),
      },
    }),
    ...(linkUpdate
      ? [
          db.link.update({
            where: { id: linkId! },
            data: linkUpdate,
          }),
        ]
      : []),
  ]);

  return NextResponse.json({ ok: true, qr });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owned = await getOwnedQr(id);
  if ("error" in owned) {
    return NextResponse.json(
      { error: owned.error === 401 ? "Unauthorized" : "QR code not found" },
      { status: owned.error }
    );
  }
  await db.qrCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
