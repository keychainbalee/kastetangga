"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Info, MinusCircle, X } from "lucide-react";

export type AlertActionType = "add" | "edit" | "delete" | "error";

export interface AlertState {
  id: number;
  type: AlertActionType;
  message: string;
  actionLabel?: string;
  actionHref?: string;
}

const emptySubscribe = () => () => {};

const ALERT_STYLES: Record<
  AlertActionType,
  {
    barClass: string;
    iconClass: string;
    Icon: typeof CheckCircle2;
  }
> = {
  add: {
    barClass: "bg-emerald-500 text-white",
    iconClass: "text-white",
    Icon: CheckCircle2,
  },
  edit: {
    barClass: "bg-amber-500 text-white",
    iconClass: "text-white",
    Icon: Info,
  },
  delete: {
    barClass: "bg-red-600 text-white",
    iconClass: "text-white",
    Icon: MinusCircle,
  },
  error: {
    barClass: "bg-red-600 text-white",
    iconClass: "text-white",
    Icon: AlertCircle,
  },
};

export default function AlertNotification({
  alert,
  onClose,
  durationMs = 5000,
}: {
  alert: AlertState | null;
  onClose: () => void;
  durationMs?: number;
}) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(onClose, durationMs);
    return () => clearTimeout(timer);
  }, [alert, durationMs, onClose]);

  if (!isClient || !alert) return null;

  const style = ALERT_STYLES[alert.type];
  const Icon = style.Icon;

  return createPortal(
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-5 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-[9999]"
    >
      <div
        className={`animate-slide-down rounded-xl px-4 py-3 shadow-lg flex items-center justify-between gap-3 ${style.barClass}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon className={`w-5 h-5 shrink-0 ${style.iconClass}`} />
          <p className="text-sm font-medium leading-snug break-words">
            {alert.message}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {alert.actionLabel && alert.actionHref && (
            <Link
              href={alert.actionHref}
              onClick={onClose}
              className="text-xs font-semibold underline underline-offset-4 hover:opacity-85 whitespace-nowrap"
            >
              {alert.actionLabel}
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup notifikasi"
            className="p-0.5 rounded-md opacity-85 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
