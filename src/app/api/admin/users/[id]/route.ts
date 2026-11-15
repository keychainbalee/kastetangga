import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";

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
  const userId = parseId(id);
  if (!userId) {
    return NextResponse.json({ error: "ID pengguna tidak valid." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { role?: string };
    if (body.role !== "admin" && body.role !== "user") {
      return NextResponse.json(
        { error: "Role harus 'admin' atau 'user'." },
        { status: 400 }
      );
    }

    // Mencegah admin menurunkan role akun sendiri agar tidak terkunci keluar
    if (userId === auth.session.userId && body.role !== "admin") {
      return NextResponse.json(
        { error: "Tidak dapat mengubah role akun Anda sendiri yang sedang aktif." },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(users)
      .set({ role: body.role })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        nama: users.nama,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
      });

    if (!updated) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    revalidatePath("/admin");
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("Gagal memperbarui role pengguna:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui role pengguna." },
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
  const userId = parseId(id);
  if (!userId) {
    return NextResponse.json({ error: "ID pengguna tidak valid." }, { status: 400 });
  }

  if (userId === auth.session.userId) {
    return NextResponse.json(
      { error: "Tidak dapat menghapus akun Anda sendiri yang sedang aktif." },
      { status: 400 }
    );
  }

  try {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    if (!deleted) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    revalidatePath("/admin");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal menghapus pengguna:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghapus pengguna." },
      { status: 500 }
    );
  }
}
