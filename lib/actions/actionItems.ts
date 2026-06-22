"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/guard";

const emptyToNull = (v: unknown) => (v === "" || v === undefined ? null : v);

const actionSchema = z.object({
  meetingId: z.string().optional().nullable(),
  meetingDate: z.preprocess(emptyToNull, z.string().nullable().optional()),
  seqNo: z.preprocess(
    (v) => (v === "" || v == null ? null : Number(v)),
    z.number().int().nullable().optional()
  ),
  presentingDeptId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  directionFrom: z.preprocess(emptyToNull, z.string().nullable().optional()),
  topic: z.preprocess(emptyToNull, z.string().nullable().optional()),
  description: z.string().min(1, "Action item wajib diisi"),
  typeId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  priorityId: z.preprocess(emptyToNull, z.string().nullable().optional()),
  picIds: z.array(z.string()).default([]),
  userUpdate: z.preprocess(emptyToNull, z.string().nullable().optional()),
  targetDate: z.preprocess(emptyToNull, z.string().nullable().optional()),
  targetDateText: z.preprocess(emptyToNull, z.string().nullable().optional()),
  statusId: z.string().min(1, "Status wajib diisi"),
  remarks: z.preprocess(emptyToNull, z.string().nullable().optional()),
});

export type ActionState = { ok: boolean; error?: string; id?: string };

function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

function readForm(formData: FormData) {
  return {
    meetingId: (formData.get("meetingId") as string) || null,
    meetingDate: (formData.get("meetingDate") as string) || null,
    seqNo: formData.get("seqNo"),
    presentingDeptId: formData.get("presentingDeptId"),
    directionFrom: formData.get("directionFrom"),
    topic: formData.get("topic"),
    description: (formData.get("description") as string) ?? "",
    typeId: formData.get("typeId"),
    priorityId: formData.get("priorityId"),
    picIds: formData.getAll("picIds").map(String).filter(Boolean),
    userUpdate: formData.get("userUpdate"),
    targetDate: formData.get("targetDate"),
    targetDateText: formData.get("targetDateText"),
    statusId: (formData.get("statusId") as string) ?? "",
    remarks: formData.get("remarks"),
  };
}

/** Resolve meetingId, creating a meeting from meetingDate when needed. */
async function resolveMeetingId(
  meetingId: string | null,
  meetingDate: string | null
): Promise<string> {
  if (meetingId) return meetingId;
  const d = parseDate(meetingDate);
  if (!d) throw new Error("Pilih meeting atau isi tanggal meeting");
  const existing = await prisma.meeting.findFirst({ where: { date: d } });
  if (existing) return existing.id;
  const created = await prisma.meeting.create({ data: { date: d } });
  return created.id;
}

export async function createAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await requireUser();
    const parsed = actionSchema.parse(readForm(formData));
    const meetingId = await resolveMeetingId(parsed.meetingId ?? null, parsed.meetingDate ?? null);

    let seqNo = parsed.seqNo ?? null;
    if (seqNo == null) {
      const max = await prisma.actionItem.aggregate({
        where: { meetingId },
        _max: { seqNo: true },
      });
      seqNo = (max._max.seqNo ?? 0) + 1;
    }

    const created = await prisma.actionItem.create({
      data: {
        meetingId,
        seqNo,
        presentingDeptId: parsed.presentingDeptId ?? null,
        directionFrom: parsed.directionFrom ?? null,
        topic: parsed.topic ?? null,
        description: parsed.description,
        typeId: parsed.typeId ?? null,
        priorityId: parsed.priorityId ?? null,
        userUpdate: parsed.userUpdate ?? null,
        targetDate: parseDate(parsed.targetDate),
        targetDateText: parsed.targetDateText ?? null,
        statusId: parsed.statusId,
        remarks: parsed.remarks ?? null,
        pics: { connect: parsed.picIds.map((id) => ({ id })) },
      },
    });

    revalidatePaths();
    return { ok: true, id: created.id };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function updateAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireUser();
    const parsed = actionSchema.parse(readForm(formData));
    const meetingId = await resolveMeetingId(parsed.meetingId ?? null, parsed.meetingDate ?? null);

    await prisma.actionItem.update({
      where: { id },
      data: {
        meetingId,
        seqNo: parsed.seqNo ?? undefined,
        presentingDeptId: parsed.presentingDeptId ?? null,
        directionFrom: parsed.directionFrom ?? null,
        topic: parsed.topic ?? null,
        description: parsed.description,
        typeId: parsed.typeId ?? null,
        priorityId: parsed.priorityId ?? null,
        userUpdate: parsed.userUpdate ?? null,
        targetDate: parseDate(parsed.targetDate),
        targetDateText: parsed.targetDateText ?? null,
        statusId: parsed.statusId,
        remarks: parsed.remarks ?? null,
        pics: { set: parsed.picIds.map((pid) => ({ id: pid })) },
      },
    });

    revalidatePaths();
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function deleteAction(id: string): Promise<ActionState> {
  try {
    await requireAdmin();
    await prisma.actionItem.delete({ where: { id } });
    revalidatePaths();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

function revalidatePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/actions");
  revalidatePath("/meetings");
}

function errMsg(e: unknown): string {
  if (e instanceof z.ZodError) return e.issues.map((i) => i.message).join(", ");
  if (e instanceof Error) return e.message;
  return "Terjadi kesalahan";
}
