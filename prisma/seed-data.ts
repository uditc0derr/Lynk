export const DEVICES = [
  ["Desktop", 58],
  ["Mobile", 36],
  ["Tablet", 6],
] as const;

export const BROWSERS = [
  ["Chrome", 54],
  ["Safari", 22],
  ["Edge", 11],
  ["Firefox", 8],
  ["Other", 5],
] as const;

export const OSES = [
  ["macOS", 34],
  ["Windows", 28],
  ["iOS", 18],
  ["Android", 14],
  ["Linux", 6],
] as const;

export const DESKTOP_OSES = [
  ["macOS", 44],
  ["Windows", 42],
  ["Linux", 14],
] as const;

export const REFERRERS = [
  [null, 46],
  ["x.com", 14],
  ["news.ycombinator.com", 12],
  ["github.com", 10],
  ["linkedin.com", 8],
  ["reddit.com", 6],
  ["producthunt.com", 4],
] as const;

export const COUNTRIES = [
  ["US", 38],
  ["IN", 16],
  ["GB", 9],
  ["DE", 7],
  ["CA", 6],
  ["FR", 5],
  ["AU", 5],
  ["JP", 4],
  ["BR", 4],
  ["NL", 3],
  ["SG", 3],
] as const;

export interface LinkSpec {
  slug: string;
  title: string;
  destination: string;
  ageDays: number;
  popularity: number;
  disabled?: boolean;
  expiresDaysAgo?: number;
}

export const LINK_SPECS: LinkSpec[] = [
  {
    slug: "launch",
    title: "LYNK v2 launch post",
    destination: "https://news.ycombinator.com/item?id=42118477",
    ageDays: 26,
    popularity: 42,
  },
  {
    slug: "gh",
    title: "GitHub repo",
    destination: "https://github.com/vercel/next.js",
    ageDays: 24,
    popularity: 31,
  },
  {
    slug: "demo-deck",
    title: "Investor demo deck (PDF)",
    destination: "https://example.com/decks/lynk-series-a.pdf",
    ageDays: 21,
    popularity: 12,
  },
  {
    slug: "spring-sale",
    title: "Spring sale landing page",
    destination: "https://shop.example.com/spring",
    ageDays: 19,
    popularity: 24,
    expiresDaysAgo: 4,
  },
  {
    slug: "podcast",
    title: "Podcast episode 47",
    destination: "https://podcasts.example.com/ep47",
    ageDays: 17,
    popularity: 9,
  },
  {
    slug: "docs-api",
    title: "API documentation",
    destination: "https://docs.example.com/api/v2",
    ageDays: 15,
    popularity: 27,
  },
  {
    slug: "waitlist",
    title: "Beta waitlist form",
    destination: "https://forms.example.com/lynk-beta",
    ageDays: 12,
    popularity: 18,
  },
  {
    slug: "menu",
    title: "Cafe seasonal menu",
    destination: "https://cafe.example.com/menu-autumn",
    ageDays: 10,
    popularity: 7,
  },
  {
    slug: "webinar-2026",
    title: "Webinar registration",
    destination: "https://events.example.com/webinar/qr-at-scale",
    ageDays: 8,
    popularity: 15,
  },
  {
    slug: "old-blog",
    title: "Legacy blog redirect",
    destination: "https://blog.example.com/hello-world",
    ageDays: 45,
    popularity: 2,
    disabled: true,
  },
  {
    slug: "careers",
    title: "Careers page",
    destination: "https://jobs.example.com/engineering",
    ageDays: 6,
    popularity: 6,
  },
  {
    slug: "changelog-aug",
    title: "August changelog",
    destination: "https://lynk.dev/changelog/august",
    ageDays: 3,
    popularity: 21,
  },
];

export type QrSpecType =
  | "URL"
  | "TEXT"
  | "EMAIL"
  | "PHONE"
  | "SMS"
  | "WIFI"
  | "VCARD"
  | "LOCATION";

export interface QrSpec {
  name: string;
  type: QrSpecType;
  content: Record<string, string>;
  dynamic?: boolean;
  dynamicSlug?: string;
  dynamicDestination?: string;
  config: Record<string, unknown>;
  ageDays: number;
  scanPopularity?: number;
}

const logoOff = {
  enabled: false,
  src: "",
  size: 22,
  padding: 4,
  shape: "square",
  bgColor: "#ffffff",
};

