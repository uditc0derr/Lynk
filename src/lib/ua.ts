import { UAParser } from "ua-parser-js";

export interface UAInfo {
  browser: string;
  os: string;
  device: string;
}

const BOT_RE = /bot|crawl|spider|slurp|preview|embed|fetcher|monitor|headless/i;

export function isBot(ua?: string | null) {
  if (!ua) return true;
  return BOT_RE.test(ua);
}

export function parseUA(ua?: string | null): UAInfo {
  if (!ua) return { browser: "Unknown", os: "Unknown", device: "Desktop" };
  const r = new UAParser(ua).getResult();
  const browser = r.browser.name ?? "Unknown";
  const os =
    r.os.name === "Mac OS" ? "macOS" : (r.os.name ?? "Unknown");
  let device = "Desktop";
  if (r.device.type === "mobile") device = "Mobile";
  else if (r.device.type === "tablet") device = "Tablet";
  return { browser, os, device };
}
