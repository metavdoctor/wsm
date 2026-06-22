import TitleBar from "@/components/layout/TitleBar";
import { auth } from "@/lib/auth";
import { getMasters } from "@/lib/data";
import { MasterSection } from "@/components/settings/MasterSection";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  if (!isAdmin) {
    return (
      <>
        <TitleBar title="Settings" />
        <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          Halaman pengaturan master data hanya untuk Admin.
        </div>
      </>
    );
  }

  const { departments, types, priorities, statuses } = await getMasters();

  return (
    <>
      <TitleBar title="Settings — Master Data" />
      <p className="mb-3 text-sm text-muted-foreground">
        Kelola pilihan dropdown yang dipakai pada form action item.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <MasterSection kind="status" title="Status" items={statuses} />
        <MasterSection kind="priority" title="Priority" items={priorities} />
        <MasterSection kind="department" title="Department / PIC" items={departments} />
        <MasterSection kind="type" title="Action Type" items={types} />
      </div>
    </>
  );
}
