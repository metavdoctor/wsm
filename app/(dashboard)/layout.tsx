import Sidebar from "@/components/layout/Sidebar";
import Toolbar from "@/components/layout/Toolbar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { MainArea } from "@/components/layout/MainArea";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#E9E9E9]">
        <Sidebar />
        <Toolbar />
        <MainArea>{children}</MainArea>
      </div>
    </SidebarProvider>
  );
}
