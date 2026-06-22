/**
 * Seed master data + import the legacy Excel tracker (docs/excelref.xlsx).
 * Idempotent: masters are upserted; meetings/actions are wiped and re-imported.
 *
 * Run: npx prisma db seed   (or: npm run db:seed)
 */
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

// ---- master seed definitions -------------------------------------------------

const PRIORITIES = [
  { name: "High", rank: 1, color: "#dc2626" },
  { name: "Medium", rank: 2, color: "#d97706" },
  { name: "Low", rank: 3, color: "#16a34a" },
];

const STATUSES = [
  { name: "Open", isClosed: false, color: "#2563eb", order: 1 },
  { name: "Closed", isClosed: true, color: "#16a34a", order: 2 },
];

const ACTION_TYPES = [
  { name: "Follow-up", order: 1 },
  { name: "Decision", order: 2 },
  { name: "Information", order: 3 },
  { name: "Presentation", order: 4 },
];

// Official department master (display order). Source-data abbreviations are
// mapped onto these via DEPT_MAP below; unmapped names are auto-created.
const DEPARTMENTS = [
  "Budget & Reporting",
  "Business Process & Technology",
  "Commercial & Planning",
  "Drilling, Completion & Well Intervention",
  "Engineering & Asset Integrity",
  "Executive",
  "Finance, Accounting & Tax",
  "Health, Safety, Security & Environment",
  "HR & General Affairs",
  "Internal Audit & Compliance",
  "Jakarta Corporate Affairs & Performance",
  "Legal",
  "Logistic",
  "Maintenance",
  "Marketing",
  "Operations",
  "Planning, Bidding & Reporting",
  "Procurement",
  "Production 3M & MAC",
  "Production 4M",
  "Production BD",
  "Project",
  "Regional Office & Relations",
  "Subsurface",
  "Supply Chain Management",
];

// Excel abbreviation / compound -> official department name(s). A single cell
// may expand to several official departments (split compounds). Names not
// listed here are kept as-is (auto-created) for manual cleanup later.
const DEPT_MAP: Record<string, string[]> = {
  "4M": ["Production 4M"],
  "and E&AI": ["Engineering & Asset Integrity"],
  "and IAC": ["Internal Audit & Compliance"],
  "and Subsurface": ["Subsurface"],
  "B&R": ["Budget & Reporting"],
  BD: ["Production BD"],
  "BP&T": ["Business Process & Technology"],
  "BPT/FAT/B&R": ["Business Process & Technology", "Finance, Accounting & Tax", "Budget & Reporting"],
  "C&P": ["Commercial & Planning"],
  "C&P and Prod. BD": ["Commercial & Planning", "Production BD"],
  DCWi: ["Drilling, Completion & Well Intervention"],
  DCWI: ["Drilling, Completion & Well Intervention"],
  "E&AI": ["Engineering & Asset Integrity"],
  "E&AI/Production 4M": ["Engineering & Asset Integrity", "Production 4M"],
  "Engineering & Project": ["Engineering & Asset Integrity"],
  FAT: ["Finance, Accounting & Tax"],
  "FAT/Marketing": ["Finance, Accounting & Tax", "Marketing"],
  Finance: ["Finance, Accounting & Tax"],
  General: ["HR & General Affairs"],
  HRGA: ["HR & General Affairs"],
  HSSE: ["Health, Safety, Security & Environment"],
  "HSSE - Security": ["Health, Safety, Security & Environment"],
  "HSSE and HRGA": ["Health, Safety, Security & Environment", "HR & General Affairs"],
  "HSSE and Logistics": ["Health, Safety, Security & Environment", "Logistic"],
  "HSSE/BPT": ["Health, Safety, Security & Environment", "Business Process & Technology"],
  "HSSE/Logistics": ["Health, Safety, Security & Environment", "Logistic"],
  "HSSE/Production 4M": ["Health, Safety, Security & Environment", "Production 4M"],
  IAC: ["Internal Audit & Compliance"],
  JCAP: ["Jakarta Corporate Affairs & Performance"],
  Logistics: ["Logistic"],
  "Logistics & HSSE": ["Logistic", "Health, Safety, Security & Environment"],
  "Logistics and Procurement": ["Logistic", "Procurement"],
  "Maintenance and E&AI": ["Maintenance", "Engineering & Asset Integrity"],
  "ManCom Secretary": ["Executive"],
  "Marketing/ Operations": ["Marketing", "Operations"],
  Operation: ["Operations"],
  "Operations + B&R": ["Operations", "Budget & Reporting"],
  "Operations)": ["Operations"],
  PBR: ["Planning, Bidding & Reporting"],
  "Prod 4M and Maintenance": ["Production 4M", "Maintenance"],
  "Production 4M and B&R": ["Production 4M", "Budget & Reporting"],
  "Production BD and DCWI": ["Production BD", "Drilling, Completion & Well Intervention"],
  "Project/Procurement": ["Project", "Procurement"],
  "PSC Extension Team (C&P and Subsurface)": ["Commercial & Planning", "Subsurface"],
  Relations: ["Regional Office & Relations"],
  "ROR/Legal": ["Regional Office & Relations", "Legal"],
  "SMTF (Subsurface": ["Subsurface"],
  "Subsurface and C&P": ["Subsurface", "Commercial & Planning"],
};

