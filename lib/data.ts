import { prisma } from "@/lib/prisma";
import { todayUTC } from "@/lib/format";
import { Prisma, MeetingType } from "@prisma/client";

export const actionInclude = {
  meeting: true,
  presentingDept: true,
  type: true,
  priority: true,
  status: true,
  pics: true,
} satisfies Prisma.ActionItemInclude;

export type ActionWithRelations = Prisma.ActionItemGetPayload<{
  include: typeof actionInclude;
}>;

export type ActionFilters = {
  q?: string;
  statusId?: string;
  departmentId?: string;
  priorityId?: string;
  meetingId?: string;
  meetingType?: string;
  overdueOnly?: boolean;
};

export async function getActions(filters: ActionFilters = {}): Promise<ActionWithRelations[]> {
  const where: Prisma.ActionItemWhereInput = {};

  if (filters.statusId) where.statusId = filters.statusId;
  if (filters.priorityId) where.priorityId = filters.priorityId;
  if (filters.meetingId) where.meetingId = filters.meetingId;
  if (filters.meetingType && filters.meetingType in MeetingType) {
    where.meeting = { type: filters.meetingType as MeetingType };
  }
  if (filters.departmentId) {
    where.OR = [
      { presentingDeptId: filters.departmentId },
      { pics: { some: { id: filters.departmentId } } },
    ];
  }
  if (filters.q) {
    const q = filters.q;
    where.AND = [
      {
        OR: [
          { description: { contains: q, mode: "insensitive" } },
          { topic: { contains: q, mode: "insensitive" } },
          { userUpdate: { contains: q, mode: "insensitive" } },
          { remarks: { contains: q, mode: "insensitive" } },
        ],
      },
    ];
  }
  if (filters.overdueOnly) {
    where.status = { isClosed: false };
    where.targetDate = { lt: todayUTC() };
  }

  return prisma.actionItem.findMany({
    where,
    include: actionInclude,
    orderBy: [{ meeting: { date: "desc" } }, { seqNo: "asc" }],
  });
}

export async function getAction(id: string) {
  return prisma.actionItem.findUnique({ where: { id }, include: actionInclude });
}

export async function getMeetings() {
  return prisma.meeting.findMany({
    orderBy: { date: "desc" },
    include: { _count: { select: { actions: true } } },
  });
}

export async function getMeeting(id: string) {
  return prisma.meeting.findUnique({
    where: { id },
    include: {
      actions: { include: actionInclude, orderBy: { seqNo: "asc" } },
    },
  });
}

export async function getMasters() {
  const [departments, types, priorities, statuses, meetings] = await Promise.all([
    prisma.department.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.actionType.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.priority.findMany({ orderBy: { rank: "asc" } }),
    prisma.status.findMany({ orderBy: { order: "asc" } }),
    prisma.meeting.findMany({ orderBy: { date: "desc" } }),
  ]);
  return { departments, types, priorities, statuses, meetings };
}

export async function getDashboardStats() {
  const today = todayUTC();

  const [total, statusCounts, overdue, byPriority, byDept, upcoming] = await Promise.all([
    prisma.actionItem.count(),
    prisma.status.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, isClosed: true, color: true, _count: { select: { actions: true } } },
    }),
    prisma.actionItem.count({
      where: { status: { isClosed: false }, targetDate: { lt: today } },
    }),
    prisma.priority.findMany({
      orderBy: { rank: "asc" },
      select: { id: true, name: true, color: true, _count: { select: { actions: true } } },
    }),
    prisma.department.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        _count: { select: { presentingFor: true } },
      },
    }),
    prisma.actionItem.findMany({
      where: { status: { isClosed: false }, targetDate: { gte: today } },
      include: { status: true, priority: true, meeting: true },
      orderBy: { targetDate: "asc" },
      take: 8,
    }),
  ]);

  const open = statusCounts.filter((s) => !s.isClosed).reduce((n, s) => n + s._count.actions, 0);
  const closed = statusCounts.filter((s) => s.isClosed).reduce((n, s) => n + s._count.actions, 0);

  return {
    total,
    open,
    closed,
    overdue,
    statusCounts,
    byPriority,
    byDept: byDept.filter((d) => d._count.presentingFor > 0),
    upcoming,
  };
}
