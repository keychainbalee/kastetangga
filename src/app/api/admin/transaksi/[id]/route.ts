import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { transaksiKas } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
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

    const [updated] = await db
      .update(transaksiKas)
      .set(validation.data)
      .where(eq(transaksiKas.id, transaksiId))
      .returning();

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
