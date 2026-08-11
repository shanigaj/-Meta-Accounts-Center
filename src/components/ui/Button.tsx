import { forwardRef } from "react";
import { FiLoader } from "react-icons/fi";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white hover:brightness-110 focus-visible:ring-brand/40 disabled:opacity-60",
  secondary:
    "bg-elevated text-text border border-border hover:bg-border/40 focus-visible:ring-border",
  ghost:
    "bg-transparent text-muted hover:bg-border/40 hover:text-text focus-visible:ring-border",
  danger:
    "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 focus-visible:ring-danger/30",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <FiLoader className="animate-spin" size={16} />}
      {children}
    </button>
  );
});
