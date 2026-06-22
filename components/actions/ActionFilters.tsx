"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { MEETING_TYPES } from "@/lib/format";

type Option = { id: string; name: string };

export function ActionFilters({
  departments,
  priorities,
  statuses,
  meetings,
}: {
  departments: Option[];
  priorities: Option[];
  statuses: Option[];
  meetings: { id: string; date: Date; title: string | null }[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.push(`/actions?${next.toString()}`);
    },
    [params, router]
  );

  const cls =
    "h-8 rounded-md border border-border bg-background px-2 text-sm outline-none focus:border-ring";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="search"
        placeholder="Cari…"
        defaultValue={params.get("q") ?? ""}
        onKeyDown={(e) => {
          if (e.key === "Enter") setParam("q", (e.target as HTMLInputElement).value);
        }}
        className={cls + " w-44"}
      />
      <select value={params.get("statusId") ?? ""} onChange={(e) => setParam("statusId", e.target.value)} className={cls}>
        <option value="">Semua status</option>
        {statuses.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select value={params.get("departmentId") ?? ""} onChange={(e) => setParam("departmentId", e.target.value)} className={cls}>
        <option value="">Semua dept</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <select value={params.get("priorityId") ?? ""} onChange={(e) => setParam("priorityId", e.target.value)} className={cls}>
        <option value="">Semua prioritas</option>
        {priorities.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <select value={params.get("meetingType") ?? ""} onChange={(e) => setParam("meetingType", e.target.value)} className={cls}>
        <option value="">Semua tipe</option>
        {MEETING_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.short}</option>
        ))}
      </select>
      <select value={params.get("meetingId") ?? ""} onChange={(e) => setParam("meetingId", e.target.value)} className={cls}>
        <option value="">Semua meeting</option>
        {meetings.map((m) => (
          <option key={m.id} value={m.id}>
            {new Date(m.date).toISOString().slice(0, 10)}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-1.5 text-sm">
        <input
          type="checkbox"
          checked={params.get("overdue") === "1"}
          onChange={(e) => setParam("overdue", e.target.checked ? "1" : "")}
        />
        Overdue saja
      </label>
      {[...params.keys()].length > 0 && (
        <button
          onClick={() => router.push("/actions")}
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
        >
          Reset
        </button>
      )}
    </div>
  );
}
