import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireAdminApi } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as {
      nama?: string;
      username?: string;
      password?: string;
      role?: string;
    };

    const nama = body.nama?.trim() ?? "";
    const username = body.username?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const role = body.role;

    if (!nama) {
      return NextResponse.json({ error: "Nama lengkap wajib diisi." }, { status: 400 });
    }
    if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
      return NextResponse.json(
        { error: "Username harus 3-30 karakter (huruf kecil, angka, titik, atau garis bawah)." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal 6 karakter." },
        { status: 400 }
      );
    }
    if (role !== "admin" && role !== "user") {
      return NextResponse.json(
        { error: "Role harus 'admin' atau 'user'." },
        { status: 400 }
      );
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Username sudah terdaftar. Gunakan username lain." },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(users)
      .values({
        nama,
        username,
        passwordHash: hashPassword(password),
        role,
      })
      .returning({
        id: users.id,
        nama: users.nama,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
      });

    revalidatePath("/admin");
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("Gagal menambah user:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat akun pengguna." },
      { status: 500 }
    );
  }
}
