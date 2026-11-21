"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface TransaksiItem {
  id: number;
  date: string;
  tanggalText: string;
  tipe: "masuk" | "keluar";
  kategori: string;
  uraian: string;
  kepalaKeluargaText?: string | null;
  nominal: number;
  saldo: number;
}

export default function KasTableDetail({ transaksi }: { transaksi: TransaksiItem[] }) {
  
  // State Filter
  const [selectedDate, setSelectedDate] = useState<string>(""); // Format YYYY-MM-DD
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterTipe, setFilterTipe] = useState<"semua" | "masuk" | "keluar">("semua");

  // State Kalender Popover (mengikuti tanggal sistem saat ini)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const calendarRef = useRef<HTMLDivElement>(null);

  // Menutup kalender jika klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const namaBulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  // Format Tampilan Tanggal: Tanggal Hari -> Bulan -> Tahun (Contoh: "05 November 2026")
  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return "";
    const [thn, bln, tgl] = dateStr.split("-");
    const namaBln = namaBulan[parseInt(bln, 10) - 1];
    return `${tgl} ${namaBln} ${thn}`;
  };

  // Filter Data
  const transaksiFiltered = useMemo(() => {
    return transaksi.filter((item) => {
      if (filterTipe !== "semua" && item.tipe !== filterTipe) return false;
      if (selectedDate !== "" && item.date !== selectedDate) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchUraian = item.uraian.toLowerCase().includes(q);
        const matchKategori = item.kategori.toLowerCase().includes(q);
        const matchKk = item.kepalaKeluargaText?.toLowerCase().includes(q) ?? false;
        if (!matchUraian && !matchKategori && !matchKk) return false;
      }
      return true;
    });
  }, [transaksi, selectedDate, searchQuery, filterTipe]);

  // Total Otomatis Berdasarkan Filter
  const totalMasuk = useMemo(() => {
    return transaksiFiltered.filter((t) => t.tipe === "masuk").reduce((acc, t) => acc + t.nominal, 0);
  }, [transaksiFiltered]);

  const totalKeluar = useMemo(() => {
    return transaksiFiltered.filter((t) => t.tipe === "keluar").reduce((acc, t) => acc + t.nominal, 0);
  }, [transaksiFiltered]);

  // Logika Pembuatan Grid Kalender
  const totalHariDalamBulan = new Date(viewYear, viewMonth + 1, 0).getDate();
  const hariPertamaIndex = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Mulai dari Senin

  const handlePilihTanggal = (hari: number) => {
    const hariStr = String(hari).padStart(2, "0");
    const bulanStr = String(viewMonth + 1).padStart(2, "0");
    const dateFormatted = `${viewYear}-${bulanStr}-${hariStr}`;
    setSelectedDate(dateFormatted);
    setIsCalendarOpen(false);
  };

  const gantiBulan = (offset: number) => {
    let newMonth = viewMonth + offset;
    let newYear = viewYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setViewMonth(newMonth);
    setViewYear(newYear);
  };

  return (
    <Card className="p-5 sm:p-6 space-y-5 animate-fade-in">
      {/* Header Komponen */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-sky-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Rincian Buku Kas Bulanan & Harian
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gunakan filter kalender dan pencarian untuk melihat mutasi kas secara spesifik
          </p>
        </div>

        {/* Tombol Reset Filter */}
        {(selectedDate !== "" || searchQuery !== "" || filterTipe !== "semua") && (
          <button
            onClick={() => {
              setSelectedDate("");
              setSearchQuery("");
              setFilterTipe("semua");
            }}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 hover:underline cursor-pointer"
          >
            ↺ Tampilkan Semua Data
          </button>
        )}
      </div>

      {/* Kontrol Filter: Kalender Rapi & Kolom Pencarian */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 1. PEMILIH KALENDER ELEGAN (TAMPILAN: HARI -> BULAN -> TAHUN) */}
        <div className="relative" ref={calendarRef}>
          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
            Filter Kalender (Hari, Bulan, Tahun)
          </label>
          
          {/* Tombol Pemicu Popover Kalender */}
          <button
            type="button"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className={`w-full flex items-center justify-between px-3.5 py-2 text-xs rounded-xl border transition-all cursor-pointer ${
              selectedDate
                ? "border-sky-400 bg-sky-50 text-sky-900 font-bold shadow-xs"
                : "border-sky-200 bg-sky-50/50 text-slate-700 hover:bg-sky-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-sky-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {selectedDate ? formatTanggalIndo(selectedDate) : "Pilih Tanggal: Hari, Bulan, Tahun"}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              {selectedDate && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDate("");
                  }}
                  className="text-slate-400 hover:text-rose-500 font-bold p-0.5 rounded-full"
                  title="Hapus filter tanggal"
                >
                  ✕
                </span>
              )}
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {/* POPOVER KALENDER INTERAKTIF (Terbuka saat tombol diklik) */}
          {isCalendarOpen && (
            <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-sky-200 rounded-2xl shadow-xl p-4 w-72 sm:w-80 max-w-[calc(100vw-2rem)] animate-fade-in">
              {/* Header Kalender: Navigasi Bulan & Tahun */}
              <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                <button
                  type="button"
                  onClick={() => gantiBulan(-1)}
                  className="p-1 rounded-lg hover:bg-sky-100 text-sky-800 transition-colors"
                >
                  ❮
                </button>
                <div className="flex items-center gap-1.5 font-bold text-xs text-sky-950">
                  <select
                    value={viewMonth}
                    onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                    className="bg-sky-50/80 px-2 py-1 rounded-md border border-sky-200 cursor-pointer"
                  >
                    {namaBulan.map((nama, idx) => (
                      <option key={idx} value={idx}>{nama}</option>
                    ))}
                  </select>
                  <select
                    value={viewYear}
                    onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                    className="bg-sky-50/80 px-2 py-1 rounded-md border border-sky-200 cursor-pointer"
                  >
                    {Array.from(
                      { length: 4 },
                      (_, i) => new Date().getFullYear() + 1 - i
                    ).map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => gantiBulan(1)}
                  className="p-1 rounded-lg hover:bg-sky-100 text-sky-800 transition-colors"
                >
                  ❯
                </button>
              </div>

              {/* Nama Hari (Sen s/d Min) */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 py-2">
                <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span><span>Sab</span><span>Min</span>
              </div>

              {/* Grid Kotak Tanggal Hari (1 s/d 31) */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Spasi kosong sebelum tanggal 1 */}
                {Array.from({ length: hariPertamaIndex }).map((_, idx) => (
                  <span key={`empty-${idx}`} />
                ))}

                {/* Angka Tanggal */}
                {Array.from({ length: totalHariDalamBulan }).map((_, idx) => {
                  const hari = idx + 1;
                  const hariStr = String(hari).padStart(2, "0");
                  const blnStr = String(viewMonth + 1).padStart(2, "0");
                  const tglKey = `${viewYear}-${blnStr}-${hariStr}`;
                  const isSelected = selectedDate === tglKey;

                  return (
                    <button
                      key={hari}
                      type="button"
                      onClick={() => handlePilihTanggal(hari)}
                      className={`h-8 w-8 mx-auto text-xs font-semibold rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-sky-500 text-white font-extrabold shadow-sm scale-105"
                          : "text-slate-700 hover:bg-sky-100 hover:text-sky-900"
                      }`}
                    >
                      {hari}
                    </button>
                  );
                })}
              </div>

              {/* Tombol Aksi Cepat Bawah */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate("");
                    setIsCalendarOpen(false);
                  }}
                  className="text-slate-500 hover:text-slate-800 text-[11px] font-medium"
                >
                  Semua Tanggal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    setViewYear(now.getFullYear());
                    setViewMonth(now.getMonth());
                    handlePilihTanggal(now.getDate());
                  }}
                  className="text-sky-600 hover:text-sky-800 font-bold text-[11px]"
                >
                  Pilih Hari Ini
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. INPUT PENCARIAN TEKS */}
        <div>
          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
            Cari Berdasarkan Uraian / Kategori
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="Contoh: Sampah, Iuran, Blok A..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 border-sky-200 bg-sky-50/50 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Tab Filter Tipe: Semua / Pemasukan / Pengeluaran */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
        <Button
          type="button"
          size="xs"
          variant={filterTipe === "semua" ? "default" : "ghost"}
          onClick={() => setFilterTipe("semua")}
          className={`rounded-lg px-3.5 ${
            filterTipe !== "semua" ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : ""
          }`}
        >
          Semua Data ({transaksiFiltered.length})
        </Button>
        <Button
          type="button"
          size="xs"
          variant={filterTipe === "masuk" ? "default" : "ghost"}
          onClick={() => setFilterTipe("masuk")}
          className={`rounded-lg px-3.5 ${
            filterTipe !== "masuk" ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : ""
          }`}
        >
          Pemasukan Saja
        </Button>
        <Button
          type="button"
          size="xs"
          variant={filterTipe === "keluar" ? "default" : "ghost"}
          onClick={() => setFilterTipe("keluar")}
          className={`rounded-lg px-3.5 ${
            filterTipe !== "keluar" ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : ""
          }`}
        >
          Pengeluaran Saja
        </Button>
      </div>

      {/* DATA KAS: Kondisi Kosong / Tampil */}
      {transaksiFiltered.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm space-y-2">
          <p>Tidak ada transaksi yang cocok dengan tanggal atau kata kunci ini.</p>
          <button
            onClick={() => {
              setSelectedDate("");
              setSearchQuery("");
              setFilterTipe("semua");
            }}
            className="text-xs text-sky-600 hover:underline font-semibold"
          >
            Tampilkan Semua Transaksi
          </button>
        </div>
      ) : (
        <>
          {/* Tampilan 1: Format Kartu untuk HP (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {transaksiFiltered.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-sky-100 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">{item.tanggalText}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                    item.tipe === "masuk" ? "bg-sky-50 text-sky-700 border border-sky-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}>
                    {item.kategori}
                  </span>
                </div>
                <div className="font-semibold text-slate-800 text-sm">
                  {item.uraian}
                  {item.kepalaKeluargaText && (
                    <span className="block text-xs font-medium text-sky-700 mt-0.5">
                      Dari: {item.kepalaKeluargaText}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">Nominal:</span>
                  <span className={`font-bold ${item.tipe === "masuk" ? "text-sky-600" : "text-rose-600"}`}>
                    {item.tipe === "masuk" ? `+ ${formatRupiah(item.nominal)}` : `- ${formatRupiah(item.nominal)}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Saldo Akhir:</span>
                  <span className="font-bold text-slate-800">{formatRupiah(item.saldo)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tampilan 2: Format Tabel Lengkap untuk Laptop & PC (hidden sm:block) */}
          <div className="hidden sm:block border border-sky-100 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm">
              <thead className="bg-sky-50/70 border-b border-sky-100 text-sky-900 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5">Kategori</th>
                  <th className="px-4 py-3.5">Uraian Transaksi</th>
                  <th className="px-4 py-3.5 text-right">Pemasukan (Debit)</th>
                  <th className="px-4 py-3.5 text-right">Pengeluaran (Kredit)</th>
                  <th className="px-4 py-3.5 text-right">Saldo Kas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transaksiFiltered.map((item) => (
                  <tr key={item.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{item.tanggalText}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.tipe === "masuk" ? "bg-sky-50 text-sky-700 border border-sky-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}>
                        {item.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.uraian}
                      {item.kepalaKeluargaText && (
                        <span className="block text-xs font-medium text-sky-700 mt-0.5">
                          Dari: {item.kepalaKeluargaText}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-sky-600 whitespace-nowrap">
                      {item.tipe === "masuk" ? `+ ${formatRupiah(item.nominal)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-rose-500 whitespace-nowrap">
                      {item.tipe === "keluar" ? `- ${formatRupiah(item.nominal)}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {formatRupiah(item.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}