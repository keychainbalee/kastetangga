import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
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
