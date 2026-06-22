import { Plus } from "lucide-react";
import TitleBar from "@/components/layout/TitleBar";
import { Button } from "@/components/ui/button";
import { getActions, getMasters, type ActionFilters as Filters } from "@/lib/data";
import { ActionsTable } from "@/components/actions/ActionsTable";
import { ActionFilters } from "@/components/actions/ActionFilters";
import { ActionFormSheet, type Masters } from "@/components/actions/ActionFormSheet";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ActionsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters: Filters = {
    q: str(sp.q),
    statusId: str(sp.statusId),
    departmentId: str(sp.departmentId),
    priorityId: str(sp.priorityId),
    meetingId: str(sp.meetingId),
    meetingType: str(sp.meetingType),
    overdueOnly: str(sp.overdue) === "1",
  };

  const [actions, mastersRaw] = await Promise.all([getActions(filters), getMasters()]);
  const masters: Masters = mastersRaw;

  return (
    <>
      <TitleBar title="Action Items">
        <ActionFormSheet
          masters={masters}
          trigger={
            <Button size="sm">
              <Plus /> Tambah
            </Button>
          }
        />
      </TitleBar>

      <div className="mb-3">
        <ActionFilters
          departments={masters.departments}
          priorities={masters.priorities}
          statuses={masters.statuses}
          meetings={masters.meetings}
        />
      </div>

      <div className="mb-2 text-xs text-muted-foreground">{actions.length} item</div>
      <ActionsTable actions={actions} masters={masters} />
    </>
  );
}
