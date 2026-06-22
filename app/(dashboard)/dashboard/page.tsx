import TitleBar from "@/components/layout/TitleBar";
import { StatCard, BreakdownBar } from "@/components/dashboard/StatCard";
import { getDashboardStats } from "@/lib/data";
import { targetDisplay } from "@/lib/format";
import { StatusBadge, PriorityBadge } from "@/components/actions/Badges";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const s = await getDashboardStats();

  return (
    <>
      <TitleBar title="Dashboard" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Action" value={s.total} accent="#2B4162" href="/actions" />
        <StatCard label="Open" value={s.open} accent="#2563eb" hint="belum selesai" />
        <StatCard label="Closed" value={s.closed} accent="#16a34a" />
        <StatCard label="Overdue" value={s.overdue} accent="#dc2626" href="/actions?overdue=1" hint="lewat target & open" />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <BreakdownBar
          title="Per Priority"
          rows={s.byPriority.map((p) => ({ label: p.name, value: p._count.actions, color: p.color }))}
        />
        <BreakdownBar
          title="Per Presenting Department"
          rows={s.byDept.map((d) => ({ label: d.name, value: d._count.presentingFor }))}
        />
      </div>

      <div className="mt-4 rounded-lg border border-border bg-white">
        <div className="border-b border-border px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#2B4162]">
          Target Terdekat (Open)
        </div>
        {s.upcoming.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">Tidak ada target tanggal mendatang.</div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {s.upcoming.map((a) => (
                <tr key={a.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2 whitespace-nowrap text-xs text-muted-foreground">{targetDisplay(a)}</td>
                  <td className="px-4 py-2"><PriorityBadge priority={a.priority} /></td>
                  <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-2 text-foreground">
                    <Link href={`/meetings/${a.meetingId}`} className="hover:underline">
                      {a.description.slice(0, 80)}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
