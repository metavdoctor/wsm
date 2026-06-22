"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

type Result = { ok: boolean; error?: string };
export type MasterKind = "department" | "type" | "priority" | "status";

function num(v: FormDataEntryValue | null, def = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function createMaster(kind: MasterKind, _prev: Result, formData: FormData): Promise<Result> {
  try {
    await requireAdmin();
    const name = ((formData.get("name") as string) || "").trim();
    if (!name) return { ok: false, error: "Nama wajib diisi" };

    if (kind === "department") {
      await prisma.department.create({ data: { name, order: num(formData.get("order")) } });
    } else if (kind === "type") {
      await prisma.actionType.create({ data: { name, order: num(formData.get("order")) } });
    } else if (kind === "priority") {
      await prisma.priority.create({
        data: { name, rank: num(formData.get("rank")), color: (formData.get("color") as string) || null },
      });
    } else if (kind === "status") {
      await prisma.status.create({
        data: {
          name,
          isClosed: formData.get("isClosed") === "on",
          color: (formData.get("color") as string) || null,
          order: num(formData.get("order")),
        },
      });
    }
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: dup(e) };
  }
}

export async function updateMaster(
  kind: MasterKind,
  id: string,
  _prev: Result,
  formData: FormData
): Promise<Result> {
  try {
    await requireAdmin();
    const name = ((formData.get("name") as string) || "").trim();
    if (!name) return { ok: false, error: "Nama wajib diisi" };

    if (kind === "department") {
      await prisma.department.update({ where: { id }, data: { name, order: num(formData.get("order")) } });
    } else if (kind === "type") {
      await prisma.actionType.update({ where: { id }, data: { name, order: num(formData.get("order")) } });
    } else if (kind === "priority") {
      await prisma.priority.update({
        where: { id },
        data: { name, rank: num(formData.get("rank")), color: (formData.get("color") as string) || null },
      });
    } else if (kind === "status") {
      await prisma.status.update({
        where: { id },
        data: {
          name,
          isClosed: formData.get("isClosed") === "on",
          color: (formData.get("color") as string) || null,
          order: num(formData.get("order")),
        },
      });
    }
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: dup(e) };
  }
}

export async function deleteMaster(kind: MasterKind, id: string): Promise<Result> {
  try {
    await requireAdmin();
    if (kind === "department") await prisma.department.delete({ where: { id } });
    else if (kind === "type") await prisma.actionType.delete({ where: { id } });
    else if (kind === "priority") await prisma.priority.delete({ where: { id } });
    else if (kind === "status") await prisma.status.delete({ where: { id } });
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: inUse(e) };
  }
}

function dup(e: unknown): string {
  const msg = e instanceof Error ? e.message : "Error";
  if (msg.includes("Unique constraint")) return "Nama sudah dipakai";
  return msg;
}

function inUse(e: unknown): string {
  const msg = e instanceof Error ? e.message : "Error";
  if (msg.includes("Foreign key")) return "Tidak bisa dihapus: masih dipakai action item";
  return msg;
}
