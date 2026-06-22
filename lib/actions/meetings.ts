"use server";

import { revalidatePath } from "next/cache";
import { MeetingType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/guard";

type Result = { ok: boolean; error?: string; id?: string };

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

function parseType(s: FormDataEntryValue | null): MeetingType {
  return typeof s === "string" && s in MeetingType ? (s as MeetingType) : MeetingType.WSM;
}

export async function createMeeting(_prev: Result, formData: FormData): Promise<Result> {
  try {
    await requireUser();
    const date = parseDate(formData.get("date") as string);
    if (!date) return { ok: false, error: "Tanggal meeting tidak valid" };
    const title = ((formData.get("title") as string) || "").trim() || null;
    const type = parseType(formData.get("type"));
    const m = await prisma.meeting.create({ data: { date, title, type } });
    revalidatePath("/meetings");
    revalidatePath("/dashboard");
    return { ok: true, id: m.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function updateMeeting(id: string, _prev: Result, formData: FormData): Promise<Result> {
  try {
    await requireUser();
    const date = parseDate(formData.get("date") as string);
    const title = ((formData.get("title") as string) || "").trim() || null;
    const type = parseType(formData.get("type"));
    await prisma.meeting.update({
      where: { id },
      data: { ...(date ? { date } : {}), title, type },
    });
    revalidatePath("/meetings");
    revalidatePath(`/meetings/${id}`);
    return { ok: true, id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}

export async function deleteMeeting(id: string): Promise<Result> {
  try {
    await requireAdmin();
    await prisma.meeting.delete({ where: { id } });
    revalidatePath("/meetings");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error" };
  }
}
