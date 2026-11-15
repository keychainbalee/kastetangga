import * as dotenv from "dotenv";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { transaksiKas, users } from "./schema";
import { hashPassword } from "../lib/password";

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
      console.log("Menghapus data lama di tabel transaksi_kas dan users...");
      await db.delete(transaksiKas);
      await db.delete(users);
    }

    // 1. Seed tabel transaksi_kas jika masih kosong
    const existingKas = await db.select().from(transaksiKas).limit(1);
    if (existingKas.length > 0) {
      console.log("Tabel transaksi_kas sudah berisi data. Seeding transaksi_kas dilewati.");
    } else {
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

      console.log("Berhasil mengisi 10 data awal transaksi_kas ke Turso!");
    }

    // 2. Seed tabel users (role admin & user) jika masih kosong
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Tabel users sudah berisi data. Seeding users dilewati.");
    } else {
      const adminNama = process.env.SEED_ADMIN_NAME?.trim();
      const adminUsername = process.env.SEED_ADMIN_USERNAME?.trim().toLowerCase();
      const adminPassword = process.env.SEED_ADMIN_PASSWORD;

      if (!adminNama || !adminUsername || !adminPassword) {
        throw new Error(
          "Variabel SEED_ADMIN_NAME, SEED_ADMIN_USERNAME, dan SEED_ADMIN_PASSWORD wajib diatur di file .env"
        );
      }

      console.log("Mengisi data awal akun user & admin ke Turso...");

      await db.insert(users).values([
        {
          nama: adminNama,
          username: adminUsername,
          passwordHash: hashPassword(adminPassword),
          role: "admin",
        },
        {
          nama: "Warga RT 05",
          username: "warga",
          passwordHash: hashPassword("warga123"),
          role: "user",
        },
      ]);

      console.log("Berhasil mengisi 2 akun awal (admin dari .env & user) ke Turso!");
    }
  } finally {
    // Selalu tutup koneksi dengan rapi
    client.close();
  }
}

main().catch((err) => {
  console.error("Gagal melakukan seeding:", err);
  process.exitCode = 1;
});
