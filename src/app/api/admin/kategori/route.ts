import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { kategoriKas } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { validateKategoriInput } from "@/lib/validators";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const validation = validateKategoriInput(body);
    if (!validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { nama, tipe } = validation.data;

    // Cek duplikat case-insensitive pada tipe yang sama
    const existing = await db
      .select({ id: kategoriKas.id })
      .from(kategoriKas)
      .where(
        and(
          eq(kategoriKas.tipe, tipe),
          sql`lower(${kategoriKas.nama}) = ${nama.toLowerCase()}`
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Kategori "${nama}" sudah ada untuk tipe kas ${tipe}.` },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(kategoriKas)
      .values({ nama, tipe })
      .returning();

    revalidatePath("/admin");
    revalidatePath("/kas");

    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Gagal menambah kategori:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan kategori." },
      { status: 500 }
    );
  }
}
