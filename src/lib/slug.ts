import crypto from "crypto";

export const RESERVED_SLUGS = new Set([
  "api",
  "dashboard",
  "login",
  "signup",
  "logout",
  "settings",
  "analytics",
  "links",
  "qr",
  "q",
  "new",
  "admin",
  "account",
  "_next",
  "static",
  "public",
  "assets",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "icon.svg",
]);

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateSlug(length = 7) {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function isValidCustomSlug(slug: string) {
  return (
    /^[a-zA-Z0-9_-]{3,30}$/.test(slug) && !RESERVED_SLUGS.has(slug.toLowerCase())
  );
}
