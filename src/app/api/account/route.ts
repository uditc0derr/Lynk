import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { destroySession, getSessionUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validators";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const updated = await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });
  return NextResponse.json({
    ok: true,
    user: { id: updated.id, name: updated.name, email: updated.email },
  });
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.user.delete({ where: { id: user.id } });
  await destroySession();
  return NextResponse.json({ ok: true });
}
