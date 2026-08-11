"use client";

import { FiEye } from "react-icons/fi";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/shell/PageHeader";
import { usePrivacy, useUpdatePrivacy } from "@/hooks";
import { HttpError } from "@/lib/http";
import type { Privacy, Visibility } from "@/lib/types";

const VISIBILITY: { value: Visibility; label: string }[] = [
  { value: "PUBLIC", label: "Public" },
  { value: "FRIENDS", label: "Friends only" },
  { value: "PRIVATE", label: "Only me" },
];

export default function PrivacyPage() {
  const { data: privacy, isLoading } = usePrivacy();
  const update = useUpdatePrivacy();
  const toast = useToast();

  function save(patch: Partial<Privacy>) {
    update.mutate(patch, {
      onError: (err) =>
        toast.error(err instanceof HttpError ? err.message : "Could not save."),
    });
  }

  return (
    <>
      <PageHeader
        title="Privacy"
        subtitle="Control what you share and how your data is used."
      />

      {isLoading || !privacy ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Visibility"
              description="Choose who can see your information."
              icon={<FiEye size={18} />}
            />
            <CardBody className="divide-y divide-border">
              <VisibilityRow
                label="Profile visibility"
                value={privacy.profileVisibility}
                onChange={(v) => save({ profileVisibility: v })}
              />
              <VisibilityRow
                label="Email visibility"
                value={privacy.emailVisibility}
                onChange={(v) => save({ emailVisibility: v })}
              />
              <VisibilityRow
                label="Phone number visibility"
                value={privacy.phoneVisibility}
                onChange={(v) => save({ phoneVisibility: v })}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Data preferences"
              description="Manage how your data is used across the platform."
            />
            <CardBody className="divide-y divide-border">
              <ToggleRow
                label="Personalized ads"
                description="Use my activity to show more relevant ads."
                checked={privacy.personalizedAds}
                onChange={(v) => save({ personalizedAds: v })}
              />
              <ToggleRow
                label="Data sharing"
                description="Share limited data with partner services."
                checked={privacy.dataSharing}
                onChange={(v) => save({ dataSharing: v })}
              />
            </CardBody>
          </Card>
        </div>
      )}
    </>
  );
}

function VisibilityRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Visibility;
  onChange: (v: Visibility) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <span className="text-sm font-medium text-text">{label}</span>
      <div className="w-44">
        <Select value={value} onChange={(e) => onChange(e.target.value as Visibility)}>
          {VISIBILITY.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
