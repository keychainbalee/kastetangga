import { NextResponse } from "next/server";
import { getSessionFromCookieOnly } from "@/lib/auth";

export async function GET() {
  const session = await getSessionFromCookieOnly();
  return NextResponse.json({
    user: session
      ? {
          id: session.userId,
          username: session.username,
          nama: session.nama,
          role: session.role,
        }
      : null,
  });
}
