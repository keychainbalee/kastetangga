import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus-visible:outline-hidden focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-100 disabled:opacity-55 transition-colors",
        className
      )}
      {...props}
    />
  );
}
