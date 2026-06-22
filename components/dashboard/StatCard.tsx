import Link from "next/link";

export function StatCard({
  label,
  value,
  accent = "#2B4162",
  href,
  hint,
}: {
  label: string;
  value: number | string;
  accent?: string;
  href?: string;
  hint?: string;
}) {
  const inner = (
    <div className="relative overflow-hidden rounded-lg border border-border bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: accent }} />
      <div className="pl-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-bold" style={{ color: accent }}>{value}</div>
        {hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export function BreakdownBar({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number; color?: string | null }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#2B4162]">{title}</div>
      <div className="space-y-2">
        {rows.length === 0 && <div className="text-sm text-muted-foreground">Tidak ada data.</div>}
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <div className="w-28 shrink-0 truncate text-xs text-foreground" title={r.label}>{r.label}</div>
            <div className="h-4 flex-1 overflow-hidden rounded bg-muted">
              <div
                className="h-full rounded"
                style={{ width: `${(r.value / max) * 100}%`, backgroundColor: r.color || "#385F71" }}
              />
            </div>
            <div className="w-7 shrink-0 text-right text-xs font-medium text-foreground">{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
