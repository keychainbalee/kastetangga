"use client";

import type { ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </BaseDialog.Root>
  );
}

export function DialogContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/45 transition-opacity" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <BaseDialog.Popup
          className={cn(
            "pointer-events-auto bg-white border border-sky-200 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-xl space-y-5 animate-fade-in focus:outline-hidden",
            className
          )}
        >
          {children}
        </BaseDialog.Popup>
      </div>
    </BaseDialog.Portal>
  );
}

export function DialogHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <BaseDialog.Title className="text-lg font-extrabold text-slate-900 leading-tight">
          {title}
        </BaseDialog.Title>
        {description && (
          <BaseDialog.Description className="text-xs text-slate-500">
            {description}
          </BaseDialog.Description>
        )}
      </div>
      <BaseDialog.Close
        aria-label="Tutup dialog"
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </BaseDialog.Close>
    </div>
  );
}
