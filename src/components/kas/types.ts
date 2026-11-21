export interface KasIuranKeluargaItem {
  id: number;
  namaKepalaKeluarga: string;
  namaRumah: string;
  blok: string;
  mulaiIuranBulan: string;
  status: "menunggak" | "lunas" | "bayar_di_muka";
  tunggakanBulan: string[];
  bulanDiMuka: string[];
  totalNominalTunggakan: number;
}

export interface KasIuranSummary {
  totalKk: number;
  totalKkMenunggak: number;
  totalKkLunas: number;
  persenKepatuhan: number;
  totalBulanTunggakan: number;
  totalNominalTunggakan: number;
  nominalPerBulan: number;
  mulaiPeriodeBulan: string;
}

export interface KasBlokRekap {
  blok: string;
  totalKk: number;
  lunasKk: number;
  menunggakKk: number;
  totalNominalTunggakan: number;
  persenKepatuhan: number;
}

export function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}
