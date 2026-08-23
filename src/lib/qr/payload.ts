export type QrTypeKey =
  | "URL"
  | "TEXT"
  | "EMAIL"
  | "PHONE"
  | "SMS"
  | "WIFI"
  | "VCARD"
  | "LOCATION";

export interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "tel" | "email" | "url" | "password";
  placeholder?: string;
  optional?: boolean;
}

interface TypeMeta {
  label: string;
  hint: string;
  fields: FieldDef[];
  defaults: Record<string, string>;
  build: (content: Record<string, string>) => string;
}

const escapeWifi = (s: string) => s.replace(/([\\;,:"'])/g, "\\$1");

function vcard(c: Record<string, string>) {
  const first = c.firstName?.trim() || "";
  const last = c.lastName?.trim() || "";
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${last};${first};;;`,
    `FN:${[first, last].filter(Boolean).join(" ")}`,
  ];
  if (c.org) lines.push(`ORG:${c.org}`);
  if (c.title) lines.push(`TITLE:${c.title}`);
  if (c.phone) lines.push(`TEL;TYPE=CELL:${c.phone}`);
  if (c.email) lines.push(`EMAIL:${c.email}`);
  if (c.website) lines.push(`URL:${c.website}`);
  if (c.note) lines.push(`NOTE:${c.note}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

export const QR_TYPES: Record<QrTypeKey, TypeMeta> = {
  URL: {
    label: "Link",
    hint: "Open a web page when scanned",
    fields: [
      {
        key: "url",
        label: "Destination URL",
        type: "url",
        placeholder: "https://example.com",
      },
    ],
    defaults: { url: "" },
    build: (c) => c.url?.trim() ?? "",
  },
  TEXT: {
    label: "Text",
    hint: "Show plain text when scanned",
    fields: [
      {
        key: "text",
        label: "Text content",
        type: "textarea",
        placeholder: "Any message you want to encode",
      },
    ],
    defaults: { text: "" },
    build: (c) => c.text ?? "",
  },
  EMAIL: {
    label: "Email",
    hint: "Compose an email when scanned",
    fields: [
      {
        key: "email",
        label: "Address",
        type: "email",
        placeholder: "hello@example.com",
      },
      { key: "subject", label: "Subject", type: "text", optional: true },
      { key: "body", label: "Message", type: "textarea", optional: true },
    ],
    defaults: { email: "", subject: "", body: "" },
    build: (c) => {
      if (!c.email) return "";
      const params = new URLSearchParams();
      if (c.subject) params.set("subject", c.subject);
      if (c.body) params.set("body", c.body);
      const q = params.toString();
      return `mailto:${c.email}${q ? "?" + q : ""}`;
    },
  },
  PHONE: {
    label: "Phone",
    hint: "Start a phone call when scanned",
    fields: [
      {
        key: "phone",
        label: "Phone number",
        type: "tel",
        placeholder: "+1 555 000 1234",
      },
    ],
    defaults: { phone: "" },
    build: (c) => (c.phone ? "tel:" + c.phone.replace(/\s+/g, "") : ""),
  },
  SMS: {
    label: "SMS",
    hint: "Draft a text message when scanned",
    fields: [
      {
        key: "phone",
        label: "Phone number",
        type: "tel",
        placeholder: "+1 555 000 1234",
      },
      { key: "message", label: "Message", type: "textarea", optional: true },
    ],
    defaults: { phone: "", message: "" },
    build: (c) =>
      c.phone
        ? `SMSTO:${c.phone.replace(/\s+/g, "")}:${c.message ?? ""}`
        : "",
  },
  WIFI: {
    label: "Wi-Fi",
    hint: "Join a network when scanned",
    fields: [
      {
        key: "ssid",
        label: "Network name (SSID)",
        type: "text",
        placeholder: "Cafe-Guest",
      },
      {
        key: "password",
        label: "Password",
        type: "password",
        optional: true,
      },
    ],
    defaults: { ssid: "", password: "" },
    build: (c) => {
      if (!c.ssid) return "";
      const pass = c.password ? `P:${escapeWifi(c.password)};` : "";
      return `WIFI:T:WPA;S:${escapeWifi(c.ssid)};${pass}H:false;;`;
    },
  },
  VCARD: {
    label: "Contact",
    hint: "Save a contact card when scanned",
    fields: [
      { key: "firstName", label: "First name", type: "text" },
      { key: "lastName", label: "Last name", type: "text", optional: true },
      { key: "org", label: "Company", type: "text", optional: true },
      { key: "title", label: "Job title", type: "text", optional: true },
      {
        key: "phone",
        label: "Phone number",
        type: "tel",
        optional: true,
      },
      { key: "email", label: "Email", type: "email", optional: true },
      {
        key: "website",
        label: "Website",
        type: "url",
        optional: true,
      },
    ],
    defaults: {
      firstName: "",
      lastName: "",
      org: "",
      title: "",
      phone: "",
      email: "",
      website: "",
    },
    build: vcard,
  },
  LOCATION: {
    label: "Location",
    hint: "Open a map location when scanned",
    fields: [
      { key: "lat", label: "Latitude", type: "text", placeholder: "37.7749" },
      { key: "lng", label: "Longitude", type: "text", placeholder: "-122.4194" },
      { key: "label", label: "Place name", type: "text", optional: true },
    ],
    defaults: { lat: "", lng: "", label: "" },
    build: (c) => {
      if (!c.lat || !c.lng) return "";
      return `geo:${c.lat},${c.lng}` + (c.label ? `?q=${c.lat},${c.lng}(${encodeURIComponent(c.label)})` : "");
    },
  },
};

export const QR_TYPE_ORDER: QrTypeKey[] = [
  "URL",
  "TEXT",
  "EMAIL",
  "PHONE",
  "SMS",
  "WIFI",
  "VCARD",
  "LOCATION",
];

export function buildQrPayload(
  type: QrTypeKey,
  content: Record<string, string>
): string {
  return QR_TYPES[type].build(content);
}
