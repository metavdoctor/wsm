import Link from "next/link";
import { Plus, ChevronRight, Pencil } from "lucide-react";
import { format } from "date-fns";
import TitleBar from "@/components/layout/TitleBar";
import { Button } from "@/components/ui/button";
import { getMeetings } from "@/lib/data";
import { meetingTypeMeta } from "@/lib/format";
import { MeetingForm } from "@/components/meetings/MeetingForm";
import { DeleteMeetingButton } from "@/components/meetings/DeleteMeetingButton";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const meetings = await getMeetings();

  return (
    <>
      <TitleBar title="Meetings">
        <MeetingForm
          trigger={
            <Button size="sm">
              <Plus /> Tambah Meeting
            </Button>
          }
        />
      </TitleBar>

      {meetings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          Belum ada meeting.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          {meetings.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border-b border-border/60 px-4 py-3 last:border-0 hover:bg-muted/40">
              <Link href={`/meetings/${m.id}`} className="flex flex-1 items-center gap-3">
                <div className="flex h-10 w-10 flex-col items-center justify-center rounded bg-[#2B4162] text-white">
                  <span className="text-[9px] uppercase leading-none">{format(m.date, "MMM")}</span>
                  <span className="text-sm font-bold leading-none">{format(m.date, "dd")}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{m.title ?? format(m.date, "EEEE, dd MMMM yyyy")}</span>
                    {(() => {
                      const meta = meetingTypeMeta(m.type);
                      return (
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: meta.bg, color: meta.fg }}
                        >
                          {meta.short}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="text-xs text-muted-foreground">{m._count.actions} action item</div>
                </div>
              </Link>
              <MeetingForm
                meeting={{ id: m.id, date: m.date, title: m.title, type: m.type }}
                trigger={
                  <Button variant="ghost" size="icon-sm" title="Edit meeting">
                    <Pencil />
                  </Button>
                }
              />
              <DeleteMeetingButton id={m.id} count={m._count.actions} />
              <ChevronRight className="size-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
