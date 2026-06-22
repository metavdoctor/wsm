"use client";

import { ReactNode } from "react";
import { useSidebar } from "./SidebarContext";

export function MainArea({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <main
      className={`ml-0 mt-[88px] p-4 lg:p-6 min-h-[calc(100vh-88px)] transition-all duration-300 ${
        collapsed ? "lg:ml-16" : "lg:ml-60"
      }`}
    >
      {children}
    </main>
  );
}
