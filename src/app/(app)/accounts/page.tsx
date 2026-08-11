"use client";

import { useState } from "react";
import { FiLink, FiPlus, FiTrash2 } from "react-icons/fi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/shell/PageHeader";
import { useAccounts, useConnectAccount, useRemoveAccount } from "@/hooks";
import { formatDate } from "@/lib/format";
import { HttpError } from "@/lib/http";
import { ALL_PROVIDERS, PROVIDERS } from "@/lib/meta";
import type { ConnectedAccount, Provider } from "@/lib/types";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();
  const connect = useConnectAccount();
  const remove = useRemoveAccount();
  const toast = useToast();

  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState<Provider>("FACEBOOK");
  const [username, setUsername] = useState("");
  const [toRemove, setToRemove] = useState<ConnectedAccount | null>(null);

  async function onConnect(e: React.FormEvent) {
    e.preventDefault();
    if (username.trim().length < 2) {
      toast.error("Enter a valid username.");
      return;
    }
    try {
      await connect.mutateAsync({ provider, providerUsername: username.trim() });
      toast.success(`${PROVIDERS[provider].label} connected.`);
      setConnecting(false);
      setUsername("");
    } catch (err) {
      toast.error(err instanceof HttpError ? err.message : "Could not connect.");
    }
  }

  async function onRemove() {
    if (!toRemove) return;
    try {
      await remove.mutateAsync(toRemove.id);
      toast.success("Account removed.");
    } catch (err) {
      toast.error(err instanceof HttpError ? err.message : "Could not remove.");
    } finally {
      setToRemove(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Connected accounts"
        subtitle="Link social accounts to your profile."
        action={
          <Button onClick={() => setConnecting(true)}>
            <FiPlus size={16} /> Connect account
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonCard />
      ) : (
        <Card>
          <CardHeader title="Linked accounts" icon={<FiLink size={18} />} />
          <CardBody>
            {!accounts || accounts.length === 0 ? (
              <EmptyState
                icon={<FiLink size={20} />}
                title="No connected accounts"
                description="Connect Facebook, Instagram or WhatsApp to get started."
                action={
                  <Button onClick={() => setConnecting(true)}>
                    <FiPlus size={16} /> Connect account
                  </Button>
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {accounts.map((acc) => {
                  const meta = PROVIDERS[acc.provider];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={acc.id}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <span
                        className="grid h-11 w-11 place-items-center rounded-xl"
                        style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                      >
                        <Icon size={22} />
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-text">{meta.label}</p>
                        <p className="text-sm text-muted">@{acc.providerUsername}</p>
                      </div>
                      <Badge tone="success">Connected</Badge>
                      <span className="hidden text-xs text-muted sm:block">
                        {formatDate(acc.connectedAt)}
                      </span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setToRemove(acc)}
                      >
                        <FiTrash2 size={15} />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      {/* Connect modal */}
      <Modal
        open={connecting}
        onClose={() => setConnecting(false)}
        title="Connect an account"
        description="These are mock providers — no real login happens."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConnecting(false)}>
              Cancel
            </Button>
            <Button onClick={onConnect} loading={connect.isPending}>
              Connect
            </Button>
          </>
        }
      >
        <form onSubmit={onConnect} className="space-y-4">
          <Field label="Provider">
            <Select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
            >
              {ALL_PROVIDERS.map((p) => (
                <option key={p} value={p}>
                  {PROVIDERS[p].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Username">
            <Input
              placeholder="your_handle"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field>
        </form>
      </Modal>

      {/* Remove confirm */}
      <Modal
        open={!!toRemove}
        onClose={() => setToRemove(null)}
        title="Remove connected account?"
        description={
          toRemove
            ? `This will unlink your ${PROVIDERS[toRemove.provider].label} account.`
            : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setToRemove(null)}>
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
