import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "success" | "danger" | "warning";

const tones: Record<Tone, string> = {
  neutral: "bg-border/50 text-muted",
  brand: "bg-brand-soft text-brand",
  success: "bg-success/15 text-success",
  danger: "bg-danger/15 text-danger",
  warning: "bg-warning/15 text-warning",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
