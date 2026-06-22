"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MeetingType } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { createMeeting, updateMeeting } from "@/lib/actions/meetings";
import { MEETING_TYPES, toDateInputValue } from "@/lib/format";

type MeetingData = {
  id: string;
  date: Date;
  title: string | null;
  type: MeetingType;
};

export function MeetingForm({
  trigger,
  meeting,
}: {
  trigger: React.ReactNode;
  meeting?: MeetingData;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const action = meeting ? updateMeeting.bind(null, meeting.id) : createMeeting;
  const [state, formAction, pending] = useActionState(action, { ok: false });

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  const inputCls =
    "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent side="right" className="w-full !max-w-sm p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>{meeting ? "Edit Meeting" : "Tambah Meeting"}</SheetTitle>
        </SheetHeader>
        <form action={formAction} className="space-y-4 px-5 py-4">
          <div className="space-y-1">
            <label className="text-xs font-medium">Tanggal Meeting <span className="text-destructive">*</span></label>
            <input type="date" name="date" required defaultValue={toDateInputValue(meeting?.date)} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Tipe Meeting</label>
            <select name="type" defaultValue={meeting?.type ?? "WSM"} className={inputCls}>
              {MEETING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Judul (opsional)</label>
            <input name="title" defaultValue={meeting?.title ?? ""} className={inputCls} placeholder="mis. Weekly Staff Meeting" />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
