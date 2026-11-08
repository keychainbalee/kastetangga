"use client";

import { useState } from "react";
import EchartsBarChart from "./evilcharts/EchartsBarChart";
import EchartsPieChart from "./evilcharts/EchartsPieChart";

export default function KasCharts() {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");

  // Data 1 Tahun: Pemasukan vs Pengeluaran per Bulan (Jan - Des)
  const dataBulanan = [
    { bulan: "Jan", masuk: 3200000, keluar: 1800000 },
    { bulan: "Feb", masuk: 3400000, keluar: 1950000 },
    { bulan: "Mar", masuk: 3100000, keluar: 1600000 },
    { bulan: "Apr", masuk: 3800000, keluar: 2400000 },
    { bulan: "Mei", masuk: 3500000, keluar: 1750000 },
    { bulan: "Jun", masuk: 3250000, keluar: 1650000 },
    { bulan: "Jul", masuk: 3300000, keluar: 2100000 },
    { bulan: "Agu", masuk: 4500000, keluar: 3800000 },
    { bulan: "Sep", masuk: 3200000, keluar: 1700000 },
    { bulan: "Okt", masuk: 3400000, keluar: 1850000 },
    { bulan: "Nov", masuk: 3200000, keluar: 1750000 },
    { bulan: "Des", masuk: 3600000, keluar: 2200000 },
  ];

  // Data Proporsi Pie Chart
  const dataProporsi = [
    { label: "Iuran Warga", nominal: 38450000, colorHex: "#0ea5e9" },
    { label: "Donasi Warga", nominal: 4050000, colorHex: "#38bdf8" },
    { label: "Honor Sampah", nominal: 12000000, colorHex: "#f43f5e" },
    { label: "Pos Ronda", nominal: 6500000, colorHex: "#f59e0b" },
    { label: "Lampu & Sarana", nominal: 4200000, colorHex: "#6366f1" },
    { label: "Sosial & Duka", nominal: 4950000, colorHex: "#10b981" },
  ];

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