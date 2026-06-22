"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  CalendarDays,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/actions", icon: ListChecks, label: "Action Items" },
  { href: "/meetings", icon: CalendarDays, label: "Meetings" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={`hidden lg:flex fixed left-0 top-0 h-screen z-40 flex-col transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
      style={{ backgroundColor: "#2B4162" }}
    >
      {/* Logo + toggle */}
      <div className="h-[49px] flex items-center px-3 gap-2 overflow-hidden">
        {collapsed ? (
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        ) : (
          <>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <span className="text-white font-bold text-xl tracking-widest leading-tight">WSM TRACKER</span>
              <span className="text-[9px] leading-tight tracking-wide whitespace-nowrap" style={{ color: "#D7B377" }}>
                Weekly Staff Meeting · Action Tracker
              </span>
            </div>
            <button
              onClick={toggle}
              className="shrink-0 text-white/40 hover:text-white transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </>
        )}
      </div>

      {/* Gold divider */}
      <div className="h-[3px]" style={{ backgroundColor: "#D7B377" }} />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1 overflow-hidden">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={[
                "flex items-center rounded text-sm transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-white/15 text-white border-l-2 border-[#D7B377]"
                  : "text-white/70 hover:text-white hover:bg-white/10",
              ].join(" ")}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
