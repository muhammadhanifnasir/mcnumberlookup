import Link from "next/link";
import { LayoutDashboard, Truck, Users } from "lucide-react";

const mobileItems = [
  { title: "Home", href: "/dashboard", icon: LayoutDashboard },
  { title: "Loads", href: "#", icon: Truck },
  { title: "Drivers", href: "#", icon: Users },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-2 backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {mobileItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex flex-col items-center justify-center rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground"
          >
            <item.icon className="mb-1 h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </div>
    </nav>
  );
}
