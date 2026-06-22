"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, BarChart2, FileText, Settings, Info } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

// TODO: Keep in sync with Sidebar.tsx navItems
const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/settings", icon: Settings, label: "Settings" },
  { href: "/about", icon: Info, label: "About" },
];

export default function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="lg:hidden p-1.5 rounded"
        style={{ color: "#2B4162" }}
        onClick={() => setOpen(true)}
      >
        <Menu size={20} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="p-0 w-60 border-0"
          style={{ backgroundColor: "#2B4162" }}
          showCloseButton={false}
        >
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

          {/* Header */}
          <div
            className="h-[52px] flex items-center justify-between px-5"
            style={{ borderBottom: "3px solid #D7B377" }}
          >
            <span className="text-white font-bold text-xl tracking-widest">MASTER TEMPLATE</span>
            <button onClick={() => setOpen(false)}>
              <X size={18} className="text-white/70" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors",
                    isActive
                      ? "bg-white/15 text-white border-l-2 border-[#D7B377]"
                      : "text-white/70 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
