import Link from "next/link";
import { LayoutDashboard, Truck, Users, FileSpreadsheet } from "lucide-react";

import { APP_NAME } from "@/utils/constants";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Loads", href: "#", icon: Truck },
  { title: "Drivers", href: "#", icon: Users },
  { title: "Invoices", href: "#", icon: FileSpreadsheet },
];

export function DashboardSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="border-b border-sidebar-border px-6 py-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{APP_NAME}</p>
        <h1 className="mt-2 text-lg font-semibold text-white">Operations Hub</h1>
      </div>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
