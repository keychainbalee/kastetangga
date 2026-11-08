import KasCharts from "../../components/KasCharts";
import KasTableDetail from "../../components/KasTableDetail";

export default function KasPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header Halaman */}
      <div>
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900">Transparansi Kas RT</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Laporan rekapitulasi arus kas masuk dan keluar warga RT 05 yang diperbarui berkala.
        </p>
      </div>

      {/* 1. Banner Saldo Kas Aktif */}
      <div className="bg-gradient-to-r from-sky-100 to-sky-50 border border-sky-200 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase text-sky-800 font-bold tracking-wider">Saldo Kas Aktif</span>
          <p className="text-2xl sm:text-4xl font-black text-sky-700 mt-1">Rp 14.850.000</p>
          <span className="text-xs text-slate-600 block mt-1">
            Rekening Kas: <strong className="text-slate-800">Mandiri 123-00-XXXXXXX</strong> (a.n. RT 05)
          </span>
        </div>
        <div className="px-3.5 py-1.5 bg-white border border-sky-200 text-sky-800 rounded-xl text-xs font-semibold shadow-xs">
          Kondisi Kas: Sehat
        </div>
      </div>

      {/* 2. Visualisasi Grafik (Pie Chart & Bar Chart) */}
      <KasCharts />

      {/* 3. Komponen Tabel Detail dengan Ikon Kalender & Pencarian */}
      <KasTableDetail />
    </div>
  );
}