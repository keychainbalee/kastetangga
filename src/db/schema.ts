import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const nowIso = () => new Date().toISOString();

export const kepalaKeluarga = sqliteTable("kepala_keluarga", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  namaKepalaKeluarga: text("nama_kepala_keluarga").notNull(),
  namaRumah: text("nama_rumah").notNull(),
  blok: text("blok").notNull(),
  mulaiIuranBulan: text("mulai_iuran_bulan").notNull().default("2026-09"),
  createdAt: text("created_at").$defaultFn(nowIso),
});

export const transaksiKas = sqliteTable("transaksi_kas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tanggal: text("tanggal").notNull(), // Format: YYYY-MM-DD (misal: "2026-11-05")
  tipe: text("tipe", { enum: ["masuk", "keluar"] }).notNull(),
  kategori: text("kategori").notNull(), // Contoh: "Iuran Bulanan", "Operasional"
  uraian: text("uraian").notNull(),
  nominal: integer("nominal").notNull(),
  kepalaKeluargaId: integer("kepala_keluarga_id").references(
    () => kepalaKeluarga.id,
    { onDelete: "set null" }
  ),
  createdAt: text("created_at").$defaultFn(nowIso),
});

export const pembayaranIuran = sqliteTable(
  "pembayaran_iuran",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    transaksiId: integer("transaksi_id")
      .notNull()
      .references(() => transaksiKas.id, { onDelete: "cascade" }),
    kepalaKeluargaId: integer("kepala_keluarga_id")
      .notNull()
      .references(() => kepalaKeluarga.id, { onDelete: "cascade" }),
    bulan: text("bulan").notNull(), // Format: YYYY-MM (misal: "2026-11")
    createdAt: text("created_at").$defaultFn(nowIso),
  },
  (table) => [
    uniqueIndex("iuran_kk_bulan_idx").on(table.kepalaKeluargaId, table.bulan),
  ]
);

export const pengaturanIuran = sqliteTable("pengaturan_iuran", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nominalPerBulan: integer("nominal_per_bulan").notNull().default(50000),
  mulaiPeriodeBulan: text("mulai_periode_bulan").notNull().default("2026-09"),
  updatedAt: text("updated_at").$defaultFn(nowIso),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nama: text("nama").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  createdAt: text("created_at").$defaultFn(nowIso),
});

export const kategoriKas = sqliteTable(
  "kategori_kas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nama: text("nama").notNull(),
    tipe: text("tipe", { enum: ["masuk", "keluar"] }).notNull(),
    createdAt: text("created_at").$defaultFn(nowIso),
  },
  (table) => [uniqueIndex("kategori_nama_tipe_idx").on(table.nama, table.tipe)]
);

export type UserRole = "admin" | "user";
export type TransaksiTipe = "masuk" | "keluar";
