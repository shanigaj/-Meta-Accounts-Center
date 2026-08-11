"use client";

import Link from "next/link";
import {
  FiActivity,
  FiChevronRight,
  FiLink,
  FiShield,
  FiSmartphone,
} from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shell/PageHeader";
import { useDashboard } from "@/hooks";
import { ACTIVITY_META, PROVIDERS } from "@/lib/meta";
import { formatDate, timeAgo } from "@/lib/format";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <>
        <PageHeader title="Dashboard" subtitle="Loading your overview…" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </>
    );
  }

  const { user, security, connectedAccounts, devices, recentActivity } = data;
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's a snapshot of your account."
      />

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={<FiShield />}
          label="Security score"
          value={`${security.score}%`}
          accent={security.score >= 75 ? "success" : "warning"}
        >
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className={
                security.score >= 75 ? "h-full bg-success" : "h-full bg-warning"
              }
              style={{ width: `${security.score}%` }}
            />
          </div>
        </Stat>
        <Stat
          icon={<FiLink />}
          label="Connected accounts"
          value={String(connectedAccounts.length)}
        />
        <Stat
          icon={<FiSmartphone />}
          label="Active devices"
          value={String(devices.length)}
        />
        <Stat
          icon={<FiShield />}
          label="Two-factor auth"
          value={security.twoFactorEnabled ? "On" : "Off"}
          accent={security.twoFactorEnabled ? "success" : "danger"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Profile summary */}
        <Card className="lg:col-span-1">
          <CardHeader title="Your profile" />
          <CardBody className="flex flex-col items-center text-center">
            <Avatar name={user.name} src={user.avatarUrl} size={72} />
            <p className="mt-3 font-semibold text-text">{user.name}</p>
            <p className="text-sm text-muted">{user.email}</p>
            <Badge tone="brand" className="mt-3">
              {user.role === "ADMIN" ? "Administrator" : "Member"}
            </Badge>
            <p className="mt-4 text-xs text-muted">
              Joined {formatDate(user.createdAt)}
            </p>
            <Link
              href="/profile"
              className="mt-4 text-sm font-medium text-brand hover:underline"
            >
              Edit profile
            </Link>
          </CardBody>
        </Card>

        {/* Connected accounts */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Connected accounts"
            icon={<FiLink size={18} />}
            action={<SeeAll href="/accounts" />}
          />
          <CardBody>
            {connectedAccounts.length === 0 ? (
              <EmptyState
                icon={<FiLink size={20} />}
                title="No accounts connected"
                description="Link Facebook, Instagram or WhatsApp to see them here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {connectedAccounts.map((acc) => {
                  const meta = PROVIDERS[acc.provider];
                  const Icon = meta.icon;
                  return (
                    <li key={acc.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <Icon size={22} style={{ color: meta.color }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text">{meta.label}</p>
                        <p className="text-xs text-muted">@{acc.providerUsername}</p>
                      </div>
                      <span className="text-xs text-muted">
                        {formatDate(acc.connectedAt)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent activity"
            icon={<FiActivity size={18} />}
            action={<SeeAll href="/activity" />}
          />
          <CardBody>
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={<FiActivity size={20} />}
                title="Nothing here yet"
                description="Your account activity will show up as you use the app."
              />
            ) : (
              <ul className="space-y-3">
                {recentActivity.map((a) => {
                  const meta = ACTIVITY_META[a.type];
                  const Icon = meta.icon;
                  return (
                    <li key={a.id} className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-border/40 text-muted">
                        <Icon size={16} />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm text-text">{meta.label}</p>
                        <p className="text-xs text-muted">
                          {a.deviceName} · {a.browser}
                        </p>
                      </div>
                      <span className="text-xs text-muted">{timeAgo(a.createdAt)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Devices */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Devices"
            icon={<FiSmartphone size={18} />}
            action={<SeeAll href="/devices" />}
          />
          <CardBody>
            <ul className="space-y-3">
              {devices.slice(0, 4).map((d) => (
                <li key={d.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-text">{d.deviceName}</p>
                    {d.isCurrent && <Badge tone="success">This device</Badge>}
                  </div>
                  <p className="text-xs text-muted">{d.browser}</p>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: "success" | "warning" | "danger";
  children?: React.ReactNode;
}) {
  const accentClass =
    accent === "success"
      ? "text-success"
      : accent === "warning"
        ? "text-warning"
        : accent === "danger"
          ? "text-danger"
          : "text-text";
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{label}</span>
          <span className="text-muted">{icon}</span>
        </div>
        <p className={`mt-2 text-2xl font-bold ${accentClass}`}>{value}</p>
        {children}
      </CardBody>
    </Card>
  );
}

function SeeAll({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-0.5 text-sm font-medium text-brand hover:underline"
    >
      See all <FiChevronRight size={15} />
    </Link>
  );
}
