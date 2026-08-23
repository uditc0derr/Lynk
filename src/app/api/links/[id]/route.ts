import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { linkUpdateSchema } from "@/lib/validators";

async function getOwnedLink(id: string) {
  const user = await getSessionUser();
  if (!user) return { error: 401 as const };
  const link = await db.link.findFirst({
    where: { id, userId: user.id, isQrTarget: false },
  });
  if (!link) return { error: 404 as const };
  return { link };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owned = await getOwnedLink(id);
  if ("error" in owned) {
    return NextResponse.json(
      { error: owned.error === 401 ? "Unauthorized" : "Link not found" },
      { status: owned.error }
    );
  }
  const body = await req.json().catch(() => null);
  const parsed = linkUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data: Prisma.LinkUpdateInput = {};
  if (parsed.data.destination !== undefined) data.destination = parsed.data.destination;
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.disabled !== undefined) data.disabled = parsed.data.disabled;
  if (parsed.data.expiresAt !== undefined)
    data.expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
  if (parsed.data.slug !== undefined) data.slug = parsed.data.slug;

  try {
    const link = await db.link.update({ where: { id: id }, data });
    return NextResponse.json({ ok: true, link });
  } catch (e) {
    const err = e as Prisma.PrismaClientKnownRequestError;
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "That alias is already taken. Try another." },
        { status: 409 }
      );
    }
    throw e;
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const owned = await getOwnedLink(id);
  if ("error" in owned) {
    return NextResponse.json(
      { error: owned.error === 401 ? "Unauthorized" : "Link not found" },
      { status: owned.error }
    );
  }
  await db.link.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
