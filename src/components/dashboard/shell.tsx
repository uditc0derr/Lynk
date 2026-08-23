"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  Link2,
  LogOut,
  QrCode,
  Settings,
} from "lucide-react";
import { Wordmark, Mark } from "@/components/logo";
import { Avatar } from "@/components/ui/primitives";
import { api } from "@/lib/api";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/links", label: "My Links", icon: Link2 },
  { href: "/dashboard/qr", label: "QR Codes", icon: QrCode },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, item: (typeof NAV)[number]) {
  if (item.exact) return pathname === "/dashboard";
  return pathname.startsWith(item.href);
}

export function SidebarShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  };

  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex min-h-screen bg-zinc-50/60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[232px] flex-col border-r border-zinc-200 bg-white lg:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/" className="text-zinc-950">
            <Wordmark />
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 px-3" aria-label="Dashboard">
          {NAV.map((item) => {
            const active = isActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-9 items-center gap-2.5 rounded-lg px-3 text-[13.5px] font-medium transition-colors ${
                  active
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                }`}
              >
                <item.icon
                  className={`h-4 w-4 ${active ? "text-zinc-700" : "text-zinc-400"}`}
                  strokeWidth={2}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-100 p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <Avatar name={user.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-zinc-900">{firstName}</p>
              <p className="truncate text-xs text-zinc-400">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-1 flex h-8 w-full items-center gap-2.5 rounded-lg px-5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-800"
          >
            <LogOut className="h-3.5 w-3.5 text-zinc-400" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-[232px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:hidden">
          <Link href="/dashboard" className="text-zinc-950">
            <span className="inline-flex items-center gap-2">
              <Mark className="h-[22px] w-[22px]" />
              <span className="text-[16px] font-semibold tracking-tight">LYNK</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={logout}
            aria-label="Sign out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:max-w-6xl lg:px-10 lg:pb-16">
          {children}
        </main>
      </div>

      <nav
        aria-label="Dashboard mobile"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-zinc-200 bg-white/95 pb-[max(0px,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
      >
        {NAV.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition-colors ${
                active ? "text-zinc-900" : "text-zinc-400"
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 2} />
              {item.label === "My Links" ? "Links" : item.label === "QR Codes" ? "QR" : item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
