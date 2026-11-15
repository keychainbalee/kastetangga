import { Loader2 } from "lucide-react";

export default function KasLoading() {
  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-fade-in"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Header Halaman + Status Buffering */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900">
            Transparansi Kas RT
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Laporan rekapitulasi arus kas masuk dan keluar warga RT 05 yang diperbarui berkala.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold self-start sm:self-auto">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
          <span>Memuat data kas dari database...</span>
        </div>
      </div>

      {/* 1. Skeleton Banner Saldo Kas Aktif */}
      <div className="bg-sky-50 border border-sky-200 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
        <div className="space-y-2.5 w-full sm:w-auto">
          <div className="h-3 w-28 bg-sky-200 rounded-md" />
          <div className="h-9 w-56 bg-sky-200 rounded-xl" />
          <div className="h-3.5 w-64 bg-sky-100 rounded-md" />
        </div>
        <div className="h-8 w-36 bg-white border border-sky-200 rounded-xl" />
      </div>

      {/* 2. Skeleton Visualisasi Grafik */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-sky-100 shadow-xs space-y-5 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-sky-100">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-slate-200 rounded-lg" />
            <div className="h-3.5 w-64 bg-slate-100 rounded-md" />
          </div>
          <div className="h-9 w-40 bg-sky-50 border border-sky-100 rounded-xl" />
        </div>

        <div className="h-64 sm:h-72 bg-slate-50 rounded-xl border border-slate-100 p-6 flex items-end justify-around gap-3">
          {[45, 70, 35, 85, 60, 50, 75, 40].map((height, idx) => (
            <div
              key={idx}
              style={{ height: `${height}%` }}
              className="w-full max-w-10 bg-sky-100 rounded-t-lg"
            />
          ))}
        </div>
      </div>

      {/* 3. Skeleton Tabel Detail Transaksi */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-sky-100 shadow-xs space-y-4 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="h-10 w-full sm:w-64 bg-slate-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-sky-50 rounded-xl" />
            <div className="h-10 w-36 bg-slate-100 rounded-xl" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="h-14 w-full bg-slate-50 border border-slate-100 rounded-xl px-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-3.5 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-48 sm:w-72 bg-slate-200 rounded" />
              </div>
              <div className="h-4 w-24 bg-sky-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
