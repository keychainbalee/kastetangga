import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div
      className="min-h-screen bg-slate-50"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-5 sm:space-y-6 animate-fade-in">
        {/* Skeleton Header */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-2">
            <div className="h-4 w-44 bg-sky-200 rounded animate-pulse" />
            <div className="h-7 w-60 bg-sky-200 rounded-lg animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-sky-200 text-sky-800 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
            <span>Memuat dashboard admin...</span>
          </div>
        </div>

        {/* Skeleton 4 Kartu Statistik (2x2 Mobile/Tablet, 4 Kolom Laptop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 animate-pulse">
          <div className="h-24 sm:h-28 rounded-2xl bg-sky-200" />
          <div className="h-24 sm:h-28 rounded-2xl bg-emerald-200" />
          <div className="h-24 sm:h-28 rounded-2xl bg-red-200" />
          <div className="h-24 sm:h-28 rounded-2xl bg-amber-200" />
        </div>

        {/* Skeleton Tab & Tabel */}
        <div className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-6 space-y-3 animate-pulse">
          <div className="h-10 w-full bg-slate-100 rounded-xl" />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-14 w-full bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
