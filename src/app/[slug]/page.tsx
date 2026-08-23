import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { recordEvent } from "@/lib/events";
import { RESERVED_SLUGS } from "@/lib/slug";
import { StatusScreen } from "@/components/public/status-screen";

export const dynamic = "force-dynamic";

export default async function ShortUrlPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (RESERVED_SLUGS.has(slug.toLowerCase())) redirect("/");

  const link = await db.link.findUnique({
    where: { slug },
    select: {
      id: true,
      userId: true,
      destination: true,
      disabled: true,
      expiresAt: true,
      isQrTarget: true,
    },
  });

  if (!link || link.isQrTarget) {
    return (
      <StatusScreen
        code="404 · Link not found"
        title="This link doesn't exist"
        body="The short link you followed was never created, or has been deleted by its owner."
      />
    );
  }
  if (link.disabled) {
    return (
      <StatusScreen
        code="410 · Paused"
        title="This link is paused"
        body="The owner has temporarily disabled this short link. It may come back soon."
      />
    );
  }
  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    return (
      <StatusScreen
        code="410 · Expired"
        title="This link has expired"
        body="This short link was set to expire automatically. It is no longer active."
      />
    );
  }

  const h = await headers();
  await recordEvent(h, link.id, link.userId, "CLICK");
  redirect(link.destination);
}
