"use client";

import Link from "next/link";
import { useState } from "react";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { fieldErrors } from "@/lib/form";
import { api } from "@/lib/http";
import { forgotPasswordSchema } from "@/schemas";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setLoading(true);
    // Mock endpoint always succeeds; show the confirmation regardless.
    await api.post("/api/auth/forgot-password", parsed.data).catch(() => {});
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="animate-fade-in text-center">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
          <FiMail size={22} />
        </span>
        <h1 className="text-2xl font-bold">Check your inbox</h1>
        <p className="mt-2 text-sm text-muted">
          If an account exists for <span className="text-text">{email}</span>,
          we&apos;ve sent a link to reset your password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          <FiArrowLeft size={15} /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
        <Field label="Email" error={errors.email}>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Button type="submit" loading={loading} className="w-full">
          Send reset link
        </Button>
      </form>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text"
      >
        <FiArrowLeft size={15} /> Back to sign in
      </Link>
    </div>
  );
}
