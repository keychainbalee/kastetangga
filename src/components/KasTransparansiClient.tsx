"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDownCircle, ArrowUpCircle, CalendarClock, Wallet } from "lucide-react";
import KasCharts, {
  type DataBulananItem,
  type DataProporsiItem,
} from "@/components/KasCharts";
import KasTableDetail, { type TransaksiItem } from "@/components/KasTableDetail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatRupiah,
  type KasBlokRekap,
  type KasIuranKeluargaItem,
  type KasIuranSummary,
} from "@/components/kas/types";

const KasTunggakanTab = dynamic(
  () => import("@/components/KasTunggakanTab"),
  {
    loading: () => (
      <Card className="p-5 space-y-3 animate-pulse">
        <div className="h-24 w-full bg-slate-100 rounded-xl" />
        <div className="h-14 w-full bg-slate-50 rounded-xl" />
        <div className="h-14 w-full bg-slate-50 rounded-xl" />
      </Card>
    ),
  }
);

interface KasTransparansiClientProps {
  runningSaldo: number;
  totalMasuk: number;
  totalKeluar: number;
  dataBulanan: DataBulananItem[];
  dataProporsi: DataProporsiItem[];
  tahunAktif: number;
  transaksiTerbaru: TransaksiItem[];
  statusIuranList: KasIuranKeluargaItem[];
  iuranSummary: KasIuranSummary;
  rekapPerBlok: KasBlokRekap[];
  currentYm: string;
}

export default function KasTransparansiClient({
  runningSaldo,
  totalMasuk,
  totalKeluar,
  dataBulanan,
  dataProporsi,
  tahunAktif,
  transaksiTerbaru,
  statusIuranList,
  iuranSummary,
  rekapPerBlok,
  currentYm,
}: KasTransparansiClientProps) {
  const [activeTab, setActiveTab] = useState<"arus_kas" | "tunggakan">(
    "arus_kas"
  );

  return (
    <div className="space-y-6">
      {/* Navigasi 2 Tab Utama (Mobile & Tablet Friendly) */}
      <div
        role="tablist"
        aria-label="Tab transparansi kas RT"
        className="flex flex-wrap gap-2 bg-white border border-sky-100 rounded-2xl p-1.5 shadow-xs"
      >
        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === "arus_kas"}
          size="sm"
          variant={activeTab === "arus_kas" ? "default" : "ghost"}
          onClick={() => setActiveTab("arus_kas")}
          className="flex-1 sm:flex-initial rounded-xl"
        >
          <Wallet className="w-4 h-4" />
          Arus Kas & Grafik
        </Button>

        <Button
          type="button"
          role="tab"
          aria-selected={activeTab === "tunggakan"}
          size="sm"
          variant={activeTab === "tunggakan" ? "default" : "ghost"}
          onClick={() => setActiveTab("tunggakan")}
          className="flex-1 sm:flex-initial rounded-xl"
        >
          <CalendarClock className="w-4 h-4" />
          Iuran & Tunggakan Warga
          <Badge
            variant={
              activeTab === "tunggakan"
                ? "secondary"
                : iuranSummary.totalKkMenunggak > 0
                  ? "destructive"
                  : "success"
            }
            className="ml-0.5 text-[11px]"
          >
            {iuranSummary.totalKkMenunggak > 0
              ? `${iuranSummary.totalKkMenunggak} Menunggak`
              : "Lunas"}
          </Badge>
        </Button>
      </div>

      {activeTab === "arus_kas" ? (
        <div className="space-y-6">
          {/* 1. Banner Saldo Kas Aktif + Ringkasan Masuk & Keluar */}
          <Card className="bg-sky-50 border-sky-200 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs uppercase text-sky-800 font-bold tracking-wider">
                  Saldo Kas Aktif
                </span>
                <p className="text-2xl sm:text-4xl font-black text-sky-700 mt-1">
                  {formatRupiah(runningSaldo)}
                </p>
                <span className="text-xs text-slate-600 block mt-1">
                  Rekening Kas:{" "}
                  <strong className="text-slate-800">
                    Mandiri 123-00-XXXXXXX
                  </strong>{" "}
                  (a.n. RT 05)
                </span>
              </div>
              <Badge
                variant={runningSaldo >= 0 ? "sky" : "destructive"}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-sky-200 text-xs font-semibold shadow-xs"
              >
                {runningSaldo >= 0
                  ? "Kondisi Kas: Sehat"
                  : "Kondisi Kas: Defisit"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-sky-200/80">
              <div className="flex items-center justify-between bg-white border border-sky-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <ArrowUpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Total Kas Masuk
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-emerald-700">
                      {formatRupiah(totalMasuk)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white border border-sky-100 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <ArrowDownCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Total Kas Keluar
                    </span>
                    <span className="text-sm sm:text-base font-extrabold text-rose-600">
                      {formatRupiah(totalKeluar)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Visualisasi Grafik */}
          <KasCharts
            dataBulanan={dataBulanan}
            dataProporsi={dataProporsi}
            tahunAktif={tahunAktif}
          />

          {/* 3. Tabel Detail Mutasi Kas */}
          <KasTableDetail transaksi={transaksiTerbaru} />
        </div>
      ) : (
        <KasTunggakanTab
          statusList={statusIuranList}
          summary={iuranSummary}
          rekapPerBlok={rekapPerBlok}
          currentYm={currentYm}
        />
      )}
    </div>
  );
}
