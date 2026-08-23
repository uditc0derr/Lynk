import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateSlug } from "@/lib/slug";
import { createLinkSchema } from "@/lib/validators";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const links = await db.link.findMany({
    where: { userId: user.id, isQrTarget: false },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { events: true } } },
  });
  return NextResponse.json({ links });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = createLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const data: Prisma.LinkUncheckedCreateInput = {
    slug: "",
    destination: parsed.data.destination,
    title: parsed.data.title ?? null,
    userId: user.id,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
  };

  for (let attempt = 0; attempt < 5; attempt++) {
    data.slug = parsed.data.slug ?? generateSlug(7);
    try {
      const link = await db.link.create({ data });
      return NextResponse.json({ ok: true, link });
    } catch (e) {
      const err = e as Prisma.PrismaClientKnownRequestError;
      if (err.code === "P2002") {
        if (parsed.data.slug) {
          return NextResponse.json(
            { error: "That alias is already taken. Try another." },
            { status: 409 }
          );
        }
        continue;
      }
      throw e;
    }
  }
  return NextResponse.json({ error: "Could not generate a unique code" }, { status: 500 });
}
