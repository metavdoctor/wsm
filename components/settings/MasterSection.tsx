"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createMaster,
  updateMaster,
  deleteMaster,
  type MasterKind,
} from "@/lib/actions/masters";

type Item = {
  id: string;
  name: string;
  order?: number;
  rank?: number;
  color?: string | null;
  isClosed?: boolean;
};

const inputCls =
  "rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

export function MasterSection({
  kind,
  title,
  items,
}: {
  kind: MasterKind;
  title: string;
  items: Item[];
}) {
  const hasColor = kind === "priority" || kind === "status";
  const hasClosed = kind === "status";
  const numField = kind === "priority" ? "rank" : "order";

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="border-b border-border px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#2B4162]">
        {title}
      </div>

      <div className="divide-y divide-border/60">
        {items.map((it) => (
          <RowForm
            key={it.id}
            kind={kind}
            item={it}
            hasColor={hasColor}
            hasClosed={hasClosed}
            numField={numField}
          />
        ))}
        {items.length === 0 && (
          <div className="px-4 py-3 text-sm text-muted-foreground">Belum ada data.</div>
        )}
      </div>

      <AddForm kind={kind} hasColor={hasColor} hasClosed={hasClosed} numField={numField} />
    </div>
  );
}

function RowForm({
  kind,
  item,
  hasColor,
  hasClosed,
  numField,
}: {
  kind: MasterKind;
  item: Item;
  hasColor: boolean;
  hasClosed: boolean;
  numField: "order" | "rank";
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateMaster.bind(null, kind, item.id),
    { ok: false }
  );
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state, router]);

  const numVal = numField === "rank" ? item.rank ?? 0 : item.order ?? 0;

  async function onDelete() {
    if (!confirm(`Hapus "${item.name}"?`)) return;
    const res = await deleteMaster(kind, item.id);
    if (!res.ok) alert(res.error ?? "Gagal");
    else router.refresh();
  }

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2 px-4 py-2">
      <input name="name" defaultValue={item.name} className={inputCls + " min-w-40 flex-1"} />
      <input
        name={numField}
        type="number"
        defaultValue={numVal}
        title={numField}
        className={inputCls + " w-16"}
      />
      {hasColor && <input name="color" type="color" defaultValue={item.color ?? "#385F71"} className="h-7 w-10 rounded border border-border" />}
      {hasClosed && (
        <label className="flex items-center gap-1 text-xs">
          <input name="isClosed" type="checkbox" defaultChecked={item.isClosed} /> closed
        </label>
      )}
      <Button type="submit" size="icon-sm" variant="ghost" disabled={pending} title="Simpan">
        <Save />
      </Button>
      <Button type="button" size="icon-sm" variant="ghost" onClick={onDelete} title="Hapus">
        <Trash2 className="text-destructive" />
      </Button>
      {state.error && <span className="w-full text-xs text-destructive">{state.error}</span>}
    </form>
  );
}

function AddForm({
  kind,
  hasColor,
  hasClosed,
  numField,
}: {
  kind: MasterKind;
  hasColor: boolean;
  hasClosed: boolean;
  numField: "order" | "rank";
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    createMaster.bind(null, kind),
    { ok: false }
  );
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-4 py-2">
      <input name="name" placeholder="Nama baru…" required className={inputCls + " min-w-40 flex-1"} />
      <input name={numField} type="number" defaultValue={0} title={numField} className={inputCls + " w-16"} />
      {hasColor && <input name="color" type="color" defaultValue="#385F71" className="h-7 w-10 rounded border border-border" />}
      {hasClosed && (
        <label className="flex items-center gap-1 text-xs">
          <input name="isClosed" type="checkbox" /> closed
        </label>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        <Plus /> Tambah
      </Button>
      {state.error && <span className="w-full text-xs text-destructive">{state.error}</span>}
    </form>
  );
}
