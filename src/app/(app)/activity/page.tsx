"use client";

import { useState } from "react";
import { FiActivity, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shell/PageHeader";
import { useActivity } from "@/hooks";
import { formatDateTime } from "@/lib/format";
import { ACTIVITY_FILTERS, ACTIVITY_META } from "@/lib/meta";
import type { ActivityType } from "@/lib/types";

export default function ActivityPage() {
  const [filter, setFilter] = useState<ActivityType | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const { data, isFetching } = useActivity(filter, page);

  function changeFilter(value: ActivityType | "ALL") {
    setFilter(value);
    setPage(1);
  }

  const items = data?.items ?? [];

  return (
    <>
      <PageHeader
        title="Activity"
        subtitle="A log of recent actions on your account."
        action={
          <div className="w-52">
            <Select
              value={filter}
              onChange={(e) => changeFilter(e.target.value as ActivityType | "ALL")}
            >
              {ACTIVITY_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      <Card>
        <CardHeader
          title="History"
          icon={<FiActivity size={18} />}
          action={
            data ? (
              <span className="text-sm text-muted">{data.total} events</span>
            ) : null
          }
        />
        <CardBody>
          {isFetching && !data ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<FiActivity size={20} />}
              title="No activity found"
              description="Try a different filter, or come back after using the app."
            />
          ) : (
            <ul className="divide-y divide-border">
              {items.map((a) => {
                const meta = ACTIVITY_META[a.type];
                const Icon = meta.icon;
                return (
                  <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                      <Icon size={16} />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text">{meta.label}</p>
                      <p className="text-xs text-muted">
                        {a.deviceName} · {a.browser} · {a.ipAddress}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-muted">
                      {formatDateTime(a.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {data && data.total > data.pageSize && (
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm text-muted">
                Page {data.page} of {Math.ceil(data.total / data.pageSize)}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <FiChevronLeft size={15} /> Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!data.hasMore || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <FiChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
