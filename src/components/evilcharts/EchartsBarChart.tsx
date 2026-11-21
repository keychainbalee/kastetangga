"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  BarChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
]);

interface BarChartProps {
  data: { bulan: string; masuk: number; keluar: number }[];
  tahunAktif?: number;
}

export default function EchartsBarChart({
  data,
  tahunAktif = new Date().getFullYear(),
}: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = echarts.init(chartRef.current);

    const formatJt = (val: number) => {
      const jt = val / 1000000;
      return jt % 1 === 0 ? `${jt} Jt` : `${jt.toFixed(1).replace(".", ",")} Jt`;
    };

    const option = {
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0f172a",
        borderColor: "#38bdf8",
        borderWidth: 1,
        textStyle: { color: "#ffffff", fontSize: 12 },
        formatter: (params: any) => {
          const bulan = params[0].name;
          return `<strong>${bulan} ${tahunAktif}</strong><br/>
                  <span style="color:#38bdf8">● Masuk:</span> Rp ${formatJt(params[0].value)}<br/>
                  <span style="color:#fb7185">● Keluar:</span> Rp ${formatJt(params[1].value)}`;
        },
      },
      legend: {
        data: ["Pemasukan", "Pengeluaran"],
        bottom: 0,
        textStyle: { color: "#475569", fontSize: 11 },
      },
      grid: { left: "1%", right: "2%", bottom: "14%", top: "8%", containLabel: true },
      xAxis: {
        type: "category",
        data: data.map((d) => d.bulan),
        axisLine: { lineStyle: { color: "#cbd5e1" } },
        axisLabel: {
          color: "#64748b",
          fontSize: 10,
          interval: 0,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#64748b",
          fontSize: 10,
          formatter: (val: number) => `${(val / 1000000).toFixed(0)}Jt`,
        },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      // Batang Bersih Tanpa Tumpukan Angka di Atasnya
      series: [
        {
          name: "Pemasukan",
          type: "bar",
          barMaxWidth: 14,
          barGap: "15%",
          data: data.map((d) => d.masuk),
          itemStyle: { color: "#0ea5e9", borderRadius: [4, 4, 0, 0] },
          emphasis: { itemStyle: { color: "#0284c7" } },
        },
        {
          name: "Pengeluaran",
          type: "bar",
          barMaxWidth: 14,
          data: data.map((d) => d.keluar),
          itemStyle: { color: "#fb7185", borderRadius: [4, 4, 0, 0] },
          emphasis: { itemStyle: { color: "#f43f5e" } },
        },
      ],
    };

    chartInstance.setOption(option);

    const handleResize = () => chartInstance.resize();
    window.addEventListener("resize", handleResize);
    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(handleResize)
        : null;
    if (resizeObserver && chartRef.current) {
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleResize);
      chartInstance.dispose();
    };
  }, [data, tahunAktif]);

  return <div ref={chartRef} className="w-full h-64 sm:h-72 md:h-80" />;
}