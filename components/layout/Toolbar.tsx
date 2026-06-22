import { Suspense } from "react";
import { auth } from "@/lib/auth";
import MobileSidebar from "./MobileSidebar";
import UserMenu from "./UserMenu";
import SubBar from "./SubBar";
import { ToolbarShell } from "./ToolbarShell";

export default async function Toolbar() {
  const session = await auth();

  const date = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ToolbarShell>
      {/* Row 1: App title + account menu */}
      <div
        className="h-[52px] flex items-center justify-between px-4 lg:px-5"
        style={{ backgroundColor: "#FEFEFE", borderBottom: "3px solid #D7B377" }}
      >
        <div className="flex items-center gap-2">
          <MobileSidebar />
          <div className="flex flex-col">
            <span className="font-semibold text-xs sm:text-sm leading-tight" style={{ color: "#2B4162" }}>
              <span className="hidden md:inline">WSM Action Tracker</span>
              <span className="md:hidden">WSM TRACKER</span>
            </span>
            <span className="hidden md:inline text-[10px] leading-tight italic" style={{ color: "#8F754F" }}>
              Weekly Staff Meeting · Action Monitoring
            </span>
          </div>
        </div>
        {session?.user && (
          <UserMenu
            name={session.user.name ?? "User"}
            email={session.user.email ?? ""}
          />
        )}
      </div>

      {/* Row 2: Date sub-bar */}
      <div
        className="h-[36px] flex items-center justify-end px-4 lg:px-5"
        style={{ backgroundColor: "#1e3550" }}
      >
        <Suspense fallback={<span className="text-xs text-white/70">{date}</span>}>
          <SubBar date={date} />
        </Suspense>
      </div>
    </ToolbarShell>
  );
}
