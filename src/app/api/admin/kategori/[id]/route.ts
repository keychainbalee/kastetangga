import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { kategoriKas } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { validateKategoriInput } from "@/lib/validators";

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
  const kategoriId = parseId(id);
  if (!kategoriId) {
    return NextResponse.json({ error: "ID kategori tidak valid." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateKategoriInput(body);
    if (!validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { nama, tipe } = validation.data;

    const duplicate = await db
      .select({ id: kategoriKas.id })
      .from(kategoriKas)
      .where(
        and(
          ne(kategoriKas.id, kategoriId),
          eq(kategoriKas.tipe, tipe),
          sql`lower(${kategoriKas.nama}) = ${nama.toLowerCase()}`
        )
      )
      .limit(1);

    if (duplicate.length > 0) {
      return NextResponse.json(
        { error: `Kategori "${nama}" sudah ada untuk tipe kas ${tipe}.` },
        { status: 409 }
      );
    }

    const [updated] = await db
      .update(kategoriKas)
      .set({ nama, tipe })
      .where(eq(kategoriKas.id, kategoriId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    revalidatePath("/admin");
    revalidatePath("/kas");

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Gagal memperbarui kategori:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui kategori." },
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
  const kategoriId = parseId(id);
  if (!kategoriId) {
    return NextResponse.json({ error: "ID kategori tidak valid." }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(kategoriKas)
      .where(eq(kategoriKas.id, kategoriId))
      .returning({ id: kategoriKas.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan." },
        { status: 404 }
      );
    }

    revalidatePath("/admin");
    revalidatePath("/kas");

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus kategori:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus kategori." },
      { status: 500 }
    );
  }
}
