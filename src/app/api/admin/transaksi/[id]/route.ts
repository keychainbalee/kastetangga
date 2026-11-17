import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pembayaranIuran, transaksiKas } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { formatBulanSingkat } from "@/lib/iuran";
import {
  findDuplicatePaidMonths,
  verifyKepalaKeluargaExists,
} from "@/lib/kepala-keluarga";
import { validateTransaksiInput } from "@/lib/validators";

function parseId(rawId: string): number | null {
  const num = Number(rawId);
  return Number.isInteger(num) && num > 0 ? num : null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  const transaksiId = parseId(id);
  if (!transaksiId) {
    return NextResponse.json({ error: "ID transaksi tidak valid." }, { status: 400 });
  }

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
        bulanIuran,
        transaksiId
      );
      if (duplicates.length > 0) {
        const daftar = duplicates.map(formatBulanSingkat).join(", ");
        return NextResponse.json(
          {
            error: `Bulan ${daftar} sudah tercatat lunas di transaksi lain untuk kepala keluarga ini.`,
          },
          { status: 409 }
        );
      }
    }

    const updated = await db.transaction(async (tx) => {
      const [updatedTx] = await tx
        .update(transaksiKas)
        .set({
          tanggal,
          tipe,
          kategori,
          uraian,
          nominal,
          kepalaKeluargaId,
        })
        .where(eq(transaksiKas.id, transaksiId))
        .returning();

      if (!updatedTx) {
        return null;
      }

      await tx
        .delete(pembayaranIuran)
        .where(eq(pembayaranIuran.transaksiId, transaksiId));

      if (kepalaKeluargaId !== null && bulanIuran.length > 0) {
        await tx.insert(pembayaranIuran).values(
          bulanIuran.map((bulan) => ({
            transaksiId,
            kepalaKeluargaId,
            bulan,
          }))
        );
      }

      return updatedTx;
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    revalidatePath("/kas");
    revalidatePath("/admin");

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Gagal memperbarui transaksi:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui transaksi." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = await context.params;
  const transaksiId = parseId(id);
  if (!transaksiId) {
    return NextResponse.json({ error: "ID transaksi tidak valid." }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(transaksiKas)
      .where(eq(transaksiKas.id, transaksiId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    revalidatePath("/kas");
    revalidatePath("/admin");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus transaksi:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus transaksi." },
      { status: 500 }
    );
  }
}
