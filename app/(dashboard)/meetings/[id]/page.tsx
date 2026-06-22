import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { format } from "date-fns";
import TitleBar from "@/components/layout/TitleBar";
import { Button } from "@/components/ui/button";
import { getMeeting, getMasters } from "@/lib/data";
import { meetingTypeMeta } from "@/lib/format";
import { ActionsTable } from "@/components/actions/ActionsTable";
import { ActionFormSheet, type Masters } from "@/components/actions/ActionFormSheet";

export const dynamic = "force-dynamic";

export default async function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [meeting, mastersRaw] = await Promise.all([getMeeting(id), getMasters()]);
  if (!meeting) notFound();
  const masters: Masters = mastersRaw;

  return (
    <>
      <TitleBar title={meeting.title ?? format(meeting.date, "dd MMM yyyy")}>
        <ActionFormSheet
          masters={masters}
          defaultMeetingId={meeting.id}
          trigger={
            <Button size="sm">
              <Plus /> Tambah Action
            </Button>
          }
        />
      </TitleBar>

      <div className="mb-3 flex items-center justify-between">
        <Link href="/meetings" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Kembali ke daftar meeting
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {(() => {
            const meta = meetingTypeMeta(meeting.type);
            return (
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: meta.bg, color: meta.fg }}
              >
                {meta.label}
              </span>
            );
          })()}
          <span>{format(meeting.date, "EEEE, dd MMMM yyyy")} · {meeting.actions.length} action item</span>
        </div>
      </div>

      <ActionsTable actions={meeting.actions} masters={masters} showMeeting={false} />
    </>
  );
}
