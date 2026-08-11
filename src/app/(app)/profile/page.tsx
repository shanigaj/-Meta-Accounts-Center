"use client";

import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/shell/PageHeader";
import { useProfile, useUpdateProfile } from "@/hooks";
import { toDateInput } from "@/lib/format";
import { fieldErrors } from "@/lib/form";
import { HttpError } from "@/lib/http";
import { updateProfileSchema } from "@/schemas";

type FormState = {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string; // yyyy-mm-dd
  avatarUrl: string;
};

export default function ProfilePage() {
  const { data: user, isLoading } = useProfile();
  const update = useUpdateProfile();
  const toast = useToast();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    avatarUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hydrate the form once the profile loads.
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? "",
        dateOfBirth: toDateInput(user.dateOfBirth),
        avatarUrl: user.avatarUrl ?? "",
      });
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <>
        <PageHeader title="Profile" subtitle="Loading…" />
        <SkeletonCard />
      </>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Send an ISO datetime for the date input so it matches the API schema.
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      avatarUrl: form.avatarUrl,
      dateOfBirth: form.dateOfBirth
        ? new Date(form.dateOfBirth).toISOString()
        : "",
    };

    const parsed = updateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});

    try {
      await update.mutateAsync(parsed.data);
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err instanceof HttpError ? err.message : "Update failed.");
    }
  }

  return (
    <>
      <PageHeader
        title="Profile"
        subtitle="Update your personal information."
      />

      <Card>
        <CardHeader title="Personal information" />
        <CardBody>
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={form.name || user.name} src={form.avatarUrl} size={64} />
            <div className="flex-1">
              <Field label="Profile picture URL" error={errors.avatarUrl}>
                <Input
                  placeholder="https://…"
                  value={form.avatarUrl}
                  onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Field label="Full name" error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Phone number" error={errors.phone}>
              <Input
                placeholder="+1 555 000 1234"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Date of birth" error={errors.dateOfBirth}>
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </Field>

            <div className="sm:col-span-2">
              <Button type="submit" loading={update.isPending}>
                <FiSave size={16} /> Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  );
}
