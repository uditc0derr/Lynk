import Link from "next/link";
import { Mark } from "@/components/logo";

const NAV_LINKS = [
  { href: "/#qr-studio", label: "QR Studio" },
  { href: "/#dynamic", label: "Dynamic QR" },
  { href: "/#links", label: "Link management" },
  { href: "/#analytics", label: "Analytics" },
];

export function SiteNav({ authed = false }: { authed?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-[60px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 text-zinc-950">
            <Mark className="h-[26px] w-[26px]" />
            <span className="text-[17px] font-semibold tracking-tight">LYNK</span>
          </Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[13.5px] font-medium text-zinc-500 transition-colors hover:text-zinc-900"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          {authed ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:bg-zinc-700"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-9 items-center rounded-lg px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:bg-zinc-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileNavLinks() {
  return (
    <nav className="flex flex-col divide-y divide-zinc-100" aria-label="Mobile">
      {NAV_LINKS.map((l) => (
        <a key={l.href} href={l.href} className="py-3 text-sm font-medium text-zinc-600">
          {l.label}
        </a>
      ))}
    </nav>
  );
}
