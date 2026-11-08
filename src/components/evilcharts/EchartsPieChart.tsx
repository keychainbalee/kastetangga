"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface PieChartProps {
  data: { label: string; nominal: number; colorHex: string }[];
}

export default function EchartsPieChart({ data }: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chartInstance = echarts.init(chartRef.current);
    const total = data.reduce((acc, curr) => acc + curr.nominal, 0);

    // Format ringkas satuan Juta (contoh: 38,5 Jt)
    const formatJuta = (val: number) => {
      const jt = val / 1000000;
      return jt % 1 === 0 ? `${jt} Jt` : `${jt.toFixed(1).replace(".", ",")} Jt`;
    };

    const option = {
      tooltip: {
        trigger: "item",
        backgroundColor: "#0f172a",
        borderColor: "#38bdf8",
        borderWidth: 1,
        textStyle: { color: "#ffffff", fontSize: 12 },
        formatter: (params: any) => {
          return `<strong>${params.name}</strong><br/>
                  <span style="color:${params.color}">●</span> Rp ${formatJuta(params.value)} (<strong>${params.percent}%</strong>)`;
        },
      },
      // KETERANGAN (LEGENDA): Menampilkan Nominal & Persentase dengan Rapi
      legend: {
        type: "scroll",
        orient: "horizontal",
        bottom: 0,
        pageIconColor: "#0ea5e9",
        pageTextStyle: { color: "#64748b" },
        textStyle: { color: "#334155", fontSize: 11, fontWeight: "500" },
        formatter: (name: string) => {
          const item = data.find((d) => d.label === name);
          if (!item) return name;
          const pct = ((item.nominal / total) * 100).toFixed(0);
          return `${name}: Rp ${formatJuta(item.nominal)} (${pct}%)`;
        },
      },
      series: [
        {
          name: "Proporsi Kas",
          type: "pie",
          radius: ["42%", "68%"],
          center: ["50%", "42%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: "#ffffff",
            borderWidth: 2,
          },
          // Grafik Bersih: Tidak ada teks yang menumpuk di atas irisan
          label: {
            show: false,
          },
          emphasis: {
            scale: true,
            scaleSize: 6,
            label: {
              show: true,
              fontSize: 13,
              fontWeight: "bold",
              color: "#0f172a",
              formatter: "{b}\n{d}%",
            },
          },
          data: data.map((item) => ({
            value: item.nominal,
            name: item.label,
            itemStyle: { color: item.colorHex },
          })),
        },
      ],
    };

    chartInstance.setOption(option);

    const handleResize = () => chartInstance.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chartInstance.dispose();
    };
  }, [data]);

  return <div ref={chartRef} className="w-full h-72 sm:h-80" />;
}