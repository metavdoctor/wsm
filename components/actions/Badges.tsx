import { AlertTriangle } from "lucide-react";

function pill(color: string | null | undefined, fallback: string) {
  const c = color || fallback;
  return { backgroundColor: `${c}22`, color: c, borderColor: `${c}55` };
}

export function StatusBadge({ status }: { status: { name: string; color: string | null; isClosed: boolean } }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={pill(status.color, status.isClosed ? "#16a34a" : "#2563eb")}
    >
      {status.name}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: { name: string; color: string | null } | null }) {
  if (!priority) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={pill(priority.color, "#6b7280")}
    >
      {priority.name}
    </span>
  );
}

export function OverdueBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold"
      style={pill("#dc2626", "#dc2626")}
    >
      <AlertTriangle className="size-3" />
      Overdue
    </span>
  );
}

export function TypePill({ type }: { type: { name: string } | null }) {
  if (!type) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
      {type.name}
    </span>
  );
}
