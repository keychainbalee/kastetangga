import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { pembayaranIuran, transaksiKas } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { formatBulanSingkat } from "@/lib/iuran";
import {
  findDuplicatePaidMonths,
  verifyKepalaKeluargaExists,
} from "@/lib/kepala-keluarga";
import { validateTransaksiInput } from "@/lib/validators";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateTransaksiInput(body);
    if (!validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { tanggal, tipe, kategori, uraian, nominal, kepalaKeluargaId, bulanIuran } =
      validation.data;

    const kkValid = await verifyKepalaKeluargaExists(kepalaKeluargaId);
    if (!kkValid) {
      return NextResponse.json(
        { error: "Data kepala keluarga yang dipilih tidak ditemukan." },
        { status: 400 }
      );
    }

    if (kepalaKeluargaId !== null && bulanIuran.length > 0) {
      const duplicates = await findDuplicatePaidMonths(
        kepalaKeluargaId,
        bulanIuran
      );
      if (duplicates.length > 0) {
        const daftar = duplicates.map(formatBulanSingkat).join(", ");
        return NextResponse.json(
          {
            error: `Bulan ${daftar} sudah tercatat lunas untuk kepala keluarga ini.`,
          },
          { status: 409 }
        );
      }
    }

    const created = await db.transaction(async (tx) => {
      const [insertedTx] = await tx
        .insert(transaksiKas)
        .values({
          tanggal,
          tipe,
          kategori,
          uraian,
          nominal,
          kepalaKeluargaId,
        })
        .returning();

      if (kepalaKeluargaId !== null && bulanIuran.length > 0) {
        await tx.insert(pembayaranIuran).values(
          bulanIuran.map((bulan) => ({
            transaksiId: insertedTx.id,
            kepalaKeluargaId,
            bulan,
          }))
        );
      }

      return insertedTx;
    });

    revalidatePath("/kas");
    revalidatePath("/admin");

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Gagal menambah transaksi:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan transaksi." },
      { status: 500 }
    );
  }
}
