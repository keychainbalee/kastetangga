import { redirect } from "next/navigation";
import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { kategoriKas, kepalaKeluarga, transaksiKas, users } from "@/db/schema";
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

  const [transaksiRows, userRows, kategoriRows, keluargaRows] = await Promise.all([
    db
      .select({
        id: transaksiKas.id,
        tanggal: transaksiKas.tanggal,
        tipe: transaksiKas.tipe,
        kategori: transaksiKas.kategori,
        uraian: transaksiKas.uraian,
        nominal: transaksiKas.nominal,
        kepalaKeluargaId: transaksiKas.kepalaKeluargaId,
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
    db
      .select({
        id: kategoriKas.id,
        nama: kategoriKas.nama,
        tipe: kategoriKas.tipe,
      })
      .from(kategoriKas)
      .orderBy(asc(kategoriKas.tipe), asc(kategoriKas.nama)),
    db
      .select({
        id: kepalaKeluarga.id,
        namaKepalaKeluarga: kepalaKeluarga.namaKepalaKeluarga,
        namaRumah: kepalaKeluarga.namaRumah,
        blok: kepalaKeluarga.blok,
      })
      .from(kepalaKeluarga)
      .orderBy(
        asc(kepalaKeluarga.blok),
        asc(kepalaKeluarga.namaRumah),
        asc(kepalaKeluarga.namaKepalaKeluarga)
      ),
  ]);

  return (
    <AdminDashboardClient
      currentUser={session}
      transaksiList={transaksiRows}
      usersList={userRows}
      kategoriList={kategoriRows}
      keluargaList={keluargaRows}
    />
  );
}
