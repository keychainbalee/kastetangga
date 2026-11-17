export const DEFAULT_TARIF_IURAN = 50000;
export const DEFAULT_MULAI_BULAN = "2026-09";

const BULAN_SINGKAT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const BULAN_LENGKAP = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function isValidBulan(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function addMonths(ym: string, offset: number): string {
  if (!isValidBulan(ym)) return ym;
  const [yStr, mStr] = ym.split("-");
  const totalMonths = Number(yStr) * 12 + (Number(mStr) - 1) + offset;
  const nextYear = Math.floor(totalMonths / 12);
  const nextMonth = ((totalMonths % 12) + 12) % 12;
  return `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}`;
}

export function generateMonthRange(startYm: string, endYm: string): string[] {
  if (!isValidBulan(startYm) || !isValidBulan(endYm) || startYm > endYm) {
    return [];
  }
  const result: string[] = [];
  let cursor = startYm;
  let guard = 0;
  while (cursor <= endYm && guard < 120) {
    result.push(cursor);
    cursor = addMonths(cursor, 1);
    guard += 1;
  }
  return result;
}

export function formatBulanSingkat(ym: string): string {
  if (!isValidBulan(ym)) return ym;
  const [thn, bln] = ym.split("-");
  const idx = parseInt(bln, 10) - 1;
  return `${BULAN_SINGKAT[idx] ?? bln} ${thn}`;
}

export function formatBulanLengkap(ym: string): string {
  if (!isValidBulan(ym)) return ym;
  const [thn, bln] = ym.split("-");
  const idx = parseInt(bln, 10) - 1;
  return `${BULAN_LENGKAP[idx] ?? bln} ${thn}`;
}

export function getMonthsForYear(year: number): { ym: string; label: string }[] {
  return BULAN_SINGKAT.map((label, idx) => ({
    ym: `${year}-${String(idx + 1).padStart(2, "0")}`,
    label,
  }));
}

export interface StatusIuranKeluarga {
  tunggakanBulan: string[];
  bulanDiMuka: string[];
  bulanLunasTotal: string[];
  totalNominalTunggakan: number;
  status: "menunggak" | "lunas" | "bayar_di_muka";
}

export function hitungStatusIuranKeluarga(
  mulaiIuranBulan: string,
  paidMonths: Iterable<string>,
  currentYm: string,
  tarifPerBulan: number
): StatusIuranKeluarga {
  const paidSet = new Set(Array.from(paidMonths).filter(isValidBulan));
  const start = isValidBulan(mulaiIuranBulan) ? mulaiIuranBulan : currentYm;
  const wajibBulan = generateMonthRange(start, currentYm);
  const tunggakanBulan = wajibBulan.filter((ym) => !paidSet.has(ym));
  const bulanLunasTotal = Array.from(paidSet).sort();
  const bulanDiMuka = bulanLunasTotal.filter((ym) => ym > currentYm);

  const status: StatusIuranKeluarga["status"] =
    tunggakanBulan.length > 0
      ? "menunggak"
      : bulanDiMuka.length > 0
        ? "bayar_di_muka"
        : "lunas";

  return {
    tunggakanBulan,
    bulanDiMuka,
    bulanLunasTotal,
    totalNominalTunggakan: tunggakanBulan.length * tarifPerBulan,
    status,
  };
}
