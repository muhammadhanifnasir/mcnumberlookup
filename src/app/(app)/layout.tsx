import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileImportNav } from "@/components/layout/mobile-import-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
      <MobileImportNav />
    </div>
  );
}
