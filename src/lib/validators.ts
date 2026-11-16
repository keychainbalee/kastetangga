export interface TransaksiPayload {
  tanggal: string;
  tipe: "masuk" | "keluar";
  kategori: string;
  uraian: string;
  nominal: number;
  kepalaKeluargaId: number | null;
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

  return {
    data: {
      tanggal,
      tipe,
      kategori,
      uraian,
      nominal: nominalNum,
      kepalaKeluargaId,
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
}

/**
 * Memvalidasi input data kepala keluarga (nama kepala keluarga, nama rumah, dan blok).
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

  if (namaKepalaKeluarga.length < 2 || namaKepalaKeluarga.length > 100) {
    return { error: "Nama kepala keluarga harus 2-100 karakter." };
  }
  if (namaRumah.length < 1 || namaRumah.length > 60) {
    return { error: "Nama / nomor rumah harus 1-60 karakter." };
  }
  if (blok.length < 1 || blok.length > 30) {
    return { error: "Blok rumah harus 1-30 karakter." };
  }

  return {
    data: {
      namaKepalaKeluarga,
      namaRumah,
      blok,
    },
  };
}
