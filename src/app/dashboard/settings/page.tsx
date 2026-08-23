import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { SettingsForms } from "@/components/dashboard/settings-forms";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-zinc-950">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your profile, security and workspace.
        </p>
      </div>

      <section className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-card">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
          <Globe className="h-4.5 w-4.5 text-zinc-500" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-zinc-900">
            Short domain · lynk.to
          </p>
          <p className="text-[13px] text-zinc-400">
            Your links and dynamic QR codes resolve on this domain.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Active
        </span>
      </section>

      <SettingsForms
        initialName={user.name}
        email={user.email}
        memberSince={formatDate(user.createdAt)}
      />
    </div>
  );
}
