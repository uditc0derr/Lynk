import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { SidebarShell } from "@/components/dashboard/shell";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · LYNK" },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <SidebarShell user={{ name: user.name, email: user.email }}>
      <AutoRefresh />
      {children}
    </SidebarShell>
  );
}
