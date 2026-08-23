import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createQrSchema } from "@/lib/validators";
import { buildQrPayload, type QrTypeKey } from "@/lib/qr/payload";
import { generateSlug } from "@/lib/slug";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const codes = await db.qrCode.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { link: { select: { slug: true } } },
  });
  return NextResponse.json({
    qrCodes: codes.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      content: c.content,
      config: c.config,
      dynamic: c.dynamic,
      scanSlug: c.link?.slug ?? null,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createQrSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { name, type, content, config, dynamic } = parsed.data;
  if (dynamic && type !== "URL") {
    return NextResponse.json(
      { error: "Only link QR codes can be dynamic" },
      { status: 400 }
    );
  }

  let linkId: string | undefined;
  let slug: string | undefined;
  if (dynamic) {
    const payloadUrl = buildQrPayload(type as QrTypeKey, content);
    const destination =
      parsed.data.destination ??
      (/^https?:\/\//.test(payloadUrl) ? payloadUrl : "");
    if (!/^https?:\/\//.test(destination)) {
      return NextResponse.json(
        { error: "Dynamic QR codes need a valid https:// destination" },
        { status: 400 }
      );
    }
    const link = await db.link.create({
      data: {
        slug: generateSlug(7),
        destination,
        userId: user.id,
        isQrTarget: true,
        title: name,
      },
    });
    linkId = link.id;
    slug = link.slug;
  }

  const qr = await db.qrCode.create({
    data: {
      userId: user.id,
      name,
      type,
      content: content as object,
      config: config as object,
      dynamic,
      linkId,
    },
  });
  return NextResponse.json({ ok: true, qr, scanSlug: slug ?? null });
}
