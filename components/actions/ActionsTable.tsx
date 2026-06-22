import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isOverdue, targetDisplay, meetingTypeMeta } from "@/lib/format";
import type { ActionWithRelations } from "@/lib/data";
import { StatusBadge, PriorityBadge, OverdueBadge, TypePill } from "./Badges";
import { ActionFormSheet, type Masters, type ActionFormData } from "./ActionFormSheet";
import { DeleteActionButton } from "./DeleteActionButton";

function toFormData(a: ActionWithRelations): ActionFormData {
  return {
    id: a.id,
    meetingId: a.meetingId,
    seqNo: a.seqNo,
    presentingDeptId: a.presentingDeptId,
    directionFrom: a.directionFrom,
    topic: a.topic,
    description: a.description,
    typeId: a.typeId,
    priorityId: a.priorityId,
    userUpdate: a.userUpdate,
    targetDate: a.targetDate,
    targetDateText: a.targetDateText,
    statusId: a.statusId,
    remarks: a.remarks,
    pics: a.pics.map((p) => ({ id: p.id })),
  };
}

export function ActionsTable({
  actions,
  masters,
  showMeeting = true,
}: {
  actions: ActionWithRelations[];
  masters: Masters;
  showMeeting?: boolean;
}) {
  if (actions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
        Belum ada action item.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <table className="w-full min-w-[980px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-[#F3F4F6] text-left text-[11px] uppercase tracking-wide text-[#2B4162]">
            <th className="px-3 py-2 font-semibold">No</th>
            {showMeeting && <th className="px-3 py-2 font-semibold">Meeting</th>}
            <th className="px-3 py-2 font-semibold">Topic / Action</th>
            <th className="px-3 py-2 font-semibold">Dept</th>
            <th className="px-3 py-2 font-semibold">PIC</th>
            <th className="px-3 py-2 font-semibold">Type / Pri</th>
            <th className="px-3 py-2 font-semibold">Target</th>
            <th className="px-3 py-2 font-semibold">Status</th>
            <th className="px-3 py-2 font-semibold">Update / Remarks</th>
            <th className="px-3 py-2 font-semibold"></th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a) => {
            const overdue = isOverdue(a);
            return (
              <tr key={a.id} className="border-b border-border/60 align-top hover:bg-muted/40">
                <td className="px-3 py-2 text-muted-foreground">{a.seqNo ?? "—"}</td>
                {showMeeting && (
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-muted-foreground">
                    <div>{new Date(a.meeting.date).toISOString().slice(0, 10)}</div>
                    {(() => {
                      const meta = meetingTypeMeta(a.meeting.type);
                      return (
                        <span
                          className="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: meta.bg, color: meta.fg }}
                        >
                          {meta.short}
                        </span>
                      );
                    })()}
                  </td>
                )}
                <td className="px-3 py-2 max-w-sm">
                  {a.topic && <div className="text-[11px] font-medium uppercase text-[#8F754F]">{a.topic}</div>}
                  <div className="whitespace-pre-line text-foreground">{a.description}</div>
                  {a.directionFrom && (
                    <div className="mt-0.5 text-[11px] text-muted-foreground">Dir: {a.directionFrom}</div>
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">{a.presentingDept?.name ?? "—"}</td>
                <td className="px-3 py-2 text-xs">
                  {a.pics.length ? a.pics.map((p) => p.name).join(", ") : "—"}
                </td>
                <td className="px-3 py-2 space-y-1">
                  <TypePill type={a.type} />
                  <div><PriorityBadge priority={a.priority} /></div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-xs">{targetDisplay(a)}</td>
                <td className="px-3 py-2 space-y-1 whitespace-nowrap">
                  <StatusBadge status={a.status} />
                  {overdue && <div><OverdueBadge /></div>}
                </td>
                <td className="px-3 py-2 max-w-xs text-xs text-muted-foreground">
                  {a.userUpdate && <div className="whitespace-pre-line">{a.userUpdate}</div>}
                  {a.remarks && (
                    <div className="mt-1 whitespace-pre-line text-[#8F754F]">{a.remarks}</div>
                  )}
                  {!a.userUpdate && !a.remarks && "—"}
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-1">
                    <ActionFormSheet
                      masters={masters}
                      action={toFormData(a)}
                      trigger={
                        <Button variant="ghost" size="icon-sm" title="Edit">
                          <Pencil />
                        </Button>
                      }
                    />
                    <DeleteActionButton id={a.id} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
