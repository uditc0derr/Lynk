import Link from "next/link";
import { Mark } from "@/components/logo";
import { Wordmark } from "@/components/logo";

const FOOTER_COLS = [
  {
    title: "Product",
    links: ["Short links", "QR Studio", "Dynamic QR codes", "Analytics"],
  },
  {
    title: "Use cases",
    links: ["Restaurants & menus", "Events", "Packaging", "Print campaigns"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
];

export function DynamicExplainer() {
  const steps = [
    {
      n: "01",
      title: "Point the QR at a LYNK link",
      body: "The printed code encodes a short lynk.to URL — not your final destination.",
    },
    {
      n: "02",
      title: "Change where it leads, anytime",
      body: "Update the destination in your dashboard. The printed code never changes.",
    },
    {
      n: "03",
      title: "Measure every scan",
      body: "Each scan is recorded — device, browser, referrer and rough region.",
    },
  ];
  return (
    <ol className="grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
      {steps.map((s) => (
        <li key={s.n} className="bg-white p-6">
          <span className="font-mono text-xs font-medium text-accent">{s.n}</span>
          <h3 className="mt-3 text-[15px] font-semibold tracking-tight text-zinc-900">
            {s.title}
          </h3>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-zinc-500">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function FinalCta({ authed = false }: { authed?: boolean }) {
  return (
    <div id="cta" className="border-t border-zinc-200 bg-zinc-50/60">
      <div className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8">
        <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight text-zinc-950 sm:text-[44px] sm:leading-[1.08]">
          Your next link deserves a proper home.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-zinc-500">
          Shorten it, design its QR, watch it travel. Free while you find your footing.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          {authed ? (
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center rounded-lg bg-zinc-900 px-6 text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:bg-zinc-700"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className="inline-flex h-11 items-center rounded-lg bg-zinc-900 px-6 text-[15px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:bg-zinc-700"
              >
                Create free account
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-lg border border-zinc-300 bg-white px-5 text-[15px] font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-white"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] sm:px-8">
        <div>
          <Wordmark className="text-zinc-950" />
          <p className="mt-3 max-w-[26ch] text-[13px] leading-relaxed text-zinc-500">
            Link management and a QR design studio, built for the modern web.
          </p>
        </div>
        {FOOTER_COLS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
              {col.title}
            </p>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <span className="cursor-pointer text-[13.5px] text-zinc-600 transition-colors hover:text-zinc-950">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-zinc-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <p className="flex items-center gap-1.5 text-[13px] text-zinc-400">
            <Mark className="h-4 w-4" />
            © {new Date().getFullYear()} LYNK
          </p>
          <p className="text-[13px] text-zinc-400">
            Privacy-first analytics · No cookies on tracked links
          </p>
        </div>
      </div>
    </footer>
  );
}
