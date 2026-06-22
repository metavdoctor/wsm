import { format } from "date-fns";
import type { MeetingType } from "@prisma/client";

/** Display label + badge colors per meeting type (from the cadence guidelines). */
export const MEETING_TYPES: {
  value: MeetingType;
  label: string;
  short: string;
  bg: string;
  fg: string;
}[] = [
  { value: "WSM", label: "Weekly Staff Meeting", short: "WSM", bg: "#EEF2F8", fg: "#2B4162" },
  { value: "GM_DECISION", label: "Decision-Making with GM", short: "GM Decision", bg: "#FBF1DD", fg: "#8A6A1F" },
  { value: "AD_HOC", label: "Urgent / Ad Hoc", short: "Ad Hoc", bg: "#FBE6E6", fg: "#A02C2C" },
];

export function meetingTypeMeta(t: MeetingType) {
  return MEETING_TYPES.find((m) => m.value === t) ?? MEETING_TYPES[0];
}

export function todayUTC(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

export type OverdueInput = {
  targetDate: Date | null;
  status: { isClosed: boolean };
};

/** Overdue = not closed AND has a real target date in the past. */
export function isOverdue(a: OverdueInput): boolean {
  if (a.status.isClosed) return false;
  if (!a.targetDate) return false;
  return a.targetDate.getTime() < todayUTC().getTime();
}

/** Human display for a target: real date -> formatted; else the fuzzy text. */
export function targetDisplay(a: {
  targetDate: Date | null;
  targetDateText: string | null;
}): string {
  if (a.targetDate) return format(a.targetDate, "dd MMM yyyy");
  return a.targetDateText?.trim() || "—";
}

export function formatDate(d: Date | null | undefined): string {
  return d ? format(d, "dd MMM yyyy") : "—";
}

/** Parse a yyyy-mm-dd form value into a UTC-midnight Date (or null). */
export function parseDateInput(v: FormDataEntryValue | null): Date | null {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

/** Format a UTC-midnight Date as yyyy-mm-dd for <input type="date">. */
export function toDateInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}
