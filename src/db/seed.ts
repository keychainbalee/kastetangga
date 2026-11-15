import * as dotenv from "dotenv";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { transaksiKas } from "./schema";

// Muat variabel dari file .env
dotenv.config();

async function main() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const db = drizzle(client);

  try {
    const isReset = process.argv.includes("--reset");

    if (isReset) {
      console.log("Menghapus data lama di tabel transaksi_kas...");
      await db.delete(transaksiKas);
    } else {
      // Cek agar tidak terjadi duplikasi data
      const existing = await db.select().from(transaksiKas).limit(1);
      if (existing.length > 0) {
        console.log("Tabel transaksi_kas sudah berisi data. Seeding dilewati.");
        console.log("Tip: Jalankan 'npx tsx src/db/seed.ts --reset' jika ingin mengisi ulang.");
        return;
      }
    }

    console.log("Mengisi data awal transaksi kas ke Turso...");

    await db.insert(transaksiKas).values([
      {
        tanggal: "2026-09-12",
        tipe: "masuk",
        kategori: "Iuran Bulanan",
        uraian: "Iuran Warga Terpadu Periode September",
        nominal: 3200000,
      },
      {
        tanggal: "2026-09-28",
        tipe: "keluar",
        kategori: "Keamanan",
        uraian: "Pembelian Senter & Rompi Petugas Pos Ronda",
        nominal: 450000,
      },
      {
        tanggal: "2026-10-03",
        tipe: "keluar",
        kategori: "Operasional",
        uraian: "Honor Bulanan Petugas Kebersihan Sampah",
        nominal: 800000,
      },
      {
        tanggal: "2026-10-10",
        tipe: "masuk",
        kategori: "Donasi",
        uraian: "Sumbangan Sukarela Warga untuk Kas Lapangan",
        nominal: 500000,
      },
      {
        tanggal: "2026-10-15",
        tipe: "masuk",
        kategori: "Iuran Bulanan",
        uraian: "Iuran Warga Blok E & F (20 KK)",
        nominal: 1000000,
      },
      {
        tanggal: "2026-10-25",
        tipe: "keluar",
        kategori: "Sosial",
        uraian: "Santunan Duka Keluarga Alm. Bpk Hendra (Blok B)",
        nominal: 500000,
      },
      {
        tanggal: "2026-10-28",
        tipe: "keluar",
        kategori: "Pemeliharaan",
        uraian: "Penggantian Lampu Penerangan Jalan (3 Titik)",
        nominal: 350000,
      },
      {
        tanggal: "2026-11-01",
        tipe: "masuk",
        kategori: "Iuran Bulanan",
        uraian: "Iuran Rutin Warga Blok C & D (20 KK)",
        nominal: 1000000,
      },
      {
        tanggal: "2026-11-03",
        tipe: "keluar",
        kategori: "Operasional",
        uraian: "Honor Petugas Sampah & Kebersihan Lingkungan",
        nominal: 800000,
      },
      {
        tanggal: "2026-11-05",
        tipe: "masuk",
        kategori: "Iuran Bulanan",
        uraian: "Iuran Rutin Warga Blok A & B (24 KK)",
        nominal: 1200000,
      },
    ]);

    console.log("Berhasil mengisi 10 data awal ke Turso!");
  } finally {
    // Selalu tutup koneksi dengan rapi
    client.close();
  }
}

main().catch((err) => {
  console.error("Gagal melakukan seeding:", err);
  process.exitCode = 1;
});