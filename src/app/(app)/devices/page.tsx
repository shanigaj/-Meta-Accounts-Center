"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiMonitor, FiSmartphone, FiTrash2 } from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/shell/PageHeader";
import { useDevices, useRemoveDevice } from "@/hooks";
import { formatDateTime } from "@/lib/format";
import { HttpError } from "@/lib/http";
import type { SessionInfo } from "@/lib/types";

export default function DevicesPage() {
  const { data: devices, isLoading } = useDevices();
  const remove = useRemoveDevice();
  const toast = useToast();
  const router = useRouter();
  const [target, setTarget] = useState<SessionInfo | null>(null);

  async function onRemove() {
    if (!target) return;
    try {
      await remove.mutateAsync(target.id);
      if (target.isCurrent) {
        router.replace("/login");
        return;
      }
      toast.success("Device removed.");
    } catch (err) {
      toast.error(err instanceof HttpError ? err.message : "Could not remove device.");
    } finally {
      setTarget(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Devices"
        subtitle="Manage devices that are signed in to your account."
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : !devices || devices.length === 0 ? (
        <EmptyState
          icon={<FiMonitor size={20} />}
          title="No active devices"
          description="Signed-in devices will appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {devices.map((d) => {
            const isPhone = /phone|tablet/i.test(d.deviceName);
            return (
              <Card key={d.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                      {isPhone ? <FiSmartphone size={20} /> : <FiMonitor size={20} />}
                    </span>
                    {d.isCurrent && <Badge tone="success">This device</Badge>}
                  </div>

                  <p className="mt-3 font-semibold text-text">{d.deviceName}</p>
                  <dl className="mt-2 space-y-1 text-sm text-muted">
                    <Row label="Browser" value={d.browser} />
                    <Row label="OS" value={d.os} />
                    <Row label="IP address" value={d.ipAddress} />
                    <Row label="Signed in" value={formatDateTime(d.createdAt)} />
                    <Row label="Last active" value={formatDateTime(d.lastActiveAt)} />
                  </dl>

                  <Button
                    variant="danger"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => setTarget(d)}
                  >
                    <FiTrash2 size={15} /> {d.isCurrent ? "Sign out" : "Remove device"}
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Remove this device?"
        description={
          target?.isCurrent
            ? "This is the device you're using — you'll be signed out."
            : "This device will be signed out of your account."
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onRemove} loading={remove.isPending}>
              Remove
            </Button>
          </>
        }
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{label}</dt>
      <dd className="truncate text-text">{value}</dd>
    </div>
  );
}
