"use client";

import { useState } from "react";
import EchartsBarChart from "./evilcharts/EchartsBarChart";
import EchartsPieChart from "./evilcharts/EchartsPieChart";

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
}

export default function KasCharts({ dataBulanan, dataProporsi }: KasChartsProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border border-sky-100 shadow-xs space-y-4 animate-fade-in">
      {/* Header & Dropdown Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-sky-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Statistik & Visualisasi Kas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Grafik interaktif arus kas masuk dan kas keluar lingkungan RT 05
          </p>
        </div>

        {/* Dropdown Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label htmlFor="chart-selector" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Tampilkan:
          </label>
          <select
            id="chart-selector"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as "bar" | "pie")}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold rounded-xl border border-sky-200 bg-sky-50 text-sky-900 hover:bg-sky-100 focus:outline-hidden focus:ring-2 focus:ring-sky-400 cursor-pointer transition-colors shadow-xs"
          >
            <option value="bar">Grafik Batang</option>
            <option value="pie">Grafik Lingkaran</option>
          </select>
        </div>
      </div>

      {/* Render Chart dari Folder Evilcharts */}
      <div className="pt-1">
        {chartType === "bar" ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Perbandingan Kas Masuk vs Keluar per Bulan</span>
              <span className="font-semibold text-sky-700">Tahun 2026</span>
            </div>
            <EchartsBarChart data={dataBulanan} />
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
    </div>
  );
}
