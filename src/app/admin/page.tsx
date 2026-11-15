import { redirect } from "next/navigation";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { transaksiKas, users } from "@/db/schema";
import { getSession } from "@/lib/auth";
import AdminAccessDenied from "@/components/AdminAccessDenied";
import AdminDashboardClient from "@/components/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();

  // Belum login -> arahkan ke halaman login
  if (!session) {
    redirect("/login");
  }

  // Sudah login tetapi bukan role admin -> tolak akses ke dashboard admin
  if (session.role !== "admin") {
    return <AdminAccessDenied user={session} />;
  }

  const [transaksiRows, userRows] = await Promise.all([
    db
      .select({
        id: transaksiKas.id,
        tanggal: transaksiKas.tanggal,
        tipe: transaksiKas.tipe,
        kategori: transaksiKas.kategori,
        uraian: transaksiKas.uraian,
        nominal: transaksiKas.nominal,
      })
      .from(transaksiKas)
      .orderBy(desc(transaksiKas.tanggal), desc(transaksiKas.id)),
    db
      .select({
        id: users.id,
        nama: users.nama,
        username: users.username,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(asc(users.id)),
  ]);

  return (
    <AdminDashboardClient
      currentUser={session}
      transaksiList={transaksiRows}
      usersList={userRows}
    />
  );
}
