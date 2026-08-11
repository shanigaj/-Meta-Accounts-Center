import { forwardRef } from "react";
import { FiChevronDown } from "react-icons/fi";
import { cn } from "@/lib/cn";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { className, invalid, children, ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-xl border bg-surface px-3.5 pr-10 text-sm text-text",
          "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand",
          invalid ? "border-danger" : "border-border",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <FiChevronDown
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
        size={16}
      />
    </div>
  );
});
