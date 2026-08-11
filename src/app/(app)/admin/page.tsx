"use client";

import { FiLock, FiUsers } from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/shell/PageHeader";
import { useAdminUsers, useMe } from "@/hooks";
import { formatDate } from "@/lib/format";

export default function AdminPage() {
  const { data: me } = useMe();
  const isAdmin = me?.role === "ADMIN";
  const { data: users, isLoading } = useAdminUsers(isAdmin);

  // Non-admins never see the data — the API would 403 anyway, but we guard the
  // UI too so the page is honest about who it's for.
  if (me && !isAdmin) {
    return (
      <>
        <PageHeader title="Admin" />
        <EmptyState
          icon={<FiLock size={20} />}
          title="Admins only"
          description="You don't have permission to view this page."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Admin"
        subtitle="Manage all accounts on the platform."
      />

      <Card>
        <CardHeader
          title="All users"
          icon={<FiUsers size={18} />}
          action={
            users ? (
              <span className="text-sm text-muted">{users.length} users</span>
            ) : null
          }
        />
        <CardBody>
          {isLoading || !users ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Email</th>
                    <th className="pb-2 pr-4 font-medium">Role</th>
                    <th className="pb-2 pr-4 font-medium">Accounts</th>
                    <th className="pb-2 pr-4 font-medium">Sessions</th>
                    <th className="pb-2 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium text-text">{u.name}</td>
                      <td className="py-3 pr-4 text-muted">{u.email}</td>
                      <td className="py-3 pr-4">
                        <Badge tone={u.role === "ADMIN" ? "brand" : "neutral"}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-muted">{u._count.connectedAccounts}</td>
                      <td className="py-3 pr-4 text-muted">{u._count.sessions}</td>
                      <td className="py-3 text-muted">{formatDate(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </>
  );
}
