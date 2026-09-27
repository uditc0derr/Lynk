<div align="center">

# LYNK

**Short links with click analytics. QR codes with a full design studio.**

A self-hosted link management platform — shorten URLs, track every click and scan,
and design branded QR codes with custom module shapes, gradients, corner eyes and
logos, exported as crisp PNG or vector SVG.

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![React 19](https://img.shields.io/badge/React-19.1-087ea4?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Prisma 6](https://img.shields.io/badge/Prisma-6.19-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169e1?style=flat-square&logo=postgresql)](https://www.postgresql.org)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Feature Highlights](#feature-highlights)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Demo Account & Seed Data](#demo-account--seed-data)
- [Application Routes](#application-routes)
- [API Reference](#api-reference)
- [How It Works](#how-it-works)
  - [Short link lifecycle](#short-link-lifecycle)
  - [Static vs. dynamic QR codes](#static-vs-dynamic-qr-codes)
  - [Event tracking pipeline](#event-tracking-pipeline)
  - [Analytics aggregation](#analytics-aggregation)
  - [The QR rendering engine](#the-qr-rendering-engine)
  - [Authentication & sessions](#authentication--sessions)
- [Data Model](#data-model)
- [QR Payload Formats](#qr-payload-formats)
- [QR Design Options](#qr-design-options)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Security & Privacy](#security--privacy)
- [Testing & Quality](#testing--quality)
- [Known Limitations](#known-limitations)
- [Roadmap Ideas](#roadmap-ideas)
- [Contributing](#contributing)
- [License](#license)
---

## Overview

LYNK is a link management platform that treats QR codes as first-class citizens
rather than an afterthought. It is two products sharing one analytics pipeline:

1. **A URL shortener** — 7-character custom or random aliases, editable
   destinations, per-link pause and expiry, and click analytics broken down by
   device, browser, OS, referrer and country.
2. **A QR design studio** — eight payload types (URL, text, email, phone, SMS,
   Wi-Fi, vCard, location), seven module shapes, five corner-frame styles, four
   corner-ball styles, solid/linear/radial gradients on modules *and* corners,
   transparent backgrounds, and embedded logos. Exports to PNG or SVG.

The two halves interconnect through **dynamic QR codes**: a QR whose artwork
encodes a LYNK URL rather than the final destination. Because the encoded URL
never changes, printed cards, packaging and posters can be retargeted forever
from the dashboard — and every scan is still measured.

### Who it's for

- Marketers and small teams running campaigns that need to change destinations post-print.
- Developers who want a self-hosted, dependency-light shortener with real analytics.
- Anyone who needs a Wi-Fi card, vCard or SMS QR without installing an app.

### Design philosophy

- **No cookies on tracked links.** Analytics are first-party and aggregate only.
- **No IP storage, ever.** There is no IP column in the schema.
- **Print-first output.** 2048px PNG and vector SVG, quiet-zone control, ECC up to High.
- **Zero chart dependencies.** Trend charts, sparklines and bar lists are hand-rolled SVG.
- **Zero UI kit dependencies.** The 20+ primitives in `src/components/ui` are local.

---

## Feature Highlights

### Link management

| Capability | Details |
| --- | --- |
| Random aliases | 7 chars from a 54-symbol unambiguous alphabet (`src/lib/slug.ts:27`) |
| Custom aliases | 3–30 chars, `[a-zA-Z0-9_-]`, validated against a reserved-word blocklist |
| Collision handling | Up to 5 retries on `P2002` for random slugs; explicit `409` for custom aliases |
| Edit destination | Patch the target URL at any time without changing the short link |
| Pause | `disabled` flag renders a branded `410` status screen instead of redirecting |
| Expire | Optional `expiresAt` timestamp, checked on every hit |
| Rename / retitle | Optional human-readable title for your own dashboard |
| Delete | Cascades to all recorded events |
| Anonymous creation | `POST /api/shorten` works signed-out; links attach to the user on login |

### QR studio

| Capability | Details |
| --- | --- |
| 8 payload types | Link, Text, Email, Phone, SMS, Wi-Fi, Contact (vCard 3.0), Location |
| 7 module shapes | square, rounded, extra-rounded, dots, diamond, classy, classy-rounded |
| 5 corner frames | square, rounded, extra-rounded, circle, leaf |
| 4 corner balls | square, rounded, circle, diamond |
| Dual color systems | Modules and corner eyes are filled independently |
| 3 fill modes each | Solid, linear gradient, radial gradient |
| Gradient angle | −180° to 180° slider, live preview strip |
| Background | Any hex, or fully transparent for print overlays |
| Quiet zone | 0–6 module margin control |
| Error correction | L / M / Q / H with recovery-rate guidance in the UI |
| Logo | PNG, JPG, WebP or SVG, auto-downscaled to 512px, sized 10–40% with 0–20% padding, on a none/square/circle backing plate |
| Export | PNG @ 1024px, PNG @ 2048px, vector SVG |
| Live preview | Renders as you type, click the payload to copy it |
| Live data URLs | Dynamic codes mint a `/q/{slug}` scan URL on save |
| Duplication | Clone any code's content and design as a new static code |

### Analytics

- **Overview dashboard** — 4 KPI cards (links, clicks 30d, QR codes, scans 30d), each with a sparkline; a 30-day dual-series trend chart; recent links; live activity feed.
- **Account analytics** (`/dashboard/analytics`) — 7 / 30 / 90-day range tabs, total traffic, clicks, scans, daily average, best-performing day, top 5 links, plus device / referrer / region breakdowns.
- **Per-link analytics** — clicks all-time, 30d, 7d and QR scan count; 30-day trend; device, browser and referrer breakdowns; top regions with flags; last 12 events with full context.
- **Per-QR analytics** — scans all-time, 30d, 7d and daily average; device, browser and OS breakdowns; recent scan log with time, device and country.
- **Live refresh** — dashboard auto-refreshes every 15s and on window focus, throttled and paused when the tab is hidden (`src/components/dashboard/auto-refresh.tsx`).
- **Bot filtering** — crawler traffic is dropped before it ever reaches the database.

### Account

- Sign up / sign in / sign out with bcrypt-hashed passwords.
- Rename profile, change password (requires current password), permanently delete account.
- 30-day sessions stored server-side; logout destroys the row *and* the cookie.
- Signup is rate limited to 10 attempts per minute per IP.

---

## Tech Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Framework | **Next.js 15.5.23** | App Router, RSC, Server Actions not used — route handlers instead |
| Bundler | **Turbopack** | Enabled for both `dev` and `build` |
| UI runtime | **React 19.1.0** | Server Components by default, `"use client"` at the leaves |
| Language | **TypeScript 5** | `strict: true`, path alias `@/* → ./src/*` |
| Styling | **Tailwind CSS v4** | CSS-first config via `@theme` in `globals.css`, no JS config file |
| Fonts | **Geist Sans + Geist Mono** | Self-hosted through the `geist` package |
| Icons | **lucide-react** | |
| Database | **PostgreSQL** | |
| ORM | **Prisma 6.19** | Singleton client, raw SQL for time-series aggregation |
| Validation | **Zod v4** | One schema per request body, first-issue error surfaced to the UI |
| Password hashing | **bcryptjs** | Cost factor 10 |
| QR matrix | **qrcode-generator** | Encoding only — matrix in, bits out |
| QR rendering | **Custom SVG renderer** | `src/lib/qr/render.ts`, no canvas library |
| UA parsing | **ua-parser-js 2** | Browser / OS / device classification |
| Seed runner | **tsx** | Runs `prisma/seed.ts` directly |

> There is no charting library, no component library, no auth framework, and no
> test runner. Every UI primitive, chart and session mechanism is local code.

---

## Quick Start

### Prerequisites

- **Node.js 20+** (Next.js 15 requires ≥ 18.18; 20 LTS recommended)
- **npm 10+**
- **PostgreSQL 14+** running locally, or a connection string to a hosted instance

### Install

```bash
git clone <your-fork-url>
cd urlshortnerandTracker
npm install
```

### Configure

```bash
cp .env.example .env
```

Edit `.env` and set your PostgreSQL connection string:

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/lynk"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

<details>
<summary>Creating the database (macOS / Linux)</summary>

```bash
createuser -s lynk
createdb lynk -O lynk
psql -c "ALTER USER lynk WITH PASSWORD 'lynk';"
```

</details>

<details>
<summary>Creating the database with Docker</summary>

```bash
docker run --name lynk-postgres \
  -e POSTGRES_USER=lynk \
  -e POSTGRES_PASSWORD=lynk \
  -e POSTGRES_DB=lynk \
  -p 5432:5432 -d postgres:16
```

Then use `postgresql://lynk:lynk@localhost:5432/lynk`.

</details>

### Create the schema

```bash
npx prisma db push
```

This applies `prisma/schema.prisma` to your database and regenerates the client.

### Seed demo data (optional but recommended)

```bash
npm run db:seed
```

Creates a demo account with 12 links, 6 QR codes and 30 days of realistic
analytics. See [Demo Account & Seed Data](#demo-account--seed-data).

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Verify the install

```bash
npx tsc --noEmit     # type check
npm run lint         # eslint
npm run build        # production build
```

---

## Environment Variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string consumed by Prisma. Missing → every DB call throws. |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Absolute origin used for `metadataBase`, canonical URLs and Open Graph tags. **Set this in production** or social previews will point at localhost. |

`.env` is git-ignored. `.env.example` is committed. Never commit real credentials.

---

## Demo Account & Seed Data

`npm run db:seed` is **idempotent and deterministic** — it deletes and recreates
the demo user (cascading to all their links, codes and events) using a seeded
`mulberry32(20260823)` PRNG, so you get the exact same dataset every time.

| | |
| --- | --- |
| **Email** | `demo@lynk.to` |
| **Password** | `lynkdemo` |
| **Name** | Udit Pandey |

### Seeded links (12)

| Slug | Title | State | Clicks/day (approx.) |
| --- | --- | --- | --- |
| `/launch` | LYNK v2 launch post | active | ~42 |
| `/gh` | GitHub repo | active | ~31 |
| `/docs-api` | API documentation | active | ~27 |
| `/waitlist` | Beta waitlist form | active | ~18 |
| `/webinar-2026` | Webinar registration | active | ~15 |
| `/demo-deck` | Investor demo deck (PDF) | active | ~12 |
| `/podcast` | Podcast episode 47 | active | ~9 |
| `/menu` | Cafe seasonal menu | active | ~7 |
| `/careers` | Careers page | active | ~6 |
| `/changelog-aug` | August changelog | active | ~3 |
| `/spring-sale` | Spring sale landing page | **expired 4 days ago** | ~24 |
| `/old-blog` | Legacy blog redirect | **disabled** | ~2 |

### Seeded QR codes (6)

| Name | Type | Mode | Scan URL | Style highlights |
| --- | --- | --- | --- | --- |
| Launch site — posters | Link | **dynamic** | `/q/scan-launch` | Dots, indigo→violet linear, ECC Q |
| Cafe menu — table tents | Link | **dynamic** | `/q/scan-menu` | Classy-rounded, leaf eyes, off-white bg, margin 3, **ECC High** |
| Webinar badge QR | Link | **dynamic** | `/q/scan-webinar` | Extra-rounded, circle eyes, slate `#0f172a` |
| Guest Wi-Fi card | Wi-Fi | static | — | SSID `CafeLynk_Guest` |
| Support contact card | Contact | static | — | Diamond modules, amber gradient |
| Packaging feedback SMS | SMS | static | — | Classy, radial cyan, **transparent background** |

### Analytics realism

Event rows are not uniform random — the seeder models:

- **Weekday seasonality** — a 0.55× weekend dip for clicks, a 1.35× Friday/Saturday boost for scans.
- **Growth ramp** — newer links start slower and climb.
- **Plausible OS/browser coupling** — iOS skews to Safari; mobile skews iOS/Android; scans are 93% mobile.
- **Weighted referrers** — 46% direct, then x.com, Hacker News, GitHub, LinkedIn, Reddit, Product Hunt.
- **Weighted countries** — US 38%, IN 16%, and a long tail.

Result: 30 days of history, 15 `Link` rows (12 visible + 3 hidden QR targets),
6 `QrCode` rows, and several thousand `Event` rows.

---

## Application Routes

### Public

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | Static + ISR-able | Marketing landing: hero with live shortener, QR showcase, interactive mini-editor, link-management preview, dynamic-QR explainer, chart preview, CTA, footer |
| `/login` | Client form | Sign in; `?next=` aware, redirects to `/dashboard` if already signed in |
| `/signup` | Client form | Create account (rate limited) |
| `/{slug}` | Dynamic RSC | Short link → record `CLICK` → 307 redirect |
| `/q/{slug}` | Dynamic RSC | Dynamic QR target → record `SCAN` → 307 redirect |

### Dashboard (session required)

Middleware intercepts `/dashboard/*` before rendering and bounces anonymous
visitors to `/login?next=…` (`src/middleware.ts`). `dashboard/layout.tsx` then
calls `requireUser()` as defence in depth.

| Route | Purpose |
| --- | --- |
| `/dashboard` | Overview KPIs, trend chart, recent links, activity feed |
| `/dashboard/links` | Link table: search, status filter, sort, inline edit/pause/delete |
| `/dashboard/links/[id]` | Link details + full click analytics |
| `/dashboard/qr` | QR card grid: search, dynamic/static filter, sort, duplicate, delete |
| `/dashboard/qr/new` | QR editor in create mode |
| `/dashboard/qr/[id]` | QR editor in edit mode |
| `/dashboard/qr/[id]/analytics` | Per-QR scan analytics (static codes get an explainer screen) |
| `/dashboard/analytics` | Account-wide analytics with 7/30/90-day ranges |
| `/dashboard/settings` | Profile, password change, danger zone |

### Route handlers

```
src/app/api/
├── shorten/route.ts          POST   public shorten
├── links/route.ts            GET    list own links (max 200)
│                             POST   create link
├── links/[id]/route.ts       PATCH  update destination/title/slug/disabled/expiresAt
│                             DELETE delete link + events
├── qr/route.ts               GET    list own QR codes
│                             POST   create QR code (+ mint /q slug if dynamic)
├── qr/[id]/route.ts          GET    fetch one code
│                             PATCH  update code (+ retarget dynamic link, transactional)
│                             DELETE delete code
├── auth/signup/route.ts      POST   register + create session
├── auth/login/route.ts       POST   verify + create session
├── auth/logout/route.ts      POST   destroy session
├── account/route.ts          PATCH  rename profile
│                             DELETE delete account
└── account/password/route.ts PATCH  change password
```

### Status screens

Instead of a bare 404, both public redirect routes render a branded
`StatusScreen` for every terminal state — `404 · Link not found`, `410 · Paused`,
`410 · Expired`, `404 · Code not found` (`src/components/public/status-screen.tsx`).

---

## API Reference

All bodies are JSON. All authenticated routes rely on the `lynk_session`
httpOnly cookie. Errors return `{ "error": "human readable message" }` with an
appropriate status code.

### Auth

| Method | Path | Auth | Body | Success |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | — | `{ name, email, password }` | `200` `{ ok, user }` + session cookie |
| `POST` | `/api/auth/login` | — | `{ email, password }` | `200` `{ ok, user }` + session cookie |
| `POST` | `/api/auth/logout` | cookie | — | `200` `{ ok: true }` |

**Status codes:** `400` invalid input · `401` bad credentials · `409` email taken · `429` rate limited.

> Signup enforces 10 attempts / 60s per IP via an in-memory bucket
> (`src/app/api/auth/signup/route.ts:8`). Login is not rate limited.

### Account

| Method | Path | Auth | Body | Notes |
| --- | --- | --- | --- | --- |
| `PATCH` | `/api/account` | required | `{ name }` | Email is immutable |
| `DELETE` | `/api/account` | required | — | Deletes user; cascades to sessions, links, codes, events |
| `PATCH` | `/api/account/password` | required | `{ currentPassword, newPassword }` | `403` if current password is wrong |

### Links

| Method | Path | Auth | Body / Query | Notes |
| --- | --- | --- | --- | --- |
| `POST` | `/api/shorten` | optional | `{ destination, customSlug? }` | Public. Creates with `userId: null` if signed out. |
| `GET` | `/api/links` | required | — | Latest 200 non-QR links with `_count.events` |
| `POST` | `/api/links` | required | `{ destination, title?, slug?, expiresAt? }` | Dashboard creation flow |
| `PATCH` | `/api/links/[id]` | owner | `{ destination?, title?, slug?, disabled?, expiresAt? }` | `409` on alias collision |
| `DELETE` | `/api/links/[id]` | owner | — | Hard delete, cascades to events |

`destination` must be a valid `http:` or `https:` URL, 1–2048 chars
(`src/lib/validators.ts:4`). `expiresAt` must be an ISO 8601 datetime with offset
or `null`. Custom slugs must be 3–30 chars of `[a-zA-Z0-9_-]` and not in
`RESERVED_SLUGS`.

### QR codes

| Method | Path | Auth | Body | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/api/qr` | required | — | All codes with `scanSlug` when dynamic |
| `POST` | `/api/qr` | required | `{ name, type, content, config, dynamic, destination? }` | Dynamic requires `type: "URL"` and an `http(s)` destination; mints a hidden `Link` with `isQrTarget: true` and returns `scanSlug` |
| `GET` | `/api/qr/[id]` | owner | — | Single code including its link |
| `PATCH` | `/api/qr/[id]` | owner | `{ name?, type?, content?, config?, destination? }` | For dynamic codes, `destination` updates the linked `Link` **in the same transaction** |
| `DELETE` | `/api/qr/[id]` | owner | — | Deletes the code; the linked `Link` survives (`onDelete: SetNull`) |

`config` is validated strictly by `qrConfigSchema`: all colours must be 3- or
6-digit hex, margins are integers 0–6, ECC is one of `L|M|Q|H`, and a logo `src`
must either be empty or a `data:image/(png|jpeg|jpg|webp|svg+xml);base64,` URL
≤ 700 KB.

### Response shape

```jsonc
// POST /api/shorten
{
  "ok": true,
  "link": { "id": "clx...", "slug": "k3M9xQa", "destination": "https://example.com" },
  "authed": false
}

// GET /api/qr
{
  "qrCodes": [
    {
      "id": "clx...",
      "name": "Cafe menu — table tents",
      "type": "URL",
      "content": { "url": "https://lynk.to/menu" },
      "config": { "dotStyle": "classy-rounded", "ecc": "H", "...": "..." },
      "dynamic": true,
      "scanSlug": "scan-menu"
    }
  ]
}
```

---

## How It Works

### Short link lifecycle

```
GET /k3M9xQa
   │
   ├─ slug in RESERVED_SLUGS? ──────────────► redirect("/")
   ├─ link missing, or isQrTarget? ────────► StatusScreen "404 · Link not found"
   ├─ link.disabled? ──────────────────────► StatusScreen "410 · Paused"
   ├─ link.expiresAt < now? ───────────────► StatusScreen "410 · Expired"
   │
   ├─ recordEvent(headers, "CLICK")        ← awaited, then:
   └─ redirect(link.destination)           ← Next.js 307
```

Both redirect routes declare `export const dynamic = "force-dynamic"` — nothing
about a click or a link's live state may ever be cached.

`isQrTarget` links are **invisible to the public short-link route**: a dynamic
QR's internal `/q/` link is not reachable (and not meaningful) at `/{slug}`, so
the two namespaces cannot collide.

### Static vs. dynamic QR codes

|  | Static | Dynamic |
| --- | --- | --- |
| Encodes | The payload itself (e.g. `https://example.com`) | A LYNK scan URL (`https://lynk.to/q/scan-menu`) |
| Editable after printing | **No** — the artwork is the data | **Yes** — change the destination any time |
| Scan tracking | Impossible (no server hop) | Full device / browser / OS / country breakdown |
| Requires | Nothing | A `Link` row with `isQrTarget: true` |
| Analytics page | Explains that static codes can't be tracked | Full analytics |

**The print-once problem.** A QR printed on 5,000 table tents encodes a fixed
string. Change the menu and every tent is scrap. LYNK's dynamic mode puts a
LYNK URL in the artwork instead and stores the real destination in the database
behind a hidden `Link` row. The QR image is downloaded once, printed once, and
retargeted forever from `/dashboard/qr/[id]` — while `/{q-slug}` continues to
record a `SCAN` event on every hit.

Once a dynamic slug is minted the editor's **Dynamic code** switch is frozen:
switching it off would leave physical artwork pointing at a URL that no longer
resolves.

### Event tracking pipeline

```
recordEvent(headers, linkId, userId, kind)          src/lib/events.ts:21
   │
   ├─ user-agent missing?          ──► return (treated as a bot)
   ├─ UA matches BOT_RE?           ──► return (no row written)
   │     /bot|crawl|spider|slurp|preview|embed|fetcher|monitor|headless/i
   │
   ├─ parseUA(ua)                  ──► { browser, os, device }
   │     mobile  → "Mobile"          src/lib/ua.ts
   │     tablet  → "Tablet"
   │     else    → "Desktop"
   │     "Mac OS" is normalised to "macOS"
   │
   ├─ referer header ──► new URL(…).hostname ──► strip leading "www."
   │                     (unparseable → null → shown as "Direct")
   │
   ├─ countryFromHeaders(headers)
   │     1. cf-ipcountry            (Cloudflare)
   │     2. x-vercel-ip-country     (Vercel)
   │         3. x-geo-country
   │     4. x-country-code
   │     all must match /^[A-Za-z]{2}$/ then uppercased
   │     5. fallback: accept-language region subtag
   │        "en-IN,en;q=0.9" → "IN"   ← dev/localhost only
   │
   └─ db.event.create({ …, select: { id: true } })
         return only the id so the payload never crosses the wire
```

Notable properties:

- **No IP address is read, derived or stored.** The schema has no column for it.
- **Bot traffic never reaches the database**, keeping counts honest.
- **Referrers are reduced to a hostname**, so no full URLs or query strings leak.
- The event write is **awaited before the redirect** — the redirect waits on the insert. This guarantees no lost events at the cost of a few ms.
- Geo fallback via `Accept-Language` is a local-development convenience. Behind a proxy that strips geo headers it can report a wrong country.

### Analytics aggregation

`src/lib/stats.ts` uses **raw SQL** for anything time-series, with a tagged
template so every value is a bound parameter.

**Daily series** — `getDailySeries(where, days)`:

```sql
SELECT date_trunc('day', "createdAt") AS d, COUNT(*)::int AS count
FROM "Event"
WHERE "createdAt" >= $since
  [AND "userId" = $userId]
  [AND "linkId" = $linkId]
  [AND "kind"    = $kind::"EventKind"]
GROUP BY 1 ORDER BY 1
```

`COUNT(*)::int` avoids Postgres returning `bigint` as a string. Crucially, the
**gaps are zero-filled in JavaScript**: the raw result only contains days that
actually have events, so a dense 30-point array is generated and looked up by
`YYYY-MM-DD`. A quiet Tuesday reads as `0` on the chart rather than vanishing
and silently compressing the x-axis.

`sinceDate(days)` computes `now - (days-1) days` and then snaps to `00:00:00 UTC`,
so a "7 day" window means seven calendar days, not 168 rolling hours.

**Breakdowns** — `getBreakdown(where, field, days, take)`:

```sql
SELECT "browser" AS label, COUNT(*)::int AS count
FROM "Event"
WHERE … GROUP BY 1 ORDER BY 2 DESC LIMIT $take
```

The column name is interpolated with `Prisma.raw`, which is safe *only* because
every call site passes a literal from a closed union
`"browser" | "os" | "device" | "referrer" | "country"` — never user input. If
you extend this function, keep that invariant. `NULL` labels become `"Direct"`
for referrers and `"Unknown"` elsewhere.

Supported breakdown fields: `browser`, `os`, `device`, `referrer`, `country`.

### The QR rendering engine

Most libraries give you a bitmap. LYNK emits **SVG path data**, which is why the
same code produces a 512px favicon and a print-ready 2048px PNG with no
re-rasterisation artefacts.

```
payload string
   │
   ├─ buildMatrix(text, ecc)                      src/lib/qr/matrix.ts
   │     qrcode.stringToBytes = TextEncoder-based UTF-8
   │     qrcode(0, ecc) → addData → make()
   │     returns { size, isDark(row, col) }
   │     ⚠ qrcode-generator is byte-oriented; a UTF-8 override is required or
   │       non-ASCII payloads (Wi-Fi passwords, vCards) encode incorrectly.
   │
   └─ renderSVG(matrix, config, idPrefix)          src/lib/qr/render.ts
         ├─ background rect, skipped when transparent
         ├─ <defs>: linearGradient / radialGradient for module + corner fills
         ├─ finder-pattern pass (3 eyes)  → framePath() + ballPath()
         │     "dots" frames emit two concentric circles (evenodd ring)
         │     "leaf" flips its per-corner radii for bottom-right / bottom-left
         ├─ module pass, skipping any cell inside a finder (isInFinder)
         │     and any cell inside the logo's clearance box
         ├─ logo: optional backing plate (none/square/circle) + <image>
         │     with a <clipPath> for circular logos
         └─ emits one <path> per group for minimal DOM
```

**Neighbour-aware geometry.** `dotPath` receives the four neighbours of each
module. For `rounded` and `extra-rounded`, a corner radius is applied *only* where
the module has no dark neighbour in that direction — so connected runs form
smooth continuous blobs and isolated dots become full circles. This is the single
detail that separates a premium-looking QR from a blocky one:

```ts
const rtl = !hasUp && !hasLeft ? fr * s : 0;   // render.ts:81
```

`classy` / `classy-rounded` use the same mechanism restricted to the top-left and
bottom-right corners, producing the diagonal "leaf" look.

**Fills.** A `Fill` is either `{ type: "solid", color }` — emitted directly as
`fill="#18181b"` — or a gradient, which emits a `<linearGradient>` /
`<radialGradient>` into `<defs>` and references it. The `idPrefix` parameter
(`qr`, `qr1`, `qr2`, …) keeps gradient IDs unique when several codes render on
the same page, which matters because the dashboard grid renders a live SVG per
card.

**Export** (`src/lib/qr/download.ts`) is entirely client-side, so no server
round-trip and no image processing dependency:

1. `renderSVG` produces `width="100%" height="100%"`.
2. `withPixelSize` rewrites that to concrete pixels (1024 or 2048).
3. **SVG** — wrapped in a `Blob` with `image/svg+xml` and downloaded directly.
4. **PNG** — the SVG becomes an object URL, loads into an `Image`, is drawn to a
   `<canvas>` at the target size, and `canvas.toDataURL("image/png")` triggers the download.
5. Object URLs are revoked after 5 seconds.

**Logo handling.** Uploads are read with `FileReader` and, for raster images,
downscaled to a max edge of 512px through an offscreen canvas before being stored
as a data URL. SVGs are passed through untouched (they are already resolution
independent) — so a very large SVG *will* bloat the stored JSON config.

### Authentication & sessions

No third-party auth library. `src/lib/auth.ts` implements opaque server-side
sessions:

```
signup / login
   │
   ├─ bcrypt.hash(password, 10)          cost factor 10
   ├─ token = crypto.randomBytes(32).toString("hex")     256 bits
   ├─ expiresAt = now + 30 days
   ├─ db.session.create({ token, userId, expiresAt })   ← revocable server-side
   └─ cookie "lynk_session" = token
         httpOnly    true    ← unreachable from JavaScript (XSS can't steal it)
         sameSite    "lax"   ← sent on top-level navigation, not cross-site POST
         secure      true in production only
         path        "/"
         expires     matches expiresAt
```

Reads go through `getSessionUser()`, wrapped in React's `cache()` so a single
render pass hitting it in the layout, page and three child components issues one
query. `requireUser()` wraps it with `redirect("/login")`.

Logout calls `destroySession()`, which **deletes the `Session` row** before
clearing the cookie — the token is dead server-side even if the cookie lingers in
a stale browser.

`Session` rows cascade-delete with their user, and are not garbage-collected on
expiry; an occasional `DELETE FROM "Session" WHERE "expiresAt" < now()` is a
sensible cron job.

### Reserved slugs

`/{slug}` is a catch-all dynamic route, so any slug that would shadow a real
route is blocked. `RESERVED_SLUGS` (`src/lib/slug.ts:3`) covers:

```
api  dashboard  login  signup  logout  settings  analytics  links
qr   q          new    admin   account  _next   static   public
assets  favicon.ico  robots.txt  sitemap.xml  icon.svg
```

Matching is case-insensitive, and a reserved hit redirects to `/` rather than
404ing, so a visitor typing `/Dashboard` gets the homepage instead of a dead end.
Add to this list whenever you add a top-level route.

### Random slug generation

```ts
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789ABCDEFGHJKMNPQRSTUVWXYZ"; // 54
const out = ALPHABET[randomBytes[i] % ALPHABET.length];
```

The alphabet omits `i`, `l`, `o`, `0` and `1` — the characters most often
misread aloud or off a whiteboard. At 7 characters the space is 54⁷ ≈ 1.3 × 10¹²,
and the real guarantee is the `@unique` constraint on `Link.slug` plus the
5-attempt retry loop. The `crypto.randomBytes` source is what makes slugs
unguessable, which matters because knowing a slug is the only thing you need to
redirect through someone's link.

> Minor note: `byte % 54` carries a small modulo bias, because 256 is not a
> multiple of 54 — the first 40 byte values are each ~1.9% more likely than the
> rest. Across a 1.3 × 10¹² space this is irrelevant, but rejection sampling
> would be strictly cleaner if `slug.ts` is ever rewritten.

---

## Data Model

```
                        ┌──────────────┐
                        │     User     │
                        │──────────────│
                        │ id       @id │
                        │ email   @uniq│
                        │ name         │
                        │ passwordHash │
                        │ createdAt    │
                        │ updatedAt    │
                        └──┬───┬───┬───┘
             ┌─────────────┘   │   └──────────────┐
             │ 1:N             │ 1:N              │ 1:N
      ┌──────┴──────┐   ┌──────┴──────┐   ┌───────┴───────┐
      │   Session   │   │    Link     │   │    QrCode     │
      │─────────────│   │─────────────│   │───────────────│
      │ token  @uniq│   │ slug   @uniq│   │ name          │
      │ userId      │   │ destination │   │ type      enum│
      │ expiresAt   │   │ title?      │   │ content  Json │
      │ createdAt   │   │ userId?     │   │ config   Json │
      └─────────────┘   │ disabled    │   │ dynamic       │
                        │ expiresAt?  │   │ linkId?  @uniq│
                        │ isQrTarget  │   │ createdAt     │
                        │ createdAt   │   │ updatedAt     │
                        │ updatedAt   │   └───────┬───────┘
                        └───┬─────────────────────┘
                            │ 1:N (Link 1:1 QrCode)
                            │ linkId  @unique  → onDelete: SetNull
                     ┌──────┴──────┐
                     │    Event    │
                     │─────────────│
                     │ linkId      │  ← onDelete: Cascade
                     │ userId?     │  ← denormalised owner for fast queries
                     │ kind    enum│  ← CLICK | SCAN
                     │ browser?    │
                     │ os?         │
                     │ device?     │
                     │ referrer?   │  ← hostname only
                     │ country?    │
                     │ createdAt   │
                     └─────────────┘
```

### Notes on the design

- **`Link.userId` is nullable.** Anonymous `POST /api/shorten` creates ownerless
  links. They redirect correctly forever but are not listed in any dashboard.
- **`Link.isQrTarget`** separates the two link namespaces. Hidden QR links are
  excluded from the links list and from `GET /api/links`, and the public
  `/{slug}` route explicitly refuses to serve them.
- **`QrCode.linkId` is `@unique` with `onDelete: SetNull`.** Deleting a QR code
  leaves its link intact (the link is also excluded from the links UI by
  `isQrTarget`), while deleting a link orphans the code rather than destroying it.
- **`Event.userId` is denormalised** onto the event so account-wide analytics can
  filter by owner without a join through `Link`. It is intentionally not a
  foreign key — events must survive a link deletion long enough to be counted, and
  a real FK would complicate the cascade.
- **Indexes** cover the hot paths: `Link(userId, createdAt)` for the dashboard
  list, `Event(linkId, createdAt)` for per-link series, `Event(userId, createdAt)`
  for account series.
- **`Json` columns** hold QR `content` (type-specific form fields) and `config`
  (style settings). Both are validated by Zod on write, so the JSON is trusted
  on read — which is what allows the renderer to consume it directly.
- **`cuid()` ids** are URL-safe, non-sequential and index-friendly in Postgres.

### Enums

```prisma
enum QrType    { URL  TEXT EMAIL PHONE SMS WIFI VCARD LOCATION }
enum EventKind { CLICK SCAN }
```

---

## QR Payload Formats

Built by `buildQrPayload(type, content)` in `src/lib/qr/payload.ts`. Each type
declares its fields, defaults and a `build` function.

| Type | Encoded form | Example |
| --- | --- | --- |
| **Link** | The URL as-is | `https://example.com/pricing` |
| **Text** | Raw text | `Table 4 — order by 7pm` |
| **Email** | `mailto:` + query params | `mailto:hi@example.com?subject=Hi&body=Hello` |
| **Phone** | `tel:` + digits (spaces stripped) | `tel:+15550001234` |
| **SMS** | `SMSTO:` scheme | `SMSTO:+15550001234:Rate%20us%201-5` |
| **Wi-Fi** | `WIFI:` with escaped SSID and password | `WIFI:T:WPA;S:Cafe_Guest;P:hunter2;H:false;;` |
| **Contact** | vCard 3.0, CRLF-joined lines | `BEGIN:VCARD⏎VERSION:3.0⏎N:Pandey;Udit;;;⏎…⏎END:VCARD` |
| **Location** | `geo:` URI with optional `q=` label | `geo:37.7749,-122.4194?q=37.7749,-122.4194(Ferry%20Building)` |

**Escaping.** Wi-Fi payloads escape `\`, `;`, `,`, `:`, `"` and `'` with a
backslash — required by the `WIFI:` spec and a common source of codes that fail
to scan. Email params go through `URLSearchParams`, so subjects and bodies with
spaces, `&` or newlines are encoded correctly.

**Payload size matters.** Higher versions produce denser matrices that are harder
to scan at small print sizes. If a Wi-Fi password is very long, lower the ECC
level or increase the quiet-zone margin.

---

## QR Design Options

### Module shape — 7 options

| Value | Label | Behaviour |
| --- | --- | --- |
| `square` | Square | Flat modules, the QR-code baseline |
| `rounded` | Rounded | Radius on exposed corners only |
| `extra-rounded` | Extra rounded | Full circle on fully isolated modules — the LYNK default |
| `dots` | Dots | Every module a circle |
| `diamond` | Diamond | Rotated square, 4% inset |
| `classy` | Classy | Rounded top-left and bottom-right only |
| `classy-rounded` | Classy rounded | Fully rounded on those two corners |

### Corner eyes — 5 frames × 4 balls

| Frame | Shape |
| --- | --- |
| `square` | Sharp 7×7 ring with a 5×5 hole |
| `rounded` | Uniform 2-unit corner radius |
| `extra-rounded` | Uniform 3-unit corner radius |
| `dots` | Two concentric circles (`evenodd` ring) |
| `leaf` | Asymmetric radii, flipped per corner for a petal look |

| Ball | Shape |
| --- | --- |
| `square` | 3×3 flat square |
| `rounded` | 3×3 with 0.95 radius |
| `dots` | Circle, r = 1.42 |
| `diamond` | Rotated square |

Frames and balls are styled **independently** — a circular frame with a diamond
ball is a valid, supported combination.

### Colour and fill

Both `dotFill` and `cornerFill` accept:

- **Solid** — one hex colour, emitted as a plain `fill` attribute.
- **Linear gradient** — two hex stops plus a rotation from −180° to 180°
  (slider step 5), emitted as `<linearGradient>` with a `gradientTransform` rotate.
- **Radial gradient** — two hex stops, `cx/cy = 0.5`, `r = 0.65`.

Background is a hex colour plus a **transparent** toggle for overlaying artwork.

### Error correction

| Level | Recovery | Use when |
| --- | --- | --- |
| `L` | ~7% | Clean, high-contrast, large print, no logo |
| `M` | ~15% | General purpose default |
| `Q` | ~25% | LYNK default; good with modest logo coverage |
| `H` | ~30% | Heavy logo overlay, poor print conditions, small sizes |

Error correction *adds* redundancy, so a higher level means a denser matrix. The
editor warns you to raise it when you enable a logo.

### Defaults

```ts
{
  dotStyle:    "extra-rounded",
  frameStyle:  "extra-rounded",
  ballStyle:   "dots",
  dotFill:     linear #18181b → #3f3f46 at 45°,
  cornerFill:  solid #18181b,
  background:  { transparent: false, color: "#ffffff" },
  margin:      2,
  ecc:         "Q",
  logo:        { enabled: false, size: 22, padding: 4, shape: "square", bgColor: "#ffffff" },
}
```

---

## Design System

Tailwind v4 configured **entirely in CSS** — there is no `tailwind.config.js`.
`src/app/globals.css` starts with a single `@import "tailwindcss"` followed by an
`@theme` block:

| Token | Value | Use |
| --- | --- | --- |
| `--font-sans` | Geist Sans | Body copy |
| `--font-mono` | Geist Mono | Short links, payloads, slugs |
| `--color-accent` | `#4f46e5` | Primary actions, links, focus rings |
| `--color-accent-hover` | `#4338ca` | Hover state |
| `--color-accent-soft` | `#eef2ff` | Tinted backgrounds |
| `--color-accent-border` | `#c7d2fe` | Tinted borders |
| `--shadow-card` | `0 1px 2px rgb(9 9 11 / 0.04)` | Every card |
| `--animate-fade-in` | 0.18s ease-out | Modals, dropdowns |
| `--animate-pop-in` | 0.16s `cubic-bezier(0.16, 1, 0.3, 1)` | Buttons, toasts |
| `--animate-toast-in` | 0.22s `cubic-bezier(0.16, 1, 0.3, 1)` | Toasts |
| `--animate-qr-in` | 0.25s ease-out | QR previews |

Everything else uses stock **zinc** neutrals and arbitrary values for type sizes
(`text-[13.5px]`, `text-[22px]`). The recurring card idiom is:

```
rounded-xl border border-zinc-200 bg-white shadow-card
```

Global styles add smooth scrolling, `font-feature-settings: "cv11","ss01"`, a
custom `::selection`, an accent-coloured `:focus-visible` ring, thin scrollbars,
`input[type=color]` and `input[type=range]` resets, `.tabular` for
tabular-nums, and `.grid-paper` — a 32px grid at 3.5% black used behind the hero
and the QR preview.

### Local component library

No external UI kit. `src/components/ui` provides:

`Button` · `Input` · `Textarea` · `Select` · `Label` · `FieldError` · `Switch` ·
`Modal` · `Toast` + `useToast` · `Badge` · `StatusDot` · `Skeleton` ·
`EmptyState` · `Avatar` · `Segmented` · `ColorSwatch` · `Dropdown` / `MenuItem` /
`MenuSeparator` / `MenuLabel` / `DropdownButton` · `SelectMenu` · `ActionButton` ·
`CopyButton` / `CopyField` / `CopyShortLink` / `ShortUrlText` / `ShortUrlField` ·
`DateTimePicker` · `TrendChart` / `Sparkline` / `BarList`

`TrendChart` renders an interactive dual-series line/area chart with a hover
crosshair, `Sparkline` a compact inline trend, `BarList` a ranked horizontal bar
breakdown. All three are dependency-free SVG.

---

## Project Structure

```
.
├── prisma/
│   ├── schema.prisma          5 models, 2 enums
│   ├── seed.ts                Deterministic demo generator (mulberry32)
│   └── seed-data.ts           Link + QR specs, weighted distribution tables
├── public/                    (unused Next.js starter SVGs — safe to delete)
├── src/
│   ├── middleware.ts          Edge guard: /dashboard → /login, authed → /
│   ├── app/
│   │   ├── layout.tsx         Root layout, Geist fonts, ToastProvider, metadata
│   │   ├── page.tsx           Marketing landing
│   │   ├── globals.css        Tailwind v4 @theme design tokens
│   │   ├── icon.svg           Favicon
│   │   ├── [slug]/            Public short-link redirect (CLICK)
│   │   ├── q/[slug]/          Public dynamic-QR redirect (SCAN)
│   │   ├── login/  signup/    Auth pages
│   │   ├── dashboard/
│   │   │   ├── layout.tsx     requireUser() + <AutoRefresh/>
│   │   │   ├── loading.tsx    Skeleton grid
│   │   │   ├── error.tsx      Client error boundary with retry
│   │   │   ├── page.tsx       Overview KPIs
│   │   │   ├── analytics/     Account-wide, 7/30/90-day ranges
│   │   │   ├── links/         Table + [id] detail & analytics
│   │   │   ├── qr/            Grid, new, [id] editor, [id]/analytics
│   │   │   └── settings/      Profile, password, danger zone
│   │   └── api/               11 route handlers (see API Reference)
│   ├── components/
│   │   ├── ui/                20+ dependency-free primitives + SVG charts
│   │   ├── dashboard/         Shell, links view, QR view, modals, settings, auto-refresh
│   │   ├── qr-editor/         Editor, content/design/logo panels, fill picker, glyphs
│   │   ├── marketing/         Nav, hero form, mini editor, showcase, previews, footer
│   │   ├── public/            StatusScreen (404 / 410 states)
│   │   └── logo.tsx
│   └── lib/
│       ├── db.ts              Prisma singleton
│       ├── auth.ts            bcrypt, sessions, getSessionUser, requireUser
│       ├── slug.ts            Reserved slugs, generator, custom-slug validation
│       ├── validators.ts      Every Zod schema, one per endpoint
│       ├── events.ts          recordEvent + countryFromHeaders
│       ├── ua.ts              Bot detection, UA parsing
│       ├── stats.ts           Raw-SQL time series + breakdowns
│       ├── api.ts             Typed fetch wrapper, shortUrl/scanUrl helpers
│       ├── format.ts          Relative time, number and date formatting
│       └── qr/
│           ├── types.ts       QRStyleConfig, style enums, DEFAULT_QR_CONFIG
│           ├── matrix.ts      qrcode-generator wrapper + UTF-8 override
│           ├── render.ts      The SVG renderer (277 lines)
│           ├── payload.ts     8 payload builders + field metadata
│           └── download.ts    Client-side PNG/SVG export, image downscaling
├── .env.example
├── eslint.config.mjs          Flat config, next/core-web-vitals + next/typescript
├── next.config.ts             Defaults (no custom config yet)
├── postcss.config.mjs         @tailwindcss/postcss
└── tsconfig.json              strict, @/* → ./src/*
```

Roughly 4,500 lines of application code. Path alias `@/*` maps to `./src/*`.

---

## Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server on Turbopack — [localhost:3000](http://localhost:3000) |
| `npm run build` | Production build on Turbopack |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint via flat config |
| `npm run db:seed` | Reset and regenerate the demo dataset |

Not exposed as scripts, but used regularly:

```bash
npx tsc --noEmit              # type check (no script defined)
npx prisma db push            # apply schema changes
npx prisma studio             # browse the database in a GUI
npx prisma generate           # regenerate the client after schema edits
npx prisma migrate dev --name # create a real migration (production workflow)
```

`prisma.seed` is also declared in `package.json`, so `npx prisma db seed` works.

---

## Deployment

### Vercel (recommended)

1. Push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new).
2. Provision a Postgres database (Vercel Postgres, Neon, Supabase, Railway).
3. Set `DATABASE_URL` and `NEXT_PUBLIC_APP_URL` in project settings.
4. Deploy. Run `npx prisma db push` once against the production database —
   or commit a migration and add `npx prisma migrate deploy` as a build step.
5. Run `npm run db:seed` locally against the production `DATABASE_URL` if you
   want the demo dataset, then **delete the demo user** before going live.

Vercel sets `x-vercel-ip-country` automatically, so country analytics work with
no extra configuration.

### Any Node host

```bash
npm ci
npx prisma migrate deploy     # or: npx prisma db push
npm run build
npm run start                 # honours $PORT
```

Put it behind a reverse proxy (nginx, Caddy) for TLS. The session cookie sets
`secure: true` in production, so **HTTPS is required** — over plain HTTP the
login cookie will not be stored.

### Custom domain

Short links are served from the site root, so `https://lnk.to/gh` requires the
app to own `lnk.to`. Point the apex domain at the host and add a `Host`-based
rewrite if you need `/{slug}` on one domain and the dashboard on another — the
current build has no custom `next.config.ts` rewrites.

### Production checklist

- [ ] `NEXT_PUBLIC_APP_URL` set to the real origin (metadata + OG tags)
- [ ] HTTPS terminated at the proxy
- [ ] `DATABASE_URL` points at the production database
- [ ] Demo user (`demo@lynk.to`) deleted
- [ ] Session garbage-collection cron for expired rows
- [ ] A CDN in front of the app (for geo headers and redirect latency)
- [ ] Shared rate limiting (see [Known Limitations](#known-limitations))

---

## Security & Privacy

### What is handled well

- **Passwords** are bcrypt-hashed at cost 10 and never logged or returned.
- **Session tokens** are 256-bit values from `crypto.randomBytes`, stored
  server-side so they can be revoked, and marked `httpOnly` so XSS cannot read
  them.
- **Credentials live in one place.** `lib/auth.ts` exports exactly
  `hashPassword`, `verifyPassword`, `createSession`, `destroySession`,
  `getSessionUser`, `requireUser`. There is no second code path.
- **No IP storage.** There is no column for it. Country comes from CDN geo headers
  (or a locale hint in dev).
- **No cookies on tracked links.** No fingerprinting, no cross-site identifiers,
  no third-party scripts. The product's own footer states this.
- **Referrers are truncated** to a hostname before storage.
- **Bot filtering** keeps referrer spam out of the analytics.
- **Every input is Zod-validated** on the server. The client-side forms are a
  convenience, not a boundary.
- **Ownership checks on every mutation** use `findFirst({ where: { id, userId } })`
  rather than a bare `update`, so a guessed cuid returns `404` instead of
  mutating someone else's row.
- **Account deletion** cascades through sessions, links, QR codes and events.
- **`dangerouslySetInnerHTML` is used in exactly three places** — the QR preview,
  the dashboard QR grid and the editor — and only ever to inject SVG this
  application generated. The style config is owner-only and validated on write.

### What to harden before public launch

| Risk | Where | Mitigation |
| --- | --- | --- |
| Unbounded anonymous link creation | `POST /api/shorten` needs no auth | Require a session, or add CAPTCHA / rate limiting |
| Login brute force | `/api/auth/login` has no limiter | Share the signup limiter, keyed on IP + email |
| In-memory rate limit is per-instance | `api/auth/signup/route.ts:8` | Move to Redis/Upstash, or use a platform WAF |
| SVG logos are arbitrary user data in stored JSON | `logo.src` is a data URL | Sanitise server-side, or serve uploads from an object store with a CSP |
| No CSP / security headers | `next.config.ts` is empty | Add `headers()` with CSP, `X-Frame-Options`, `Referrer-Policy` |
| Expired sessions accumulate | `Session` table | Cron `DELETE FROM "Session" WHERE "expiresAt" < now()` |
| No email verification or password reset | — | Add a mail provider and a token table |

---

## Testing & Quality

### What exists

```bash
npx tsc --noEmit     # strict type check across the whole project
npm run lint         # ESLint 9 flat config, next/core-web-vitals + next/typescript
npm run build        # full production build
```

The build is also a meaningful smoke test: it type-checks, lints, and walks every
static/dynamic route it can prerender.

### What does not exist

**There is no test suite and no test runner.** No `*.test.*`, `*.spec.*`, or
`__tests__` directory anywhere, and no test dependency in `package.json`. If you
add one, Vitest is the natural fit for a Turbopack/Vite-adjacent stack.

Highest-value targets, in order:

1. **`src/lib/qr/render.ts`** — golden-file snapshot tests per style
   combination. A regression here produces codes that silently fail to scan.
2. **`src/lib/qr/payload.ts`** — assert exact output strings for all 8 types,
   especially Wi-Fi escaping and vCard structure.
3. **`buildMatrix` + `renderSVG` round trip** — decode a generated SVG back to a
   matrix and compare against `qrcode-generator`'s output.
4. **`src/lib/slug.ts`** — generator alphabet, length, and every reserved slug.
5. **`src/lib/stats.ts`** — the zero-fill logic for sparse days is easy to break
   and hard to notice.
6. **Route handlers** — status codes and ownership enforcement (`401` vs `404`).

### Manual verification checklist

```bash
npm run db:seed
npm run dev
```

- [ ] `POST /api/shorten` from the landing form returns a working short link
- [ ] Following a short link increments clicks in `/dashboard/links`
- [ ] A dynamic QR's `/q/{slug}` records a **scan**, not a click
- [ ] Editing a dynamic QR's destination changes where the **printed** code points
- [ ] `disabled` and `expiresAt` show `410` status screens
- [ ] Custom alias collision returns `409`
- [ ] A reserved slug (`/dashboard`, `/qr`) never resolves to a redirect
- [ ] PNG 2048 and SVG downloads open cleanly in an image editor
- [ ] Every QR style combination still scans on a real phone
- [ ] Deleting an account removes its links, codes and events

---

## Known Limitations

Honest list of what is incomplete or incorrect today.

### Correctness

| Issue | Detail |
| --- | --- |
| **No tests at all** | The QR renderer, payload builders and stats SQL are untested. See [Testing & Quality](#testing--quality). |
| **"Top links" ignores the selected range** | `/dashboard/analytics` sorts by all-time `_count.events` while the header shows 7/30/90 days, so the ranking can contradict the range. |
| **"Top links" capped at 5, drawn from 100** | Analytics loads the 100 most recent links; a high-traffic older link is silently excluded. |
| **Hardcoded QR sparkline** | The "QR codes" KPI card on the overview ships a literal `[2,3,3,4,4,5,5,5,6,6,6,6]` series instead of real data (`dashboard/page.tsx:63`). |
| **`?new=1` is dead** | "New link" links to `/dashboard/links?new=1`, but nothing reads `searchParams`, so the modal never opens. |
| **Download size claims exceed reality** | The landing page says "at any size"; the UI only offers 1024 and 2048 px with no custom field. |
| **No account-level browser/OS breakdown** | Only the per-link and per-QR pages break down by browser and OS. |
| **Anonymous links are orphans** | `POST /api/shorten` while signed out creates `userId: null` rows that no UI can ever list, edit or delete. |
| **SVG logos are not downscaled** | Raster uploads shrink to 512px, but SVGs pass through at full size and can bloat the stored config. |

### Security

| Issue | Detail |
| --- | --- |
| **Rate limiting is signup-only** | Login, `/api/shorten`, and all link/QR endpoints are unlimited. |
| **The limiter is per-instance** | An in-memory `Map` resets on deploy and does not work across replicas. |
| **No CSP or security headers** | `next.config.ts` is empty; no Content-Security-Policy, `X-Frame-Options` or `Referrer-Policy`. |
| **User SVG logos in stored config** | Embedded via `<image href="data:image/svg+xml;base64,…">` in a `dangerouslySetInnerHTML` context. |

### Scale

| Issue | Detail |
| --- | --- |
| **No pagination anywhere** | `links/page.tsx` has no `take`; the QR page loads every code and renders a live SVG per card inside the request. |
| **All filtering is client-side** | `links-view` and `qr-view` sort and filter the entire set in the browser. |
| **Event writes are awaited before redirect** | Correct — nothing is lost — but it adds database latency to every redirect. Consider a queue past ~1k rps. |
| **No event retention policy** | The `Event` table grows without bound. |

### Polish

| Issue | Detail |
| --- | --- |
| **Footer links are decorative** | All 12 are `<span>`s with no `href`; no `/about`, `/blog`, `/careers` or `/contact` routes exist. |
| **Settings shows a hardcoded domain** | "Short domain · lynk.to — Active" is a static read-only card, not real data. |
| **Landing page ignores auth state** | `SiteNav` and `FinalCta` accept an `authed` prop but are always called with the default. |
| **Landing stats are fabricated** | "12M+ links shortened", "99.99% uptime", "<40ms" are hardcoded marketing claims. |
| **Dead code** | `QR_TYPES[*].defaults` and `QR_TYPE_ORDER` in `payload.ts` are never consumed; `public/*.svg` are unused starter assets. |
| **Malformed import** | `editor.tsx:20` has two import statements on one line — harmless, but inconsistent. |

---

## Roadmap Ideas

Not implemented. Ordered roughly by value per unit of effort.

1. **Rate-limit everything** — Redis/Upstash, applied to login, shorten and mutations.
2. **Paginate the links and QR lists** — cursor pagination, server-side search and sorting.
3. **Fix the analytics inconsistencies** — range-scoped top links, real QR sparkline, working `?new=1`.
4. **Add tests** — Vitest, starting with the QR renderer and payload builders.
5. **Custom export sizes** — a numeric input next to the PNG presets; batch export as a zip.
6. **Custom short domain** — per-user hostnames via `Host`-based routing.
7. **Event retention & rollup** — nightly aggregation into daily counters; archive raw events.
8. **Password reset and email verification** — needs a mail provider and a token table.
9. **Team workspaces** — `Workspace` + membership roles; today every link belongs to exactly one user.
10. **UTM passthrough** — append source/medium/campaign to the destination on redirect.
11. **Webhook and CSV export** — push scan events to a URL, or export analytics as CSV.
12. **Scheduled expiry** — `expiresAt` already exists; a cron could notify before expiry.
13. **Internationalisation** — copy is hardcoded English throughout.
14. **Public API keys** — manage links and codes programmatically instead of only via cookies.

---

## Contributing

```bash
git clone <your-fork-url>
cd urlshortnerandTracker
npm install
cp .env.example .env        # point DATABASE_URL at your own database
npx prisma db push
npm run db:seed
npm run dev
```

Before opening a pull request:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

Guidelines:

- **Match the existing style.** This codebase uses `"use client"` only at the
  leaf, 2-space indent, double quotes, and semicolons. There is no Prettier config
  — follow the surrounding file.
- **TypeScript is `strict`.** No `any` without a comment explaining why.
- **Add to `RESERVED_SLUGS`** when you add a top-level route, or it will be
  shadowed by `/{slug}`.
- **Validate all new inputs** with a Zod schema in `lib/validators.ts` and
  surface `error.issues[0].message` to the user.
- **Never add an IP address, fingerprint or persistent identifier** to analytics.
  It is the product's core promise.
- **Re-scan QR changes on a real phone** before shipping. A regression in the
  renderer produces artwork that still *looks* fine and silently fails to scan.
- **Keep `public/` clean** — those SVGs are unused starter assets.

---

## License

**No license file has been chosen yet.** The repository is currently
unlicensed and private (`"private": true` in `package.json`), which means default
copyright applies: no one may legally copy, modify or redistribute it.

Pick one before publishing — MIT for maximum adoption, AGPL-3.0 if you want
network use to force openness, or a source-available licence such as
BSL/SSPL if you intend to run this as a hosted service. Add the licence text to
this section and a `LICENSE` file at the repo root, and replace the copyright
line below, which currently mirrors only the footer's `© <year> LYNK`
(`src/components/marketing/footer.tsx:124`).

If you fork this for your own use, note that it also depends on packages with
their own licences — Next.js (MIT), Prisma (Apache-2.0), Tailwind (MIT),
qrcode-generator (MIT), ua-parser-js (MIT), Zod (MIT) and bcryptjs (MIT).

---

## Acknowledgements

- [Next.js](https://nextjs.org) — App Router, Turbopack, metadata API
- [Prisma](https://www.prisma.io) — ORM and migrations
- [Tailwind CSS](https://tailwindcss.com) v4 — CSS-first design tokens
- [Geist](https://vercel.com/font) — typeface
- [lucide](https://lucide.dev) — icons
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) — QR encoding
- [ua-parser-js](https://github.com/faisalman/ua-parser-js) — user-agent parsing
- [Zod](https://zod.dev) — schema validation
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing

<div align="center">

**Made with Next.js, Prisma and Tailwind CSS.**

</div>
