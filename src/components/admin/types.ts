import type { TransaksiTipe, UserRole } from "@/db/schema";

export interface AdminTransaksiRow {
  id: number;
  tanggal: string;
  tipe: "masuk" | "keluar";
  kategori: string;
  uraian: string;
  nominal: number;
  kepalaKeluargaId: number | null;
}

export interface AdminUserRow {
  id: number;
  nama: string;
  username: string;
  role: UserRole;
  createdAt: string | null;
}

export interface AdminKategoriRow {
  id: number;
  nama: string;
  tipe: TransaksiTipe;
}

export interface AdminKeluargaRow {
  id: number;
  namaKepalaKeluarga: string;
  namaRumah: string;
  blok: string;
  mulaiIuranBulan: string;
}

export function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}
