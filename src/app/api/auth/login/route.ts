import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/password";
import { attachSessionCookie, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const username = body.username?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Username atau kata sandi salah." },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      userId: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role,
    });
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
      },
    });

    attachSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error("Error pada proses login:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat login." },
      { status: 500 }
    );
  }
}
