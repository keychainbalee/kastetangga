import Link from "next/link";
import { unstable_cache } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { kepalaKeluarga, pembayaranIuran, transaksiKas } from "@/db/schema";
import KasTransparansiClient from "@/components/KasTransparansiClient";
import SystemDateTimeBadge from "@/components/SystemDateTimeBadge";
import type {
  KasBlokRekap,
  KasIuranKeluargaItem,
  KasIuranSummary,
} from "@/components/kas/types";
import { getCurrentYearMonth, hitungStatusIuranKeluarga } from "@/lib/iuran";
import { getPengaturanIuran } from "@/lib/kepala-keluarga";

export const revalidate = 300;

const getCachedKasPageData = unstable_cache(
  async () => {
    const [transaksiRows, keluargaRows, pembayaranRows, pengaturanIuran] =
      await Promise.all([
        db
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
          .orderBy(asc(transaksiKas.tanggal), asc(transaksiKas.id)),
        db
          .select({
            id: kepalaKeluarga.id,
            namaKepalaKeluarga: kepalaKeluarga.namaKepalaKeluarga,
            namaRumah: kepalaKeluarga.namaRumah,
            blok: kepalaKeluarga.blok,
            mulaiIuranBulan: kepalaKeluarga.mulaiIuranBulan,
          })
          .from(kepalaKeluarga)
          .orderBy(
            asc(kepalaKeluarga.blok),
            asc(kepalaKeluarga.namaRumah),
            asc(kepalaKeluarga.namaKepalaKeluarga)
          ),
        db
          .select({
            kepalaKeluargaId: pembayaranIuran.kepalaKeluargaId,
            bulan: pembayaranIuran.bulan,
          })
          .from(pembayaranIuran)
          .orderBy(asc(pembayaranIuran.bulan)),
        getPengaturanIuran(),
      ]);

    return {
      transaksiRows,
      keluargaRows,
      pembayaranRows,
      pengaturanIuran,
    };
  },
  ["kas-public-data"],
  {
    tags: ["kas-data"],
    revalidate: 300,
  }
);

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
  let cachedData: Awaited<ReturnType<typeof getCachedKasPageData>> | null =
    null;
  let dbErrorDetail: string | null = null;

  try {
    cachedData = await getCachedKasPageData();
  } catch (err) {
    console.error("Gagal mengambil data transparansi kas di /kas:", err);
    const cause =
      err instanceof Error && "cause" in err && err.cause instanceof Error
        ? err.cause.message
        : err instanceof Error
          ? err.message
          : "Koneksi database gagal";
    dbErrorDetail = cause;
  }

  if (dbErrorDetail || !cachedData) {
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
            Pastikan koneksi internet/Turso aktif, variabel{" "}
            <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">.env</code>{" "}
            sudah benar, dan skema tabel sudah diterapkan melalui{" "}
            <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs">
              npx drizzle-kit push
            </code>
            .
          </p>
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-mono text-rose-800 break-words">
            Detail error: {dbErrorDetail ?? "Data kas tidak tersedia."}
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

  const {
    transaksiRows: rows,
    keluargaRows,
    pembayaranRows,
    pengaturanIuran,
  } = cachedData;

  let runningSaldo = 0;
  let totalMasuk = 0;
  let totalKeluar = 0;

  const transaksiDenganSaldo = rows.map((row) => {
    if (row.tipe === "masuk") {
      runningSaldo += row.nominal;
      totalMasuk += row.nominal;
    } else {
      runningSaldo -= row.nominal;
      totalKeluar += row.nominal;
    }
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

  const tahunAktif = new Date().getFullYear();
  const dataBulanan = bulanSingkat.map((nama, idx) => {
    const prefix = `${tahunAktif}-${String(idx + 1).padStart(2, "0")}`;
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

  // Hitung status iuran & tunggakan per KK dan rekap per Blok
  const currentYm = getCurrentYearMonth();
  const paidMonthsByKk = new Map<number, string[]>();
  for (const pay of pembayaranRows) {
    const list = paidMonthsByKk.get(pay.kepalaKeluargaId);
    if (list) {
      list.push(pay.bulan);
    } else {
      paidMonthsByKk.set(pay.kepalaKeluargaId, [pay.bulan]);
    }
  }

  const statusIuranRaw: KasIuranKeluargaItem[] = keluargaRows.map((kk) => {
    const mulaiBulan =
      kk.mulaiIuranBulan || pengaturanIuran.mulaiPeriodeBulan;
    const paidMonths = paidMonthsByKk.get(kk.id) ?? [];
    const info = hitungStatusIuranKeluarga(
      mulaiBulan,
      paidMonths,
      currentYm,
      pengaturanIuran.nominalPerBulan
    );
    return {
      id: kk.id,
      namaKepalaKeluarga: kk.namaKepalaKeluarga,
      namaRumah: kk.namaRumah,
      blok: kk.blok,
      mulaiIuranBulan: mulaiBulan,
      status: info.status,
      tunggakanBulan: info.tunggakanBulan,
      bulanDiMuka: info.bulanDiMuka,
      totalNominalTunggakan: info.totalNominalTunggakan,
    };
  });

  // Prioritaskan KK yang memiliki tunggakan terbanyak di urutan paling atas
  const statusIuranList = [...statusIuranRaw].sort((a, b) => {
    const diffTunggakan = b.tunggakanBulan.length - a.tunggakanBulan.length;
    if (diffTunggakan !== 0) return diffTunggakan;
    const diffBlok = a.blok.localeCompare(b.blok, "id");
    if (diffBlok !== 0) return diffBlok;
    const diffRumah = a.namaRumah.localeCompare(b.namaRumah, "id");
    if (diffRumah !== 0) return diffRumah;
    return a.namaKepalaKeluarga.localeCompare(b.namaKepalaKeluarga, "id");
  });

  let totalKkMenunggak = 0;
  let totalBulanTunggakan = 0;
  let totalNominalTunggakan = 0;
  const blokAccumulator = new Map<
    string,
    { totalKk: number; lunasKk: number; menunggakKk: number; totalNominalTunggakan: number }
  >();

  for (const item of statusIuranList) {
    const entry = blokAccumulator.get(item.blok) ?? {
      totalKk: 0,
      lunasKk: 0,
      menunggakKk: 0,
      totalNominalTunggakan: 0,
    };
    entry.totalKk += 1;

    if (item.status === "menunggak") {
      totalKkMenunggak += 1;
      totalBulanTunggakan += item.tunggakanBulan.length;
      totalNominalTunggakan += item.totalNominalTunggakan;
      entry.menunggakKk += 1;
      entry.totalNominalTunggakan += item.totalNominalTunggakan;
    } else {
      entry.lunasKk += 1;
    }

    blokAccumulator.set(item.blok, entry);
  }

  const totalKk = statusIuranList.length;
  const totalKkLunas = totalKk - totalKkMenunggak;
  const iuranSummary: KasIuranSummary = {
    totalKk,
    totalKkMenunggak,
    totalKkLunas,
    persenKepatuhan:
      totalKk > 0 ? Math.round((totalKkLunas / totalKk) * 100) : 100,
    totalBulanTunggakan,
    totalNominalTunggakan,
    nominalPerBulan: pengaturanIuran.nominalPerBulan,
    mulaiPeriodeBulan: pengaturanIuran.mulaiPeriodeBulan,
  };

  const rekapPerBlok: KasBlokRekap[] = Array.from(blokAccumulator.entries())
    .sort(([a], [b]) => a.localeCompare(b, "id"))
    .map(([blok, data]) => ({
      blok,
      ...data,
      persenKepatuhan:
        data.totalKk > 0
          ? Math.round((data.lunasKk / data.totalKk) * 100)
          : 100,
    }));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900">
            Transparansi Kas RT
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Laporan arus kas masuk, kas keluar, dan status kepatuhan iuran warga RT 05.
          </p>
        </div>
        <SystemDateTimeBadge />
      </div>

      <KasTransparansiClient
        runningSaldo={runningSaldo}
        totalMasuk={totalMasuk}
        totalKeluar={totalKeluar}
        dataBulanan={dataBulanan}
        dataProporsi={dataProporsi}
        tahunAktif={tahunAktif}
        transaksiTerbaru={transaksiTerbaru}
        statusIuranList={statusIuranList}
        iuranSummary={iuranSummary}
        rekapPerBlok={rekapPerBlok}
        currentYm={currentYm}
      />
    </div>
  );
}
