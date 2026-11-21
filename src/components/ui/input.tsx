import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus-visible:outline-hidden focus-visible:border-sky-500 focus-visible:ring-2 focus-visible:ring-sky-100 disabled:opacity-55 transition-colors",
        className
      )}
      {...props}
    />
  );
}
