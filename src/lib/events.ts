import { db } from "./db";
import { isBot, parseUA } from "./ua";
import type { EventKind } from "@prisma/client";

function countryFromHeaders(headers: Headers): string | null {
  const direct =
    headers.get("cf-ipcountry") ??
    headers.get("x-vercel-ip-country") ??
    headers.get("x-geo-country") ??
    headers.get("x-country-code");
  if (direct && /^[A-Za-z]{2}$/.test(direct)) return direct.toUpperCase();

  // No CDN geo (e.g. localhost): fall back to the browser's locale,
  // e.g. "en-IN,en;q=0.9" -> "IN"
  const lang = headers.get("accept-language");
  const match = lang ? /^\s*([A-Za-z]{2,3})(?:-([A-Za-z]{2}))?/.exec(lang) : null;
  if (match?.[2]) return match[2].toUpperCase();
  return null;
}

export async function recordEvent(
  headers: Headers,
  linkId: string,
  userId: string | null,
  kind: EventKind
) {
  const ua = headers.get("user-agent");
  if (isBot(ua)) return;
  const { browser, os, device } = parseUA(ua);
  const referer = headers.get("referer");
  let referrer: string | null = null;
  if (referer) {
    try {
      referrer = new URL(referer).hostname.replace(/^www\./, "");
    } catch {
      referrer = null;
    }
  }
  await db.event.create({
    data: {
      linkId,
      userId,
      kind,
      browser,
      os,
      device,
      referrer,
      country: countryFromHeaders(headers),
    },
    select: { id: true },
  });
}
