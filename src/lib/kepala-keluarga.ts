import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import {
  kepalaKeluarga,
  pembayaranIuran,
  pengaturanIuran,
} from "@/db/schema";
import { DEFAULT_MULAI_BULAN, DEFAULT_TARIF_IURAN } from "./iuran";

/**
 * Memastikan kepalaKeluargaId valid dan ada di database jika dipilih.
 */
export async function verifyKepalaKeluargaExists(
  kepalaKeluargaId: number | null
): Promise<boolean> {
  if (kepalaKeluargaId === null) return true;

  const [row] = await db
    .select({ id: kepalaKeluarga.id })
    .from(kepalaKeluarga)
    .where(eq(kepalaKeluarga.id, kepalaKeluargaId))
    .limit(1);

  return Boolean(row);
}

/**
 * Mengecek apakah ada bulan iuran yang sudah lunas pada transaksi lain untuk kepala keluarga terkait.
 */
export async function findDuplicatePaidMonths(
  kepalaKeluargaId: number,
  bulanIuran: string[],
  excludeTransaksiId?: number
): Promise<string[]> {
  if (bulanIuran.length === 0) return [];

  const conditions = [
    eq(pembayaranIuran.kepalaKeluargaId, kepalaKeluargaId),
    inArray(pembayaranIuran.bulan, bulanIuran),
  ];

  if (excludeTransaksiId !== undefined) {
    conditions.push(ne(pembayaranIuran.transaksiId, excludeTransaksiId));
  }

  const rows = await db
    .select({ bulan: pembayaranIuran.bulan })
    .from(pembayaranIuran)
    .where(and(...conditions));

  return rows.map((r) => r.bulan).sort();
}

/**
 * Mengambil pengaturan standar iuran RT (dengan fallback default jika belum ada di tabel).
 */
export async function getPengaturanIuran(): Promise<{
  nominalPerBulan: number;
  mulaiPeriodeBulan: string;
}> {
  try {
    const [row] = await db
      .select({
        nominalPerBulan: pengaturanIuran.nominalPerBulan,
        mulaiPeriodeBulan: pengaturanIuran.mulaiPeriodeBulan,
      })
      .from(pengaturanIuran)
      .limit(1);

    if (row) return row;
  } catch {
    // Fallback default bila baris pengaturan belum dibuat
  }

  return {
    nominalPerBulan: DEFAULT_TARIF_IURAN,
    mulaiPeriodeBulan: DEFAULT_MULAI_BULAN,
  };
}
