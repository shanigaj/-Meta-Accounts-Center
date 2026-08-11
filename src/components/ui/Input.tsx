import { cloneElement, forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactElement<{ id?: string; invalid?: boolean; "aria-invalid"?: boolean }>;
};

// Wraps any control with a label, optional hint and an inline validation
// message. Keeps the form markup on each page short and consistent.
export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId();
  const control = cloneElement(children, {
    id,
    invalid: !!error,
    "aria-invalid": !!error,
  });

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text">
          {label}
        </label>
      )}
      {control}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border bg-surface px-3.5 text-sm text-text",
        "placeholder:text-muted/70 transition",
        "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand",
        invalid ? "border-danger" : "border-border",
        className
      )}
      {...props}
    />
  );
});
