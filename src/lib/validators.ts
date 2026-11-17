import { isValidBulan } from "./iuran";

export interface TransaksiPayload {
  tanggal: string;
  tipe: "masuk" | "keluar";
  kategori: string;
  uraian: string;
  nominal: number;
  kepalaKeluargaId: number | null;
  bulanIuran: string[];
}

/**
 * Memvalidasi dan menormalkan payload transaksi kas dari body JSON.
 */
export function validateTransaksiInput(body: Record<string, unknown>): {
  data?: TransaksiPayload;
  error?: string;
} {
  const tanggal = typeof body.tanggal === "string" ? body.tanggal.trim() : "";
  const tipe = body.tipe;
  const kategori = typeof body.kategori === "string" ? body.kategori.trim() : "";
  const uraian = typeof body.uraian === "string" ? body.uraian.trim() : "";
  const nominalNum = Number(body.nominal);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
    return { error: "Format tanggal tidak valid (gunakan YYYY-MM-DD)." };
  }
  if (tipe !== "masuk" && tipe !== "keluar") {
    return { error: "Tipe transaksi harus 'masuk' atau 'keluar'." };
  }
  if (!kategori) {
    return { error: "Kategori transaksi wajib diisi." };
  }
  if (!uraian) {
    return { error: "Uraian transaksi wajib diisi." };
  }
  if (!Number.isInteger(nominalNum) || nominalNum <= 0) {
    return { error: "Nominal harus berupa angka bulat positif." };
  }

  let kepalaKeluargaId: number | null = null;
  if (
    tipe === "masuk" &&
    body.kepalaKeluargaId !== null &&
    body.kepalaKeluargaId !== undefined &&
    body.kepalaKeluargaId !== ""
  ) {
    const parsedKkId = Number(body.kepalaKeluargaId);
    if (!Number.isInteger(parsedKkId) || parsedKkId <= 0) {
      return { error: "Pilihan kepala keluarga tidak valid." };
    }
    kepalaKeluargaId = parsedKkId;
  }

  let bulanIuran: string[] = [];
  if (Array.isArray(body.bulanIuran) && body.bulanIuran.length > 0) {
    if (tipe !== "masuk" || kepalaKeluargaId === null) {
      return {
        error:
          "Pilih tipe Kas Masuk dan Kepala Keluarga untuk mencatat bulan iuran.",
      };
    }

    const validMonths = new Set<string>();
    for (const item of body.bulanIuran) {
      if (typeof item !== "string" || !isValidBulan(item.trim())) {
        return { error: "Format bulan iuran tidak valid (gunakan YYYY-MM)." };
      }
      validMonths.add(item.trim());
    }
    bulanIuran = Array.from(validMonths).sort();
  }

  return {
    data: {
      tanggal,
      tipe,
      kategori,
      uraian,
      nominal: nominalNum,
      kepalaKeluargaId,
      bulanIuran,
    },
  };
}

export interface KategoriPayload {
  nama: string;
  tipe: "masuk" | "keluar";
}

/**
 * Memvalidasi input kategori kas (nama & tipe arus kas).
 */
export function validateKategoriInput(body: Record<string, unknown>): {
  data?: KategoriPayload;
  error?: string;
} {
  const nama = typeof body.nama === "string" ? body.nama.trim() : "";
  const tipe = body.tipe;

  if (!nama || nama.length < 2 || nama.length > 50) {
    return { error: "Nama kategori harus 2-50 karakter." };
  }
  if (tipe !== "masuk" && tipe !== "keluar") {
    return { error: "Tipe kategori harus 'masuk' atau 'keluar'." };
  }

  return {
    data: {
      nama,
      tipe,
    },
  };
}

export interface KepalaKeluargaPayload {
  namaKepalaKeluarga: string;
  namaRumah: string;
  blok: string;
  mulaiIuranBulan?: string;
}

/**
 * Memvalidasi input data kepala keluarga (nama kepala keluarga, nama rumah, blok, dan bulan mulai iuran).
 */
export function validateKepalaKeluargaInput(body: Record<string, unknown>): {
  data?: KepalaKeluargaPayload;
  error?: string;
} {
  const namaKepalaKeluarga =
    typeof body.namaKepalaKeluarga === "string"
      ? body.namaKepalaKeluarga.trim()
      : "";
  const namaRumah =
    typeof body.namaRumah === "string" ? body.namaRumah.trim() : "";
  const blok = typeof body.blok === "string" ? body.blok.trim() : "";
  const rawMulai =
    typeof body.mulaiIuranBulan === "string"
      ? body.mulaiIuranBulan.trim()
      : "";

  if (namaKepalaKeluarga.length < 2 || namaKepalaKeluarga.length > 100) {
    return { error: "Nama kepala keluarga harus 2-100 karakter." };
  }
  if (namaRumah.length < 1 || namaRumah.length > 60) {
    return { error: "Nama / nomor rumah harus 1-60 karakter." };
  }
  if (blok.length < 1 || blok.length > 30) {
    return { error: "Blok rumah harus 1-30 karakter." };
  }
  if (rawMulai && !isValidBulan(rawMulai)) {
    return { error: "Format bulan mulai iuran tidak valid (gunakan YYYY-MM)." };
  }

  return {
    data: {
      namaKepalaKeluarga,
      namaRumah,
      blok,
      ...(rawMulai ? { mulaiIuranBulan: rawMulai } : {}),
    },
  };
}

export interface PengaturanIuranPayload {
  nominalPerBulan: number;
  mulaiPeriodeBulan: string;
}

/**
 * Memvalidasi input pengaturan tarif dan periode mulai iuran kas RT.
 */
export function validatePengaturanIuranInput(body: Record<string, unknown>): {
  data?: PengaturanIuranPayload;
  error?: string;
} {
  const nominalPerBulan = Number(body.nominalPerBulan);
  const mulaiPeriodeBulan =
    typeof body.mulaiPeriodeBulan === "string"
      ? body.mulaiPeriodeBulan.trim()
      : "";

  if (!Number.isInteger(nominalPerBulan) || nominalPerBulan <= 0) {
    return { error: "Nominal iuran per bulan harus angka bulat positif." };
  }
  if (!isValidBulan(mulaiPeriodeBulan)) {
    return { error: "Format bulan mulai periode tidak valid (gunakan YYYY-MM)." };
  }

  return {
    data: {
      nominalPerBulan,
      mulaiPeriodeBulan,
    },
  };
}
