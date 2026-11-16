import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const transaksiKas = sqliteTable("transaksi_kas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tanggal: text("tanggal").notNull(), // Format: YYYY-MM-DD (misal: "2026-11-05")
  tipe: text("tipe", { enum: ["masuk", "keluar"] }).notNull(),
  kategori: text("kategori").notNull(), // Contoh: "Iuran Bulanan", "Operasional"
  uraian: text("uraian").notNull(),
  nominal: integer("nominal").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nama: text("nama").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "user"] }).notNull().default("user"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const kategoriKas = sqliteTable(
  "kategori_kas",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nama: text("nama").notNull(),
    tipe: text("tipe", { enum: ["masuk", "keluar"] }).notNull(),
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  },
  (table) => [uniqueIndex("kategori_nama_tipe_idx").on(table.nama, table.tipe)]
);

export const kepalaKeluarga = sqliteTable("kepala_keluarga", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  namaKepalaKeluarga: text("nama_kepala_keluarga").notNull(),
  namaRumah: text("nama_rumah").notNull(),
  blok: text("blok").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export type UserRole = "admin" | "user";
export type TransaksiTipe = "masuk" | "keluar";