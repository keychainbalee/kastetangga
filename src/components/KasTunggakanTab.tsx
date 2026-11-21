"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Percent,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatBulanSingkat } from "@/lib/iuran";
import {
  formatRupiah,
  type KasBlokRekap,
  type KasIuranKeluargaItem,
  type KasIuranSummary,
} from "./kas/types";

interface KasTunggakanTabProps {
  statusList: KasIuranKeluargaItem[];
  summary: KasIuranSummary;
  rekapPerBlok: KasBlokRekap[];
  currentYm: string;
}

export default function KasTunggakanTab({
  statusList,
  summary,
  rekapPerBlok,
  currentYm,
}: KasTunggakanTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "semua" | "menunggak" | "lunas"
  >("semua");
  const [filterBlok, setFilterBlok] = useState("semua");

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return statusList.filter((item) => {
      if (filterStatus === "menunggak" && item.status !== "menunggak") {
        return false;
      }
      if (filterStatus === "lunas" && item.status === "menunggak") {
        return false;
      }
      if (filterBlok !== "semua" && item.blok !== filterBlok) {
        return false;
      }
      if (!q) return true;
      return (
        item.namaKepalaKeluarga.toLowerCase().includes(q) ||
        item.namaRumah.toLowerCase().includes(q) ||
        item.blok.toLowerCase().includes(q)
      );
    });
  }, [statusList, filterStatus, filterBlok, searchQuery]);

  const handleToggleBlok = (blok: string) => {
    setFilterBlok((prev) => (prev === blok ? "semua" : blok));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Ringkasan Kepatuhan Iuran & Tunggakan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <Card className="bg-sky-600 border-sky-600 text-white p-4 sm:p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-sky-100">
            <span className="text-xs font-bold uppercase tracking-wider">
              Kepatuhan Iuran RT
            </span>
            <Percent className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black">{summary.persenKepatuhan}%</p>
          <div className="w-full h-1.5 rounded-full bg-sky-800/60 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${summary.persenKepatuhan}%` }}
            />
          </div>
          <span className="text-xs text-sky-100 block">
            {summary.totalKkLunas} dari {summary.totalKk} KK lunas • Tarif{" "}
            {formatRupiah(summary.nominalPerBulan)}/bln
          </span>
        </Card>

        <Card className="bg-red-600 border-red-600 text-white p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-red-100">
            <span className="text-xs font-bold uppercase tracking-wider">
              Belum Bayar / Menunggak
            </span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black">{summary.totalKkMenunggak} KK</p>
          <span className="text-xs text-red-100 block">
            S.d. periode {formatBulanSingkat(currentYm)}
          </span>
        </Card>

        <Card className="bg-amber-500 border-amber-500 text-white p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-amber-50">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Tunggakan Iuran
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black">
            {formatRupiah(summary.totalNominalTunggakan)}
          </p>
          <span className="text-xs text-amber-50 block">
            {summary.totalBulanTunggakan} bulan belum terbayar
          </span>
        </Card>

        <Card className="bg-emerald-500 border-emerald-500 text-white p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-emerald-50">
            <span className="text-xs font-bold uppercase tracking-wider">
              KK Lunas / Bayar di Muka
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black">{summary.totalKkLunas} KK</p>
          <span className="text-xs text-emerald-50 block">
            Mulai periode {formatBulanSingkat(summary.mulaiPeriodeBulan)}
          </span>
        </Card>
      </div>

      {/* 2. Rekap Kepatuhan per Blok (Klik untuk Filter Cepat) */}
      {rekapPerBlok.length > 0 && (
        <Card className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Rekap Kepatuhan per Blok
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Ketuk blok untuk memfilter daftar warga di bawah
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rekapPerBlok.map((blokItem) => {
              const isSelected = filterBlok === blokItem.blok;
              return (
                <button
                  key={blokItem.blok}
                  type="button"
                  onClick={() => handleToggleBlok(blokItem.blok)}
                  className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-sky-50 border-sky-400 ring-1 ring-sky-400"
                      : "bg-white border-slate-200 hover:bg-sky-50/50 hover:border-sky-200"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {blokItem.blok}
                    </span>
                    <Badge
                      variant={
                        blokItem.menunggakKk > 0 ? "destructive" : "success"
                      }
                    >
                      {blokItem.menunggakKk > 0
                        ? `${blokItem.menunggakKk} Menunggak`
                        : "Semua Lunas"}
                    </Badge>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        blokItem.menunggakKk === 0
                          ? "bg-emerald-500"
                          : "bg-sky-500"
                      }`}
                      style={{ width: `${blokItem.persenKepatuhan}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      {blokItem.lunasKk}/{blokItem.totalKk} KK Lunas (
                      {blokItem.persenKepatuhan}%)
                    </span>
                    {blokItem.totalNominalTunggakan > 0 && (
                      <span className="font-bold text-red-600">
                        {formatRupiah(blokItem.totalNominalTunggakan)}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* 3. Daftar Status Pembayaran & Tunggakan Kepala Keluarga */}
      <Card className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Daftar Status Iuran Kepala Keluarga
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Menampilkan seluruh KK (prioritas yang memiliki tunggakan paling atas)
              </p>
            </div>
            {(searchQuery !== "" ||
              filterBlok !== "semua" ||
              filterStatus !== "semua") && (
              <Button
                type="button"
                variant="outlineSky"
                size="xs"
                onClick={() => {
                  setSearchQuery("");
                  setFilterBlok("semua");
                  setFilterStatus("semua");
                }}
              >
                Reset Filter
              </Button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
            <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama KK, rumah, atau blok..."
                  className="pl-9"
                />
              </div>

              <Select
                aria-label="Filter blok tunggakan"
                value={filterBlok}
                onChange={(e) => setFilterBlok(e.target.value)}
                className="w-auto font-semibold text-slate-700 text-xs sm:text-sm"
              >
                <option value="semua">Semua Blok</option>
                {rekapPerBlok.map((b) => (
                  <option key={b.blok} value={b.blok}>
                    {b.blok}
                  </option>
                ))}
              </Select>
            </div>

            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 self-start lg:self-auto gap-0.5">
              {(
                [
                  { key: "semua", label: `Semua (${summary.totalKk})` },
                  {
                    key: "menunggak",
                    label: `Menunggak (${summary.totalKkMenunggak})`,
                  },
                  { key: "lunas", label: `Lunas (${summary.totalKkLunas})` },
                ] as const
              ).map((opt) => (
                <Button
                  key={opt.key}
                  type="button"
                  size="xs"
                  variant={filterStatus === opt.key ? "default" : "ghost"}
                  onClick={() => setFilterStatus(opt.key)}
                  className="rounded-lg"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            {statusList.length === 0
              ? "Belum ada data kepala keluarga yang terdaftar."
              : "Tidak ada data kepala keluarga yang cocok dengan filter."}
          </div>
        ) : (
          <>
            {/* Tampilan Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredList.map((item) => (
                <div key={item.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        {item.namaKepalaKeluarga}
                      </p>
                      <span className="text-xs text-slate-600 block">
                        {item.blok} • {item.namaRumah} (Mulai:{" "}
                        {formatBulanSingkat(item.mulaiIuranBulan)})
                      </span>
                    </div>
                    <Badge
                      variant={
                        item.status === "menunggak"
                          ? "destructive"
                          : item.status === "bayar_di_muka"
                            ? "sky"
                            : "success"
                      }
                      className="whitespace-nowrap shrink-0"
                    >
                      {item.status === "menunggak"
                        ? `Menunggak ${item.tunggakanBulan.length} Bln`
                        : item.status === "bayar_di_muka"
                          ? `Di Muka (+${item.bulanDiMuka.length} Bln)`
                          : "Lunas"}
                    </Badge>
                  </div>

                  {item.tunggakanBulan.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1">
                        {item.tunggakanBulan.map((ym) => (
                          <span
                            key={ym}
                            className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold"
                          >
                            {formatBulanSingkat(ym)}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs font-bold text-red-700">
                        Total Tunggakan:{" "}
                        {formatRupiah(item.totalNominalTunggakan)}
                      </p>
                    </div>
                  )}

                  {item.bulanDiMuka.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.bulanDiMuka.map((ym) => (
                        <span
                          key={ym}
                          className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-[11px] font-semibold"
                        >
                          Lunas: {formatBulanSingkat(ym)}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.tunggakanBulan.length === 0 &&
                    item.bulanDiMuka.length === 0 && (
                      <p className="text-xs text-emerald-700 font-medium">
                        Terbayar s.d. {formatBulanSingkat(currentYm)}
                      </p>
                    )}
                </div>
              ))}
            </div>

            {/* Tampilan Tablet & Laptop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sky-50/70 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Kepala Keluarga</th>
                    <th className="py-3 px-4 font-bold">Blok / Rumah</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold">
                      Rincian Bulan Tunggakan / Bayar di Muka
                    </th>
                    <th className="py-3 px-4 font-bold text-right">
                      Nominal Tunggakan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-sky-50/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {item.namaKepalaKeluarga}
                        </span>
                        <span className="text-xs text-slate-500">
                          Mulai wajib: {formatBulanSingkat(item.mulaiIuranBulan)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="sky" className="rounded-lg mr-2">
                          {item.blok}
                        </Badge>
                        <span className="text-slate-700 text-xs font-medium">
                          {item.namaRumah}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={
                            item.status === "menunggak"
                              ? "destructive"
                              : item.status === "bayar_di_muka"
                                ? "sky"
                                : "success"
                          }
                          className="py-1 text-xs"
                        >
                          {item.status === "menunggak"
                            ? `Menunggak ${item.tunggakanBulan.length} Bulan`
                            : item.status === "bayar_di_muka"
                              ? `Bayar di Muka (+${item.bulanDiMuka.length} Bln)`
                              : "Lunas"}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {item.tunggakanBulan.map((ym) => (
                            <span
                              key={ym}
                              className="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 text-xs font-semibold"
                            >
                              {formatBulanSingkat(ym)}
                            </span>
                          ))}
                          {item.bulanDiMuka.map((ym) => (
                            <span
                              key={ym}
                              className="px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold"
                            >
                              +{formatBulanSingkat(ym)}
                            </span>
                          ))}
                          {item.tunggakanBulan.length === 0 &&
                            item.bulanDiMuka.length === 0 && (
                              <span className="text-xs text-emerald-700 font-medium">
                                Terbayar s.d. {formatBulanSingkat(currentYm)}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                        {item.totalNominalTunggakan > 0 ? (
                          <span className="text-red-600">
                            {formatRupiah(item.totalNominalTunggakan)}
                          </span>
                        ) : (
                          <span className="text-emerald-700">Rp 0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
