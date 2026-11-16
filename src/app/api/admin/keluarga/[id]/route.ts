import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { kepalaKeluarga } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { validateKepalaKeluargaInput } from "@/lib/validators";

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
  const keluargaId = parseId(id);
  if (!keluargaId) {
    return NextResponse.json({ error: "ID kepala keluarga tidak valid." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateKepalaKeluargaInput(body);
    if (!validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const [updated] = await db
      .update(kepalaKeluarga)
      .set(validation.data)
      .where(eq(kepalaKeluarga.id, keluargaId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Data kepala keluarga tidak ditemukan." },
        { status: 404 }
      );
    }

    revalidatePath("/admin");
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Gagal memperbarui data kepala keluarga:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui data kepala keluarga." },
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
  const keluargaId = parseId(id);
  if (!keluargaId) {
    return NextResponse.json({ error: "ID kepala keluarga tidak valid." }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(kepalaKeluarga)
      .where(eq(kepalaKeluarga.id, keluargaId))
      .returning({ id: kepalaKeluarga.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Data kepala keluarga tidak ditemukan." },
        { status: 404 }
      );
    }

    revalidatePath("/admin");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus data kepala keluarga:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus data kepala keluarga." },
      { status: 500 }
    );
  }
}
