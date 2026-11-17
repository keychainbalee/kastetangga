"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  formatBulanSingkat,
  getMonthsForYear,
  isValidBulan,
} from "@/lib/iuran";

function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function IuranBulanPicker({
  mulaiIuranBulan,
  selectedMonths,
  alreadyPaidInOtherTx,
  tarifPerBulan,
  currentYm,
  onChangeMonths,
}: {
  mulaiIuranBulan: string;
  selectedMonths: string[];
  alreadyPaidInOtherTx: Set<string>;
  tarifPerBulan: number;
  currentYm: string;
  onChangeMonths: (months: string[]) => void;
}) {
  const initialYear = Number(currentYm.split("-")[0]) || 2026;
  const [viewYear, setViewYear] = useState(initialYear);

  const selectedSet = new Set(selectedMonths);
  const startCursor = isValidBulan(mulaiIuranBulan) ? mulaiIuranBulan : currentYm;

  const toggleMonth = (ym: string) => {
    if (alreadyPaidInOtherTx.has(ym)) return;
    if (selectedSet.has(ym)) {
      onChangeMonths(selectedMonths.filter((m) => m !== ym));
    } else {
      onChangeMonths([...selectedMonths, ym].sort());
    }
  };

  const handleLunasiTunggakan = () => {
    const overdue: string[] = [];
    let cursor = startCursor;
    let guard = 0;
    while (cursor <= currentYm && guard < 120) {
      if (!alreadyPaidInOtherTx.has(cursor)) {
        overdue.push(cursor);
      }
      cursor = addMonths(cursor, 1);
      guard += 1;
    }
    onChangeMonths(overdue);
  };

  const handlePilihBeruntun = (count: number) => {
    const picked: string[] = [];
    let cursor = startCursor;
    let guard = 0;
    while (picked.length < count && guard < 120) {
      if (!alreadyPaidInOtherTx.has(cursor)) {
        picked.push(cursor);
      }
      cursor = addMonths(cursor, 1);
      guard += 1;
    }
    if (picked.length > 0) {
      const firstYear = Number(picked[0].split("-")[0]);
      if (Number.isInteger(firstYear)) setViewYear(firstYear);
    }
    onChangeMonths(picked);
  };

  const months = getMonthsForYear(viewYear);

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-sky-900">
          Pilih Bulan Pembayaran Iuran
        </span>
        <div className="inline-flex items-center gap-1 bg-white border border-sky-200 rounded-lg px-1.5 py-0.5">
          <button
            type="button"
            onClick={() => setViewYear((y) => y - 1)}
            aria-label="Tahun sebelumnya"
            className="p-1 text-slate-600 hover:text-sky-700"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-1.5">
            {viewYear}
          </span>
          <button
            type="button"
            onClick={() => setViewYear((y) => y + 1)}
            aria-label="Tahun berikutnya"
            className="p-1 text-slate-600 hover:text-sky-700"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pintasan Cepat */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={handleLunasiTunggakan}
          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors"
        >
          Lunasi Tunggakan
        </button>
        {[1, 3, 6].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handlePilihBeruntun(n)}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-sky-100 border border-sky-200 text-sky-800 text-[11px] font-semibold transition-colors"
          >
            +{n} Bulan
          </button>
        ))}
        {selectedMonths.length > 0 && (
          <button
            type="button"
            onClick={() => onChangeMonths([])}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-semibold transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Grid 12 Bulan */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
        {months.map(({ ym, label }) => {
          const isPaid = alreadyPaidInOtherTx.has(ym);
          const isSelected = selectedSet.has(ym);
          const isOverdue = !isPaid && ym >= startCursor && ym <= currentYm;

          let btnClass =
            "bg-white border-slate-200 text-slate-700 hover:bg-sky-100/70";
          if (isPaid) {
            btnClass =
              "bg-emerald-100 border-emerald-300 text-emerald-800 cursor-not-allowed opacity-85";
          } else if (isSelected) {
            btnClass = "bg-sky-500 border-sky-600 text-white shadow-xs";
          } else if (isOverdue) {
            btnClass =
              "bg-red-50 border-red-200 text-red-700 hover:bg-red-100";
          }

          return (
            <button
              key={ym}
              type="button"
              disabled={isPaid}
              onClick={() => toggleMonth(ym)}
              className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-colors flex flex-col items-center justify-center ${btnClass}`}
            >
              <span>{label}</span>
              {isPaid && (
                <span className="text-[9px] font-bold uppercase leading-none mt-0.5">
                  Lunas
                </span>
              )}
              {!isPaid && !isSelected && isOverdue && (
                <span className="text-[9px] font-bold leading-none mt-0.5">
                  Nunggak
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ringkasan Pilihan */}
      <div className="text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-sky-200/70">
        {selectedMonths.length > 0 ? (
          <>
            <span>
              Terpilih <strong>{selectedMonths.length} bulan</strong>:{" "}
              {selectedMonths.map(formatBulanSingkat).join(", ")}
            </span>
            <span className="font-bold text-sky-800">
              {selectedMonths.length} × {formatRupiah(tarifPerBulan)} ={" "}
              {formatRupiah(selectedMonths.length * tarifPerBulan)}
            </span>
          </>
        ) : (
          <span className="text-slate-500">
            Klik bulan di atas atau gunakan pintasan (+1 / +3 / +6 Bulan).
          </span>
        )}
      </div>
    </div>
  );
}
