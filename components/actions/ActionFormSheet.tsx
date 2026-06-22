"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { createAction, updateAction, type ActionState } from "@/lib/actions/actionItems";
import { toDateInputValue } from "@/lib/format";

type Option = { id: string; name: string };
type StatusOption = { id: string; name: string };

export type ActionFormData = {
  id: string;
  meetingId: string;
  seqNo: number | null;
  presentingDeptId: string | null;
  directionFrom: string | null;
  topic: string | null;
  description: string;
  typeId: string | null;
  priorityId: string | null;
  userUpdate: string | null;
  targetDate: Date | null;
  targetDateText: string | null;
  statusId: string;
  remarks: string | null;
  pics: { id: string }[];
};

export type Masters = {
  departments: Option[];
  types: Option[];
  priorities: Option[];
  statuses: StatusOption[];
  meetings: { id: string; date: Date; title: string | null }[];
};

export function ActionFormSheet({
  masters,
  action,
  trigger,
  defaultMeetingId,
}: {
  masters: Masters;
  action?: ActionFormData;
  trigger: React.ReactNode;
  defaultMeetingId?: string;
}) {
  const isEdit = !!action;
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const bound = isEdit ? updateAction.bind(null, action!.id) : createAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    bound,
    { ok: false }
  );

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  const picIds = new Set(action?.pics.map((p) => p.id) ?? []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={trigger as React.ReactElement} />
      <SheetContent side="right" className="w-full !max-w-lg p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle>{isEdit ? "Edit Action Item" : "Tambah Action Item"}</SheetTitle>
        </SheetHeader>

        <form action={formAction} className="flex h-full flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {/* Meeting */}
            <Field label="Meeting" required>
              <select
                name="meetingId"
                defaultValue={action?.meetingId ?? defaultMeetingId ?? ""}
                className={selectCls}
              >
                <option value="">— pilih meeting / pakai tanggal —</option>
                {masters.meetings.map((m) => (
                  <option key={m.id} value={m.id}>
                    {new Date(m.date).toISOString().slice(0, 10)}
                    {m.title ? ` · ${m.title}` : ""}
                  </option>
                ))}
              </select>
              <input
                type="date"
                name="meetingDate"
                className={inputCls + " mt-2"}
                placeholder="atau tanggal meeting baru"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="No. urut">
                <input
                  type="number"
                  name="seqNo"
                  defaultValue={action?.seqNo ?? ""}
                  className={inputCls}
                  placeholder="auto"
                />
              </Field>
              <Field label="Status" required>
                <select name="statusId" defaultValue={action?.statusId ?? firstId(masters.statuses)} className={selectCls}>
                  {masters.statuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Presenting Department">
              <select name="presentingDeptId" defaultValue={action?.presentingDeptId ?? ""} className={selectCls}>
                <option value="">—</option>
                {masters.departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Direction / Recommendation From">
              <input name="directionFrom" defaultValue={action?.directionFrom ?? ""} className={inputCls} />
            </Field>

            <Field label="Topic">
              <input name="topic" defaultValue={action?.topic ?? ""} className={inputCls} />
            </Field>

            <Field label="Action Item" required>
              <textarea name="description" defaultValue={action?.description ?? ""} rows={3} className={inputCls} required />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Type">
                <select name="typeId" defaultValue={action?.typeId ?? ""} className={selectCls}>
                  <option value="">—</option>
                  {masters.types.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select name="priorityId" defaultValue={action?.priorityId ?? ""} className={selectCls}>
                  <option value="">—</option>
                  {masters.priorities.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="PIC (boleh lebih dari satu)">
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {masters.departments.map((d) => (
                  <label key={d.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="picIds" value={d.id} defaultChecked={picIds.has(d.id)} />
                    {d.name}
                  </label>
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Target Date">
                <input type="date" name="targetDate" defaultValue={toDateInputValue(action?.targetDate)} className={inputCls} />
              </Field>
              <Field label="Target (teks bebas)">
                <input
                  name="targetDateText"
                  defaultValue={action?.targetDateText ?? ""}
                  className={inputCls}
                  placeholder="mis. Q2 2026"
                />
              </Field>
            </div>

            <Field label="User Update">
              <textarea name="userUpdate" defaultValue={action?.userUpdate ?? ""} rows={3} className={inputCls} />
            </Field>

            <Field label="Remarks">
              <textarea name="remarks" defaultValue={action?.remarks ?? ""} rows={2} className={inputCls} />
            </Field>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan…" : "Simpan"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function firstId(arr: { id: string }[]): string {
  return arr[0]?.id ?? "";
}

const inputCls =
  "w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";
const selectCls = inputCls + " h-9";
