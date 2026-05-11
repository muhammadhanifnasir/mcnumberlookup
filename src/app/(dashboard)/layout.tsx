import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { requireDashboardSession } from "@/services/auth.service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardSession();

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <DashboardHeader />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
