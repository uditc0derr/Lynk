import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { generateSlug, isValidCustomSlug } from "@/lib/slug";
import { shortenSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = shortenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid URL" },
      { status: 400 }
    );
  }
  const { destination, customSlug } = parsed.data;
  if (customSlug && !isValidCustomSlug(customSlug)) {
    return NextResponse.json({ error: "That alias is not available" }, { status: 409 });
  }

  const user = await getSessionUser();

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = customSlug || generateSlug(7);
    try {
      const link = await db.link.create({
        data: {
          slug,
          destination,
          userId: user?.id ?? null,
        },
      });
      return NextResponse.json({
        ok: true,
        link: { id: link.id, slug: link.slug, destination: link.destination },
        authed: !!user,
      });
    } catch (e) {
      const err = e as Prisma.PrismaClientKnownRequestError;
      if (err.code === "P2002") {
        if (customSlug) {
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
