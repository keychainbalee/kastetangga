import { eq } from "drizzle-orm";
import { db } from "@/db";
import { kepalaKeluarga } from "@/db/schema";

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
