import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pengaturanIuran } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { validatePengaturanIuranInput } from "@/lib/validators";

export async function PATCH(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validatePengaturanIuranInput(body);
    if (!validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: pengaturanIuran.id })
      .from(pengaturanIuran)
      .limit(1);

    let saved;
    if (existing) {
      const [updated] = await db
        .update(pengaturanIuran)
        .set({
          nominalPerBulan: validation.data.nominalPerBulan,
          mulaiPeriodeBulan: validation.data.mulaiPeriodeBulan,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(pengaturanIuran.id, existing.id))
        .returning();
      saved = updated;
    } else {
      const [created] = await db
        .insert(pengaturanIuran)
        .values(validation.data)
        .returning();
      saved = created;
    }

    revalidatePath("/admin");
    return NextResponse.json({ data: saved });
  } catch (err) {
    console.error("Gagal memperbarui pengaturan iuran:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan pengaturan iuran." },
      { status: 500 }
    );
  }
}
