import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { transaksiKas } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { validateTransaksiInput } from "@/lib/validators";
import { verifyKepalaKeluargaExists } from "@/lib/kepala-keluarga";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateTransaksiInput(body);
    if (!validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const kkValid = await verifyKepalaKeluargaExists(
      validation.data.kepalaKeluargaId
    );
    if (!kkValid) {
      return NextResponse.json(
        { error: "Data kepala keluarga yang dipilih tidak ditemukan." },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(transaksiKas)
      .values(validation.data)
      .returning();

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
