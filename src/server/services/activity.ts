import { prisma } from "@/lib/prisma";
import type { ActivityType } from "@prisma/client";

const PAGE_SIZE = 15;

// Paginated activity feed with an optional type filter. Returns enough to drive
// a "load more" button and an empty state.
export async function listActivity(
  userId: string,
  opts: { page?: number; type?: ActivityType } = {}
) {
  const page = Math.max(1, opts.page ?? 1);
  const where = { userId, ...(opts.type ? { type: opts.type } : {}) };

  const [items, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return {
    items,
    page,
    pageSize: PAGE_SIZE,
    total,
    hasMore: page * PAGE_SIZE < total,
  };
}
