"use client";

import { ReactNode } from "react";
import { useSidebar } from "./SidebarContext";

export function ToolbarShell({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <header
      className={`fixed top-0 right-0 z-50 shadow-sm left-0 transition-all duration-300 ${
        collapsed ? "lg:left-16" : "lg:left-60"
      }`}
    >
      {children}
    </header>
  );
}
