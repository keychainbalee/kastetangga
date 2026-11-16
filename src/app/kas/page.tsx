import Link from "next/link";
import { db } from "@/db";
import { kepalaKeluarga, transaksiKas } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import KasCharts from "@/components/KasCharts";
import KasTableDetail from "@/components/KasTableDetail";

export const dynamic = "force-dynamic";

const bulanSingkat = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function formatTanggalSingkat(dateStr: string) {
  const [thn, bln, tgl] = dateStr.split("-");
  const nama = bulanSingkat[parseInt(bln, 10) - 1] ?? bln;
  return `${tgl} ${nama} ${thn}`;
}

export default async function KasPage() {
  interface KasQueryRow {
    id: number;
    tanggal: string;
    tipe: "masuk" | "keluar";
    kategori: string;
    uraian: string;
    nominal: number;
    namaKepalaKeluarga: string | null;
    namaRumah: string | null;
    blok: string | null;
  }

  let rows: KasQueryRow[] = [];
  let dbErrorDetail: string | null = null;

  try {
    rows = await db
      .select({
        id: transaksiKas.id,
        tanggal: transaksiKas.tanggal,
        tipe: transaksiKas.tipe,
        kategori: transaksiKas.kategori,
        uraian: transaksiKas.uraian,
        nominal: transaksiKas.nominal,
        namaKepalaKeluarga: kepalaKeluarga.namaKepalaKeluarga,
        namaRumah: kepalaKeluarga.namaRumah,
        blok: kepalaKeluarga.blok,
      })
      .from(transaksiKas)
      .leftJoin(
        kepalaKeluarga,
        eq(transaksiKas.kepalaKeluargaId, kepalaKeluarga.id)
      )
      .orderBy(asc(transaksiKas.tanggal), asc(transaksiKas.id));
  } catch (err) {
    console.error("Gagal mengambil data transaksi_kas di /kas:", err);
    const cause =
      err instanceof Error && "cause" in err && err.cause instanceof Error
        ? err.cause.message
        : err instanceof Error
          ? err.message
          : "Koneksi database gagal";
    dbErrorDetail = cause;
  }

  if (dbErrorDetail) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
            Gagal Memuat Data Kas
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Terjadi kendala saat mengambil data dari database
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Pastikan koneksi internet/Turso aktif, variabel <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">.env</code> sudah benar, dan skema tabel sudah diterapkan melalui <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">npx drizzle-kit push</code>.
          </p>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800 break-words">
            Detail error: {dbErrorDetail}
          </div>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <Link
              href="/kas"
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors"
            >
              Coba Muat Ulang
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-800 text-sm font-semibold transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let runningSaldo = 0;
  const transaksiDenganSaldo = rows.map((row) => {
    runningSaldo += row.tipe === "masuk" ? row.nominal : -row.nominal;
    const kepalaKeluargaText =
      row.tipe === "masuk" && row.namaKepalaKeluarga
        ? `${row.namaKepalaKeluarga} (${row.blok ?? ""}${row.namaRumah ? ` - ${row.namaRumah}` : ""})`
        : null;
    return {
      id: row.id,
      date: row.tanggal,
      tanggalText: formatTanggalSingkat(row.tanggal),
      tipe: row.tipe,
      kategori: row.kategori,
      uraian: row.uraian,
      kepalaKeluargaText,
      nominal: row.nominal,
      saldo: runningSaldo,
    };
  });

  const transaksiTerbaru = [...transaksiDenganSaldo].reverse();

  const dataBulanan = bulanSingkat.map((nama, idx) => {
    const prefix = `2026-${String(idx + 1).padStart(2, "0")}`;
    const transaksiBulan = rows.filter((r) => r.tanggal.startsWith(prefix));
    const masuk = transaksiBulan
      .filter((r) => r.tipe === "masuk")
      .reduce((sum, r) => sum + r.nominal, 0);
    const keluar = transaksiBulan
      .filter((r) => r.tipe === "keluar")
      .reduce((sum, r) => sum + r.nominal, 0);
    return { bulan: nama, masuk, keluar };
  });

  const warnaKategori = ["#0ea5e9", "#38bdf8", "#f43f5e", "#f59e0b", "#6366f1", "#10b981"];
  const mapKategori = new Map<string, number>();
  for (const row of rows) {
    mapKategori.set(row.kategori, (mapKategori.get(row.kategori) ?? 0) + row.nominal);
  }
  const dataProporsi = Array.from(mapKategori.entries()).map(([label, nominal], idx) => ({
    label,
    nominal,
    colorHex: warnaKategori[idx % warnaKategori.length],
  }));

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);

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
      <div className="bg-sky-50 border border-sky-200 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase text-sky-800 font-bold tracking-wider">Saldo Kas Aktif</span>
          <p className="text-2xl sm:text-4xl font-black text-sky-700 mt-1">{formatRupiah(runningSaldo)}</p>
          <span className="text-xs text-slate-600 block mt-1">
            Rekening Kas: <strong className="text-slate-800">Mandiri 123-00-XXXXXXX</strong> (a.n. RT 05)
          </span>
        </div>
        <div className="px-3.5 py-1.5 bg-white border border-sky-200 text-sky-800 rounded-xl text-xs font-semibold shadow-xs">
          {runningSaldo >= 0 ? "Kondisi Kas: Sehat" : "Kondisi Kas: Defisit"}
        </div>
      </div>

      {/* 2. Visualisasi Grafik (Pie Chart & Bar Chart) */}
      <KasCharts dataBulanan={dataBulanan} dataProporsi={dataProporsi} />

      {/* 3. Komponen Tabel Detail dengan Ikon Kalender & Pencarian */}
      <KasTableDetail transaksi={transaksiTerbaru} />
    </div>
  );
}