export const QR_SPECS: QrSpec[] = [
  {
    name: "Launch site — posters",
    type: "URL",
    content: {},
    dynamic: true,
    dynamicSlug: "scan-launch",
    dynamicDestination: "https://lynk.dev/launch",
    config: {
      dotStyle: "dots",
      frameStyle: "extra-rounded",
      ballStyle: "dots",
      dotFill: {
        type: "linear",
        rotation: 45,
        stops: [
          { offset: 0, color: "#4f46e5" },
          { offset: 1, color: "#7c3aed" },
        ],
      },
      cornerFill: { type: "solid", color: "#4f46e5" },
      background: { transparent: false, color: "#ffffff" },
      margin: 2,
      ecc: "Q",
      logo: logoOff,
    },
    ageDays: 24,
    scanPopularity: 14,
  },
  {
    name: "Cafe menu — table tents",
    type: "URL",
    content: {},
    dynamic: true,
    dynamicSlug: "scan-menu",
    dynamicDestination: "https://cafe.example.com/menu-autumn",
    config: {
      dotStyle: "classy-rounded",
      frameStyle: "leaf",
      ballStyle: "rounded",
      dotFill: {
        type: "linear",
        rotation: 45,
        stops: [
          { offset: 0, color: "#18181b" },
          { offset: 1, color: "#44403c" },
        ],
      },
      cornerFill: { type: "solid", color: "#18181b" },
      background: { transparent: false, color: "#fafaf9" },
      margin: 3,
      ecc: "H",
      logo: logoOff,
    },
    ageDays: 18,
    scanPopularity: 22,
  },
  {
    name: "Webinar badge QR",
    type: "URL",
    content: {},
    dynamic: true,
    dynamicSlug: "scan-webinar",
    dynamicDestination: "https://events.example.com/webinar/qr-at-scale",
    config: {
      dotStyle: "extra-rounded",
      frameStyle: "dots",
      ballStyle: "square",
      dotFill: { type: "solid", color: "#0f172a" },
      cornerFill: { type: "solid", color: "#0f172a" },
      background: { transparent: false, color: "#ffffff" },
      margin: 2,
      ecc: "Q",
      logo: logoOff,
    },
    ageDays: 8,
    scanPopularity: 9,
  },
  {
    name: "Guest Wi-Fi card",
    type: "WIFI",
    content: { ssid: "CafeLynk_Guest", password: "flatwhite2026", encryption: "WPA" },
    config: {
      dotStyle: "rounded",
      frameStyle: "rounded",
      ballStyle: "rounded",
      dotFill: { type: "solid", color: "#065f46" },
      cornerFill: { type: "solid", color: "#065f46" },
      background: { transparent: false, color: "#ecfdf5" },
      margin: 3,
      ecc: "M",
      logo: logoOff,
    },
    ageDays: 30,
  },
  {
    name: "Support contact card",
    type: "VCARD",
    content: {
      firstName: "Udit",
      lastName: "Pandey",
      org: "LYNK",
      title: "Founder",
      email: "udit@lynk.to",
      phone: "+91 90000 00000",
      url: "https://lynk.to/careers",
    },
    config: {
      dotStyle: "diamond",
      frameStyle: "square",
      ballStyle: "diamond",
      dotFill: {
        type: "linear",
        rotation: 90,
        stops: [
          { offset: 0, color: "#b45309" },
          { offset: 1, color: "#f59e0b" },
        ],
      },
      cornerFill: { type: "solid", color: "#b45309" },
      background: { transparent: false, color: "#fffbeb" },
      margin: 2,
      ecc: "Q",
      logo: logoOff,
    },
    ageDays: 12,
  },
  {
    name: "Packaging feedback SMS",
    type: "SMS",
    content: { phone: "+1 555 010 2030", message: "Batch # on box: " },
    config: {
      dotStyle: "classy",
      frameStyle: "extra-rounded",
      ballStyle: "dots",
      dotFill: {
        type: "radial",
        rotation: 0,
        stops: [
          { offset: 0, color: "#155e75" },
          { offset: 1, color: "#083344" },
        ],
      },
      cornerFill: { type: "solid", color: "#083344" },
      background: { transparent: true, color: "#ffffff" },
      margin: 2,
      ecc: "M",
      logo: logoOff,
    },
    ageDays: 6,
  },
];
