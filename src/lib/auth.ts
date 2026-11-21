import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, type UserRole } from "@/db/schema";

export const SESSION_COOKIE_NAME = "wargakas_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export interface SessionUser {
  userId: number;
  username: string;
  nama: string;
  role: UserRole;
}

interface SessionTokenPayload {
  userId: number;
  username?: string;
  nama?: string;
  role?: UserRole;
  exp: number;
}

function getAuthSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.TURSO_AUTH_TOKEN ||
    "wargakas-rt05-dev-secret-key"
  );
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getAuthSecret())
    .update(encodedPayload)
    .digest("base64url");
}

/**
 * Membuat token sesi bertanda tangan HMAC-SHA256 beserta klaim pengguna ringan.
 */
export function createSessionToken(user: SessionUser): string {
  const payload: SessionTokenPayload = {
    userId: user.userId,
    username: user.username,
    nama: user.nama,
    role: user.role,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

/**
 * Memverifikasi tanda tangan dan masa berlaku token sesi.
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as SessionTokenPayload;

    if (
      typeof decoded.userId !== "number" ||
      typeof decoded.exp !== "number" ||
      decoded.exp < Date.now()
    ) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Mengambil sesi pengguna langsung dari tanda tangan cookie tanpa query database (untuk UI Navbar).
 */
export async function getSessionFromCookieOnly(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = verifySessionToken(token);
  if (!verified) return null;

  if (
    verified.username &&
    verified.nama &&
    (verified.role === "admin" || verified.role === "user")
  ) {
    return {
      userId: verified.userId,
      username: verified.username,
      nama: verified.nama,
      role: verified.role,
    };
  }

  return getSession();
}

/**
 * Mengambil data pengguna yang sedang login dari cookie dan mencocokkan role terbaru dari database.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const verified = verifySessionToken(token);
  if (!verified) return null;

  try {
    const [user] = await db
      .select({
        userId: users.id,
        username: users.username,
        nama: users.nama,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, verified.userId))
      .limit(1);

    return user ?? null;
  } catch {
    return null;
  }
}

/**
 * Melampirkan cookie sesi ke NextResponse.
 */
export function attachSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Menghapus cookie sesi pada NextResponse.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Memastikan pemanggil API memiliki sesi aktif dengan role "admin".
 */
export async function requireAdminApi(): Promise<
  | { session: SessionUser; errorResponse?: never }
  | { session?: never; errorResponse: NextResponse }
> {
  const session = await getSession();
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: "Sesi tidak ditemukan. Silakan login terlebih dahulu." },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "admin") {
    return {
      errorResponse: NextResponse.json(
        { error: "Akses ditolak. Fitur ini khusus untuk role admin." },
        { status: 403 }
      ),
    };
  }

  return { session };
}
