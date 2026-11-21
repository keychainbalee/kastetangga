"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const EchartsBarChart = dynamic(
  () => import("./evilcharts/EchartsBarChart"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 sm:h-72 md:h-80 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
    ),
  }
);

const EchartsPieChart = dynamic(
  () => import("./evilcharts/EchartsPieChart"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 sm:h-72 md:h-80 rounded-xl bg-slate-50 border border-slate-100 animate-pulse" />
    ),
  }
);

export interface DataBulananItem {
  bulan: string;
  masuk: number;
  keluar: number;
}

export interface DataProporsiItem {
  label: string;
  nominal: number;
  colorHex: string;
}

interface KasChartsProps {
  dataBulanan: DataBulananItem[];
  dataProporsi: DataProporsiItem[];
  tahunAktif?: number;
}

export default function KasCharts({
  dataBulanan,
  dataProporsi,
  tahunAktif = new Date().getFullYear(),
}: KasChartsProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  return (
    <Card className="p-4 sm:p-6 space-y-4 animate-fade-in">
      {/* Header & Segmented Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-sky-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Statistik & Visualisasi Kas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik arus kas masuk dan keluar RT 05
          </p>
        </div>

        {/* Segmented Control (1-Tap untuk HP & Tablet) */}
        <div
          role="tablist"
          aria-label="Pilih jenis grafik"
          className="inline-flex w-full sm:w-auto rounded-xl border border-sky-200 bg-sky-50 p-1 gap-1"
        >
          <Button
            type="button"
            role="tab"
            size="xs"
            variant={chartType === "bar" ? "default" : "ghost"}
            aria-selected={chartType === "bar"}
            onClick={() => setChartType("bar")}
            className={`flex-1 sm:flex-initial rounded-lg ${
              chartType !== "bar" ? "text-sky-900 hover:bg-sky-100" : ""
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Batang
          </Button>
          <Button
            type="button"
            role="tab"
            size="xs"
            variant={chartType === "pie" ? "default" : "ghost"}
            aria-selected={chartType === "pie"}
            onClick={() => setChartType("pie")}
            className={`flex-1 sm:flex-initial rounded-lg ${
              chartType !== "pie" ? "text-sky-900 hover:bg-sky-100" : ""
            }`}
          >
            <PieChartIcon className="w-3.5 h-3.5" />
            Lingkaran
          </Button>
        </div>
      </div>

      {/* Render Chart secara Lazy Load */}
      <div className="pt-1">
        {chartType === "bar" ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Perbandingan Kas Masuk vs Keluar per Bulan</span>
              <span className="font-semibold text-sky-700">Tahun {tahunAktif}</span>
            </div>
            <EchartsBarChart data={dataBulanan} tahunAktif={tahunAktif} />
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Rincian Pembagian Alokasi Dana Kas</span>
              <span className="font-semibold text-sky-700">Akumulasi Total</span>
            </div>
            <EchartsPieChart data={dataProporsi} />
          </div>
        )}
      </div>
    </Card>
  );
}
