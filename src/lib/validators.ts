export interface TransaksiPayload {
  tanggal: string;
  tipe: "masuk" | "keluar";
  kategori: string;
  uraian: string;
  nominal: number;
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

  return {
    data: {
      tanggal,
      tipe,
      kategori,
      uraian,
      nominal: nominalNum,
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
