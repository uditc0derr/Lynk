# LYNK

URL shortener and QR code studio. Short links with click analytics, plus fully
customizable QR codes — dot styles, corner shapes, gradients, logos — exported as
crisp PNG/SVG or served dynamic with editable destinations.

## Stack

- Next.js 15 (App Router, Turbopack) · TypeScript
- Tailwind CSS v4
- PostgreSQL + Prisma 6
- Custom SVG QR renderer (`qrcode-generator` for matrices)
- Session auth (httpOnly cookie, bcrypt hashes)

## Setup

```bash
npm install
cp .env.example .env        # set DATABASE_URL
npx prisma db push          # create schema
npm run db:seed             # optional demo data
npm run dev                 # http://localhost:3000
```

Demo account after seeding: `demo@lynk.to` / `lynkdemo`

## Environment

```
DATABASE_URL="postgresql://user:pass@localhost:5432/lynk"
```

## How it works

- `/{slug}` — short link redirect, records a CLICK event
- `/q/{slug}` — dynamic QR destination, records a SCAN event
- Events store browser / OS / device / referrer / country (from standard CDN geo
  headers), never IPs
- Static QRs encode data directly; dynamic QRs encode a LYNK URL bound to a hidden
  link row so artwork stays valid when the destination changes

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:seed` | Seed demo user + analytics |
