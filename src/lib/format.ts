const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_SHORT_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const TIME_FMT = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDate(date: Date | string) {
  return DATE_FMT.format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  const d = new Date(date);
  return `${DATE_FMT.format(d)}, ${TIME_FMT.format(d)} UTC`;
}

export function formatShortDate(date: Date | string) {
  return DATE_SHORT_FMT.format(new Date(date));
}

export function relativeTime(date: Date | string) {
  const then = new Date(date).getTime();
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 45) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

export function compactNumber(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

const COUNTRIES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  IN: "India",
  CA: "Canada",
  FR: "France",
  AU: "Australia",
  BR: "Brazil",
  JP: "Japan",
  NL: "Netherlands",
  ES: "Spain",
  SE: "Sweden",
  SG: "Singapore",
  MX: "Mexico",
  KR: "South Korea",
};

export function countryName(code?: string | null) {
  if (!code) return "Unknown";
  return COUNTRIES[code] ?? code;
}

export function flagEmoji(code?: string | null) {
  if (!code || !/^[A-Z]{2}$/.test(code)) return null;
  return String.fromCodePoint(
    ...code.split("").map((c) => 127397 + c.charCodeAt(0))
  );
}
