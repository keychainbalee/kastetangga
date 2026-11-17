"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

function formatSystemDateTime(date: Date): string {
  const tanggal = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

  const waktu = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(/\./g, ":");

  return `${tanggal} • ${waktu}`;
}

export default function SystemDateTimeBadge() {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const update = () => setText(formatSystemDateTime(new Date()));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-sky-800 text-xs font-semibold shadow-xs"
      title="Tanggal dan waktu sistem saat ini"
    >
      <Clock className="w-3.5 h-3.5 text-sky-600 shrink-0" />
      <span>{text || "Menyesuaikan waktu sistem..."}</span>
    </div>
  );
}
