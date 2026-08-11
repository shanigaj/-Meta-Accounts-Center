"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiKey,
  FiLogOut,
  FiMail,
  FiMonitor,
  FiShield,
  FiSmartphone,
} from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/shell/PageHeader";
import {
  useChangePassword,
  useLogoutAll,
  useRevokeSession,
  useSecurity,
  useSessions,
  useToggleTwoFactor,
  useVerifyEmail,
} from "@/hooks";
import { formatDateTime } from "@/lib/format";
import { fieldErrors } from "@/lib/form";
import { HttpError } from "@/lib/http";
import { changePasswordSchema } from "@/schemas";

export default function SecurityPage() {
  const { data: security } = useSecurity();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const changePassword = useChangePassword();
  const toggle2fa = useToggleTwoFactor();
  const revoke = useRevokeSession();
  const logoutAll = useLogoutAll();
  const verifyEmail = useVerifyEmail();
  const toast = useToast();
  const router = useRouter();

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    const parsed = changePasswordSchema.safeParse(pwd);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    try {
      await changePassword.mutateAsync(parsed.data);
      toast.success("Password changed.");
      setPwd({ currentPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err instanceof HttpError ? err.message : "Could not change password.");
    }
  }

  async function onToggle2fa(next: boolean) {
    try {
      await toggle2fa.mutateAsync(next);
      toast.success(next ? "Two-factor authentication enabled." : "Two-factor disabled.");
    } catch (err) {
      toast.error(err instanceof HttpError ? err.message : "Could not update.");
    }
  }

  async function onVerifyEmail() {
    try {
      await verifyEmail.mutateAsync();
      toast.success("Email verified.");
    } catch (err) {
      toast.error(err instanceof HttpError ? err.message : "Could not verify email.");
    }
  }

  async function onRevoke(id: string, isCurrent: boolean) {
    try {
      await revoke.mutateAsync(id);
      if (isCurrent) {
        router.replace("/login");
        return;
      }
      toast.success("Signed out of that session.");
    } catch (err) {
      toast.error(err instanceof HttpError ? err.message : "Could not sign out.");
    }
  }

  async function onLogoutAll() {
    try {
      await logoutAll.mutateAsync();
      router.replace("/login");
    } catch (err) {
      toast.error(err instanceof HttpError ? err.message : "Could not sign out.");
    }
  }

  return (
    <>
      <PageHeader title="Security" subtitle="Keep your account safe." />

      <div className="space-y-6">
        {/* Change password */}
        <Card>
          <CardHeader
            title="Change password"
            description="Use a strong password you don't reuse elsewhere."
            icon={<FiKey size={18} />}
          />
          <CardBody>
            <form
              onSubmit={onChangePassword}
              className="grid max-w-md gap-4"
              noValidate
            >
              <Field label="Current password" error={errors.currentPassword}>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={pwd.currentPassword}
                  onChange={(e) =>
                    setPwd({ ...pwd, currentPassword: e.target.value })
                  }
                />
              </Field>
              <Field
                label="New password"
                error={errors.newPassword}
                hint="At least 8 characters."
              >
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={pwd.newPassword}
                  onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                />
              </Field>
              <div>
                <Button type="submit" loading={changePassword.isPending}>
                  Update password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Two-factor */}
        <Card>
          <CardHeader
            title="Two-factor authentication"
            description="Add an extra layer of security at sign-in. (Mock)"
            icon={<FiShield size={18} />}
          />
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Status</span>
              {security?.twoFactorEnabled ? (
                <Badge tone="success">Enabled</Badge>
              ) : (
                <Badge tone="danger">Disabled</Badge>
              )}
            </div>
            <Switch
              checked={security?.twoFactorEnabled ?? false}
              onChange={onToggle2fa}
              disabled={toggle2fa.isPending}
              label="Toggle two-factor authentication"
            />
          </CardBody>
        </Card>

        {/* Email verification */}
        <Card>
          <CardHeader
            title="Email verification"
            description="Verify your email to secure your account. (Mock)"
            icon={<FiMail size={18} />}
          />
          <CardBody className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">Status</span>
              {security?.emailVerified ? (
                <Badge tone="success">Verified</Badge>
              ) : (
                <Badge tone="warning">Not verified</Badge>
              )}
            </div>
            {!security?.emailVerified && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onVerifyEmail}
                loading={verifyEmail.isPending}
              >
                Verify email
              </Button>
            )}
          </CardBody>
        </Card>

        {/* Active sessions */}
        <Card>
          <CardHeader
            title="Active sessions"
            description="Devices currently signed in to your account."
            icon={<FiMonitor size={18} />}
            action={
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmLogoutAll(true)}
              >
                <FiLogOut size={15} /> Sign out all
              </Button>
            }
          />
          <CardBody>
            {sessionsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {sessions?.map((s) => (
                  <li key={s.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-border/40 text-muted">
                      <FiSmartphone size={18} />
                    </span>
                    <div className="flex-1">
                      <p className="flex items-center gap-2 text-sm font-medium text-text">
                        {s.deviceName}
                        {s.isCurrent && <Badge tone="success">This device</Badge>}
                      </p>
                      <p className="text-xs text-muted">
                        {s.browser} · {s.os} · {s.ipAddress}
                      </p>
                      <p className="text-xs text-muted">
                        Active {formatDateTime(s.lastActiveAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevoke(s.id, s.isCurrent)}
                    >
                      {s.isCurrent ? "Sign out" : "Revoke"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        open={confirmLogoutAll}
        onClose={() => setConfirmLogoutAll(false)}
        title="Sign out of all devices?"
        description="You'll be signed out everywhere, including this device."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmLogoutAll(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onLogoutAll} loading={logoutAll.isPending}>
              Sign out all
            </Button>
          </>
        }
      />
    </>
  );
}
