"use client";

import { usePathname } from "next/navigation";

// Add page-specific tab arrays here as needed:
// const EXAMPLE_TABS = [{ id: "tab1", label: "Tab 1" }, ...];

export default function SubBar({ date }: { date: string }) {
  const pathname = usePathname();

  // Example: show tabs on specific pages, date elsewhere
  // if (pathname === "/some-page") {
  //   return <TabsComponent />;
  // }

  void pathname;

  return (
    <span className="text-xs text-white/70 whitespace-nowrap">{date}</span>
  );
}
