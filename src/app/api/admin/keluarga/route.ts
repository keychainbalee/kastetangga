import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { kepalaKeluarga } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { getPengaturanIuran } from "@/lib/kepala-keluarga";
import { validateKepalaKeluargaInput } from "@/lib/validators";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateKepalaKeluargaInput(body);
    if (!validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const pengaturan = await getPengaturanIuran();
    const mulaiIuranBulan =
      validation.data.mulaiIuranBulan ?? pengaturan.mulaiPeriodeBulan;

    const [created] = await db
      .insert(kepalaKeluarga)
      .values({
        namaKepalaKeluarga: validation.data.namaKepalaKeluarga,
        namaRumah: validation.data.namaRumah,
        blok: validation.data.blok,
        mulaiIuranBulan,
      })
      .returning();

    revalidatePath("/admin");

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Gagal menambah kepala keluarga:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan data kepala keluarga." },
      { status: 500 }
    );
  }
}
