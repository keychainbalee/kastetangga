"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Search,
  Settings,
} from "lucide-react";
import {
  addMonths,
  formatBulanSingkat,
  hitungStatusIuranKeluarga,
} from "@/lib/iuran";

export interface IuranKeluargaItem {
  id: number;
  namaKepalaKeluarga: string;
  namaRumah: string;
  blok: string;
  mulaiIuranBulan: string;
}

export interface PembayaranIuranItem {
  id: number;
  transaksiId: number;
  kepalaKeluargaId: number;
  bulan: string;
}

function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

export default function AdminIuranTab({
  keluargaList,
  pembayaranIuranList,
  pengaturanIuran,
  currentYm,
  busy,
  onSavePengaturan,
  onBayarCepat,
}: {
  keluargaList: IuranKeluargaItem[];
  pembayaranIuranList: PembayaranIuranItem[];
  pengaturanIuran: { nominalPerBulan: number; mulaiPeriodeBulan: string };
  currentYm: string;
  busy: boolean;
  onSavePengaturan: (
    nominalPerBulan: number,
    mulaiPeriodeBulan: string
  ) => Promise<void>;
  onBayarCepat: (kk: IuranKeluargaItem, defaultMonths: string[]) => void;
}) {
  const [tarifInput, setTarifInput] = useState(
    String(pengaturanIuran.nominalPerBulan)
  );
  const [mulaiPeriodeInput, setMulaiPeriodeInput] = useState(
    pengaturanIuran.mulaiPeriodeBulan
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "semua" | "menunggak" | "lunas"
  >("semua");
  const [filterBlok, setFilterBlok] = useState("semua");

  const paidMonthsByKk = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const row of pembayaranIuranList) {
      let set = map.get(row.kepalaKeluargaId);
      if (!set) {
        set = new Set<string>();
        map.set(row.kepalaKeluargaId, set);
      }
      set.add(row.bulan);
    }
    return map;
  }, [pembayaranIuranList]);

  const statusList = useMemo(() => {
    return keluargaList.map((kk) => {
      const paidSet = paidMonthsByKk.get(kk.id) ?? new Set<string>();
      const info = hitungStatusIuranKeluarga(
        kk.mulaiIuranBulan || pengaturanIuran.mulaiPeriodeBulan,
        paidSet,
        currentYm,
        pengaturanIuran.nominalPerBulan
      );
      return { kk, paidSet, info };
    });
  }, [keluargaList, paidMonthsByKk, pengaturanIuran, currentYm]);

  const summary = useMemo(() => {
    let totalKkMenunggak = 0;
    let totalBulanTunggakan = 0;
    let totalNominalTunggakan = 0;
    let totalKkLunas = 0;

    for (const item of statusList) {
      if (item.info.status === "menunggak") {
        totalKkMenunggak += 1;
        totalBulanTunggakan += item.info.tunggakanBulan.length;
        totalNominalTunggakan += item.info.totalNominalTunggakan;
      } else {
        totalKkLunas += 1;
      }
    }

    return {
      totalKkMenunggak,
      totalBulanTunggakan,
      totalNominalTunggakan,
      totalKkLunas,
    };
  }, [statusList]);

  const blokOptions = useMemo(() => {
    return Array.from(new Set(keluargaList.map((k) => k.blok))).sort((a, b) =>
      a.localeCompare(b, "id")
    );
  }, [keluargaList]);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return statusList.filter(({ kk, info }) => {
      if (filterStatus === "menunggak" && info.status !== "menunggak") {
        return false;
      }
      if (filterStatus === "lunas" && info.status === "menunggak") {
        return false;
      }
      if (filterBlok !== "semua" && kk.blok !== filterBlok) return false;
      if (!q) return true;
      return (
        kk.namaKepalaKeluarga.toLowerCase().includes(q) ||
        kk.namaRumah.toLowerCase().includes(q) ||
        kk.blok.toLowerCase().includes(q)
      );
    });
  }, [statusList, filterStatus, filterBlok, searchQuery]);

  const handleSubmitPengaturan = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSavePengaturan(Number(tarifInput), mulaiPeriodeInput);
  };

  const getNextUnpaidMonth = (paidSet: Set<string>, mulaiBulan: string): string => {
    let cursor = mulaiBulan || currentYm;
    let guard = 0;
    while (guard < 120) {
      if (!paidSet.has(cursor)) return cursor;
      cursor = addMonths(cursor, 1);
      guard += 1;
    }
    return currentYm;
  };

  return (
    <div className="space-y-6">
      {/* Pengaturan Tarif & Periode Iuran */}
      <form
        onSubmit={handleSubmitPengaturan}
        className="bg-white border border-sky-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
      >
        <div className="flex items-center gap-2 text-slate-900">
          <Settings className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm sm:text-base font-bold">
            Pengaturan Tarif & Periode Wajib Iuran RT
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">
              Tarif Standar / Bulan (Rp)
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={tarifInput}
              onChange={(e) => setTarifInput(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-600">
              Mulai Periode Iuran RT (Default KK Baru)
            </label>
            <input
              type="month"
              value={mulaiPeriodeInput}
              onChange={(e) => setMulaiPeriodeInput(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="sm:col-span-2 lg:col-span-1 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
          >
            {busy ? "Menyimpan..." : "Simpan Pengaturan"}
          </button>
        </div>
      </form>

      {/* Ringkasan Tunggakan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-red-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-red-100">
            <span className="text-xs font-bold uppercase tracking-wider">
              KK Memiliki Tunggakan
            </span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black">{summary.totalKkMenunggak} KK</p>
          <span className="text-xs text-red-100 block">
            S.d. periode {formatBulanSingkat(currentYm)}
          </span>
        </div>

        <div className="bg-amber-500 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-50">
            <span className="text-xs font-bold uppercase tracking-wider">
              Estimasi Total Tunggakan
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black">
            {formatRupiah(summary.totalNominalTunggakan)}
          </p>
          <span className="text-xs text-amber-50 block">
            Total {summary.totalBulanTunggakan} bulan belum terbayar
          </span>
        </div>

        <div className="bg-emerald-500 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-1 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-50">
            <span className="text-xs font-bold uppercase tracking-wider">
              KK Lunas / Bayar di Muka
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black">{summary.totalKkLunas} KK</p>
          <span className="text-xs text-emerald-50 block">
            Tidak ada tunggakan berjalan
          </span>
        </div>
      </div>

      {/* Daftar Status & Tunggakan KK */}
      <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama KK, rumah, atau blok..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <select
              aria-label="Filter blok tunggakan"
              value={filterBlok}
              onChange={(e) => setFilterBlok(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700"
            >
              <option value="semua">Semua Blok</option>
              {blokOptions.map((blok) => (
                <option key={blok} value={blok}>
                  {blok}
                </option>
              ))}
            </select>
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 self-start lg:self-auto">
            {(
              [
                { key: "semua", label: "Semua" },
                { key: "menunggak", label: `Menunggak (${summary.totalKkMenunggak})` },
                { key: "lunas", label: `Lunas (${summary.totalKkLunas})` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilterStatus(opt.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === opt.key
                    ? "bg-sky-500 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Tidak ada data kepala keluarga untuk filter ini.
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredList.map(({ kk, paidSet, info }) => {
                const defaultMonths =
                  info.tunggakanBulan.length > 0
                    ? info.tunggakanBulan
                    : [getNextUnpaidMonth(paidSet, kk.mulaiIuranBulan)];
                return (
                  <div key={kk.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {kk.namaKepalaKeluarga}
                        </p>
                        <span className="text-xs text-slate-600 block">
                          {kk.blok} • {kk.namaRumah} (Mulai:{" "}
                          {formatBulanSingkat(kk.mulaiIuranBulan)})
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                          info.status === "menunggak"
                            ? "bg-red-100 text-red-700"
                            : info.status === "bayar_di_muka"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {info.status === "menunggak"
                          ? `Menunggak ${info.tunggakanBulan.length} Bln`
                          : info.status === "bayar_di_muka"
                            ? `Di Muka (+${info.bulanDiMuka.length} Bln)`
                            : "Lunas"}
                      </span>
                    </div>

                    {info.tunggakanBulan.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {info.tunggakanBulan.map((ym) => (
                            <span
                              key={ym}
                              className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold"
                            >
                              {formatBulanSingkat(ym)}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs font-bold text-red-700">
                          Tunggakan: {formatRupiah(info.totalNominalTunggakan)}
                        </p>
                      </div>
                    )}

                    {info.bulanDiMuka.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {info.bulanDiMuka.map((ym) => (
                          <span
                            key={ym}
                            className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-semibold"
                          >
                            Lunas: {formatBulanSingkat(ym)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => onBayarCepat(kk, defaultMonths)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        {info.tunggakanBulan.length > 0
                          ? "Bayar Tunggakan"
                          : "Bayar di Muka"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sky-50/70 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Kepala Keluarga</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">
                      Rincian Tunggakan / Bayar di Muka
                    </th>
                    <th className="py-3 px-4 font-bold text-right">
                      Nominal Tunggakan
                    </th>
                    <th className="py-3 px-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredList.map(({ kk, paidSet, info }) => {
                    const defaultMonths =
                      info.tunggakanBulan.length > 0
                        ? info.tunggakanBulan
                        : [getNextUnpaidMonth(paidSet, kk.mulaiIuranBulan)];
                    return (
                      <tr
                        key={kk.id}
                        className="hover:bg-sky-50/40 transition-colors"
                      >
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">
                            {kk.namaKepalaKeluarga}
                          </span>
                          <span className="text-xs text-slate-500">
                            {kk.blok} • {kk.namaRumah} (Mulai{" "}
                            {formatBulanSingkat(kk.mulaiIuranBulan)})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              info.status === "menunggak"
                                ? "bg-red-100 text-red-700"
                                : info.status === "bayar_di_muka"
                                  ? "bg-sky-100 text-sky-800"
                                  : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {info.status === "menunggak"
                              ? `Menunggak ${info.tunggakanBulan.length} Bulan`
                              : info.status === "bayar_di_muka"
                                ? `Bayar di Muka (+${info.bulanDiMuka.length} Bln)`
                                : "Lunas"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {info.tunggakanBulan.map((ym) => (
                              <span
                                key={ym}
                                className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-semibold"
                              >
                                {formatBulanSingkat(ym)}
                              </span>
                            ))}
                            {info.bulanDiMuka.map((ym) => (
                              <span
                                key={ym}
                                className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold"
                              >
                                +{formatBulanSingkat(ym)}
                              </span>
                            ))}
                            {info.tunggakanBulan.length === 0 &&
                              info.bulanDiMuka.length === 0 && (
                                <span className="text-xs text-emerald-700 font-medium">
                                  Terbayar s.d. {formatBulanSingkat(currentYm)}
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                          {info.totalNominalTunggakan > 0 ? (
                            <span className="text-red-600">
                              {formatRupiah(info.totalNominalTunggakan)}
                            </span>
                          ) : (
                            <span className="text-emerald-700">Rp 0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onBayarCepat(kk, defaultMonths)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            {info.tunggakanBulan.length > 0
                              ? "Bayar Iuran"
                              : "Bayar di Muka"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
