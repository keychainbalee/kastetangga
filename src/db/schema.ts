import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const transaksiKas = sqliteTable("transaksi_kas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tanggal: text("tanggal").notNull(), // Format: YYYY-MM-DD (misal: "2026-11-05")
  tipe: text("tipe", { enum: ["masuk", "keluar"] }).notNull(),
  kategori: text("kategori").notNull(), // Contoh: "Iuran Bulanan", "Operasional"
  uraian: text("uraian").notNull(),
  nominal: integer("nominal").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});