// ---- helpers -----------------------------------------------------------------

function clean(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).replace(/\r/g, "").trim();
}

function isBlank(v: unknown): boolean {
  return clean(v) === "";
}

// SheetJS can return date-only cells a few seconds off (e.g. 23:59:48 of the
// previous day). Round to the nearest local day, then store as UTC midnight so
// the calendar day is preserved regardless of timezone.
function toUTCMidnight(d: Date): Date {
  const rounded = new Date(d.getTime() + 12 * 60 * 60 * 1000);
  return new Date(
    Date.UTC(rounded.getFullYear(), rounded.getMonth(), rounded.getDate())
  );
}

async function main() {
  // 1) Masters --------------------------------------------------------------
  for (const p of PRIORITIES) {
    await prisma.priority.upsert({
      where: { name: p.name },
      update: { rank: p.rank, color: p.color },
      create: p,
    });
  }
  for (const s of STATUSES) {
    await prisma.status.upsert({
      where: { name: s.name },
      update: { isClosed: s.isClosed, color: s.color, order: s.order },
      create: s,
    });
  }
  for (const t of ACTION_TYPES) {
    await prisma.actionType.upsert({
      where: { name: t.name },
      update: { order: t.order },
      create: t,
    });
  }
  for (let i = 0; i < DEPARTMENTS.length; i++) {
    const name = DEPARTMENTS[i];
    await prisma.department.upsert({
      where: { name },
      update: { order: i + 1 },
      create: { name, order: i + 1 },
    });
  }

  const openStatus = await prisma.status.findUniqueOrThrow({ where: { name: "Open" } });
  const closedStatus = await prisma.status.findUniqueOrThrow({ where: { name: "Closed" } });

  // department cache / get-or-create
  const deptCache = new Map<string, string>();
  async function deptId(name: string): Promise<string> {
    const key = name.trim();
    if (deptCache.has(key)) return deptCache.get(key)!;
    const dep = await prisma.department.upsert({
      where: { name: key },
      update: {},
      create: { name: key },
    });
    deptCache.set(key, dep.id);
    return dep.id;
  }

  // Resolve a raw cell (may be comma-separated and/or a mapped abbreviation)
  // into a deduped list of official department ids.
  async function resolveDeptIds(raw: string): Promise<string[]> {
    const ids: string[] = [];
    const seen = new Set<string>();
    for (const piece of raw.split(",")) {
      const name = piece.trim();
      if (!name || name === "-") continue;
      const mapped = DEPT_MAP[name];
      const names = mapped && mapped.length ? mapped : [name];
      for (const n of names) {
        const id = await deptId(n);
        if (!seen.has(id)) {
          seen.add(id);
          ids.push(id);
        }
      }
    }
    return ids;
  }

  // 2) Read Excel -----------------------------------------------------------
  const xlsxPath = path.join(process.cwd(), "docs", "excelref.xlsx");
  const wb = XLSX.readFile(xlsxPath, { cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    blankrows: true,
    defval: null,
  });

  // Column indexes (0-based)
  const C = {
    no: 0,
    date: 1,
    presentingDept: 2,
    direction: 3,
    topic: 4,
    action: 5,
    type: 6,
    priority: 7,
    userUpdate: 8,
    pic: 9,
    targetDate: 10,
    status: 11,
    remarks: 12,
  };

  // Wipe existing core data for a clean re-import
  await prisma.actionItem.deleteMany({});
  await prisma.meeting.deleteMany({});

  // meeting cache by ISO date
  const meetingCache = new Map<string, string>();
  async function meetingId(date: Date): Promise<string> {
    const key = date.toISOString().slice(0, 10);
    if (meetingCache.has(key)) return meetingCache.get(key)!;
    const m = await prisma.meeting.create({ data: { date } });
    meetingCache.set(key, m.id);
    return m.id;
  }

  let lastActionId: string | null = null;
  let imported = 0;

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    if (!row) continue;
    const noCell = row[C.no];
    const hasNo = typeof noCell === "number" || /^\d+$/.test(clean(noCell));

    if (hasNo) {
      // New action item
      const dateVal = row[C.date];
      if (!(dateVal instanceof Date)) continue; // skip header/garbage rows
      const mId = await meetingId(toUTCMidnight(dateVal));

      const statusText = clean(row[C.status]).toLowerCase();
      const statusId = statusText.startsWith("close") ? closedStatus.id : openStatus.id;

      // target date: real Date -> targetDate; otherwise fuzzy text
      let targetDate: Date | null = null;
      let targetDateText: string | null = null;
      const tv = row[C.targetDate];
      if (tv instanceof Date) targetDate = toUTCMidnight(tv);
      else if (!isBlank(tv)) targetDateText = clean(tv);

      // PICs (comma-separated, mapped to official departments)
      const picIds = await resolveDeptIds(clean(row[C.pic]));

      // Presenting department (single; first mapped official dept)
      const presentingIds = await resolveDeptIds(clean(row[C.presentingDept]));
      const presentingDeptId = presentingIds[0] ?? null;

      const created = await prisma.actionItem.create({
        data: {
          seqNo: typeof noCell === "number" ? noCell : parseInt(clean(noCell), 10),
          meetingId: mId,
          presentingDeptId,
          directionFrom: clean(row[C.direction]) || null,
          topic: clean(row[C.topic]) || null,
          description: clean(row[C.action]),
          userUpdate: clean(row[C.userUpdate]) || null,
          targetDate,
          targetDateText,
          statusId,
          remarks: clean(row[C.remarks]) || null,
          pics: picIds.length ? { connect: picIds.map((id) => ({ id })) } : undefined,
        },
      });
      lastActionId = created.id;
      imported++;
    } else if (lastActionId) {
      // Continuation row: append extra Action Item / User Update / Remarks
      // lines to the previous item (Excel wraps long content across rows).
      const extraDesc = clean(row[C.action]);
      const extraUpdate = clean(row[C.userUpdate]);
      const extraRemarks = clean(row[C.remarks]);
      if (!extraDesc && !extraUpdate && !extraRemarks) continue;

      const current = await prisma.actionItem.findUnique({ where: { id: lastActionId } });
      if (!current) continue;
      await prisma.actionItem.update({
        where: { id: lastActionId },
        data: {
          description: extraDesc
            ? [current.description, extraDesc].filter(Boolean).join("\n")
            : current.description,
          userUpdate: extraUpdate
            ? [current.userUpdate, extraUpdate].filter(Boolean).join("\n")
            : current.userUpdate,
          remarks: extraRemarks
            ? [current.remarks, extraRemarks].filter(Boolean).join("\n")
            : current.remarks,
        },
      });
    }
  }

  // Cleanup: drop non-official departments left with zero references (orphans
  // from earlier imports / mapping changes). Official ones are always kept.
  const officialSet = new Set(DEPARTMENTS);
  const allDepts = await prisma.department.findMany({
    include: { _count: { select: { presentingFor: true, picFor: true } } },
  });
  for (const d of allDepts) {
    if (officialSet.has(d.name)) continue;
    if (d._count.presentingFor + d._count.picFor === 0) {
      await prisma.department.delete({ where: { id: d.id } });
    }
  }

  const meetings = await prisma.meeting.count();
  console.log(`Seed done: ${meetings} meetings, ${imported} action items imported.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
