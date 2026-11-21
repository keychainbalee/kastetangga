"use client";

import { Button as BaseButton } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-semibold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 disabled:pointer-events-none disabled:opacity-55 shrink-0",
  {
    variants: {
      variant: {
        default: "bg-sky-500 hover:bg-sky-600 text-white shadow-xs",
        success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs",
        warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-xs",
        destructive: "bg-red-600 hover:bg-red-700 text-white shadow-xs",
        outline:
          "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
        outlineSky:
          "border border-sky-200 bg-white hover:bg-sky-50 text-sky-800 shadow-xs",
        ghost: "hover:bg-sky-50 text-slate-600",
      },
      size: {
        default: "px-4 py-2 text-sm",
        sm: "px-3 py-1.5 text-xs rounded-lg",
        xs: "px-2.5 py-1 text-xs rounded-lg",
        lg: "px-6 py-3 text-sm",
        icon: "p-2 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = BaseButton.Props &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <BaseButton
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
