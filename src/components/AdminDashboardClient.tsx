"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarClock,
  ExternalLink,
  Home,
  LogOut,
  Shield,
  Tag,
  Users,
  Wallet,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { SessionUser } from "@/lib/auth";
import type { TransaksiTipe, UserRole } from "@/db/schema";
import AlertNotification, {
  type AlertActionType,
  type AlertState,
} from "@/components/AlertNotification";
import SystemDateTimeBadge from "@/components/SystemDateTimeBadge";
import type { PembayaranIuranItem } from "@/components/AdminIuranTab";
import {
  formatBulanSingkat,
  getCurrentYearMonth,
  hitungStatusIuranKeluarga,
} from "@/lib/iuran";
import {
  formatRupiah,
  type AdminKategoriRow,
  type AdminKeluargaRow,
  type AdminTransaksiRow,
  type AdminUserRow,
} from "@/components/admin/types";

const TabSkeleton = () => (
  <div className="bg-white border border-sky-100 rounded-2xl p-5 space-y-3 animate-pulse">
    <div className="h-9 w-full bg-slate-100 rounded-xl" />
    <div className="h-14 w-full bg-slate-50 rounded-xl" />
    <div className="h-14 w-full bg-slate-50 rounded-xl" />
  </div>
);

const AdminTransaksiTab = dynamic(
  () => import("@/components/admin/AdminTransaksiTab"),
  { loading: TabSkeleton }
);
const AdminIuranTab = dynamic(() => import("@/components/AdminIuranTab"), {
  loading: TabSkeleton,
});
const AdminKeluargaTab = dynamic(
  () => import("@/components/admin/AdminKeluargaTab"),
  { loading: TabSkeleton }
);
const AdminKategoriTab = dynamic(
  () => import("@/components/admin/AdminKategoriTab"),
  { loading: TabSkeleton }
);
const AdminUsersTab = dynamic(
  () => import("@/components/admin/AdminUsersTab"),
  { loading: TabSkeleton }
);
const IuranBulanPicker = dynamic(
  () => import("@/components/IuranBulanPicker"),
  {
    loading: () => (
      <div className="h-44 rounded-xl bg-sky-50 border border-sky-100 animate-pulse" />
    ),
  }
);

function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AdminDashboardClient({
  currentUser,
  transaksiList,
  usersList,
  kategoriList,
  keluargaList,
  pembayaranIuranList,
  pengaturanIuran,
}: {
  currentUser: SessionUser;
  transaksiList: AdminTransaksiRow[];
  usersList: AdminUserRow[];
  kategoriList: AdminKategoriRow[];
  keluargaList: AdminKeluargaRow[];
  pembayaranIuranList: PembayaranIuranItem[];
  pengaturanIuran: { nominalPerBulan: number; mulaiPeriodeBulan: string };
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "transaksi" | "iuran" | "keluarga" | "kategori" | "users"
  >("transaksi");
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const [busy, setBusy] = useState(false);

  // Modal Transaksi (Tambah / Edit)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<AdminTransaksiRow | null>(null);
  const [txTanggal, setTxTanggal] = useState(getTodayDateString());
  const [txTipe, setTxTipe] = useState<TransaksiTipe>("masuk");
  const [txKategori, setTxKategori] = useState(
    () => kategoriList.find((k) => k.tipe === "masuk")?.nama ?? ""
  );
  const [txUraian, setTxUraian] = useState("");
  const [txNominal, setTxNominal] = useState("");
  const [txKepalaKeluargaId, setTxKepalaKeluargaId] = useState("");
  const [txCatatBulanIuran, setTxCatatBulanIuran] = useState(false);
  const [txBulanIuran, setTxBulanIuran] = useState<string[]>([]);
  const [isQuickKatOpen, setIsQuickKatOpen] = useState(false);
  const [quickKatNama, setQuickKatNama] = useState("");

  // Modal Kepala Keluarga
  const [isKkModalOpen, setIsKkModalOpen] = useState(false);
  const [editingKk, setEditingKk] = useState<AdminKeluargaRow | null>(null);
  const [kkNama, setKkNama] = useState("");
  const [kkRumah, setKkRumah] = useState("");
  const [kkBlok, setKkBlok] = useState("Blok A");
  const [kkMulaiBulan, setKkMulaiBulan] = useState(
    pengaturanIuran.mulaiPeriodeBulan
  );

  // Modal Kategori
  const [isKatModalOpen, setIsKatModalOpen] = useState(false);
  const [editingKat, setEditingKat] = useState<AdminKategoriRow | null>(null);
  const [katNama, setKatNama] = useState("");
  const [katTipe, setKatTipe] = useState<TransaksiTipe>("masuk");

  // Modal Tambah User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userNama, setUserNama] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("user");

  const ringkasan = useMemo(() => {
    let totalMasuk = 0;
    let totalKeluar = 0;
    for (const item of transaksiList) {
      if (item.tipe === "masuk") totalMasuk += item.nominal;
      else totalKeluar += item.nominal;
    }
    return {
      totalMasuk,
      totalKeluar,
      saldo: totalMasuk - totalKeluar,
      jumlahTransaksi: transaksiList.length,
    };
  }, [transaksiList]);

  const keluargaById = useMemo(
    () => new Map(keluargaList.map((k) => [k.id, k])),
    [keluargaList]
  );

  const kategoriSesuaiTipe = useMemo(
    () => kategoriList.filter((k) => k.tipe === txTipe),
    [kategoriList, txTipe]
  );

  const blokOptions = useMemo(() => {
    return Array.from(new Set(keluargaList.map((k) => k.blok))).sort((a, b) =>
      a.localeCompare(b, "id")
    );
  }, [keluargaList]);

  const currentYm = useMemo(() => getCurrentYearMonth(), []);

  const paidMonthsByTx = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const item of pembayaranIuranList) {
      const list = map.get(item.transaksiId);
      if (list) list.push(item.bulan);
      else map.set(item.transaksiId, [item.bulan]);
    }
    for (const list of map.values()) list.sort();
    return map;
  }, [pembayaranIuranList]);

  const tunggakanCount = useMemo(() => {
    const paidByKk = new Map<number, Set<string>>();
    for (const item of pembayaranIuranList) {
      let set = paidByKk.get(item.kepalaKeluargaId);
      if (!set) {
        set = new Set<string>();
        paidByKk.set(item.kepalaKeluargaId, set);
      }
      set.add(item.bulan);
    }
    let count = 0;
    for (const kk of keluargaList) {
      const info = hitungStatusIuranKeluarga(
        kk.mulaiIuranBulan || pengaturanIuran.mulaiPeriodeBulan,
        paidByKk.get(kk.id) ?? [],
        currentYm,
        pengaturanIuran.nominalPerBulan
      );
      if (info.status === "menunggak") count += 1;
    }
    return count;
  }, [keluargaList, pembayaranIuranList, pengaturanIuran, currentYm]);

  const alreadyPaidInOtherTx = useMemo(() => {
    const set = new Set<string>();
    const selectedKkId = Number(txKepalaKeluargaId);
    if (!Number.isInteger(selectedKkId) || selectedKkId <= 0) return set;

    for (const item of pembayaranIuranList) {
      if (
        item.kepalaKeluargaId === selectedKkId &&
        item.transaksiId !== editingTx?.id
      ) {
        set.add(item.bulan);
      }
    }
    return set;
  }, [pembayaranIuranList, txKepalaKeluargaId, editingTx]);

  const showAlert = useCallback(
    (
      type: AlertActionType,
      message: string,
      options?: { actionLabel?: string; actionHref?: string }
    ) => {
      setAlertState({
        id: Date.now(),
        type,
        message,
        actionLabel: options?.actionLabel,
        actionHref: options?.actionHref,
      });
    },
    []
  );

  const clearAlert = useCallback(() => setAlertState(null), []);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.dispatchEvent(new Event("wargakas-auth-changed"));
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const syncNominalAndUraianForMonths = (months: string[], kkIdStr: string) => {
    if (months.length > 0) {
      setTxNominal(String(months.length * pengaturanIuran.nominalPerBulan));
      const kk = kkIdStr ? keluargaById.get(Number(kkIdStr)) : undefined;
      if (kk && (!txUraian.trim() || txUraian.startsWith("Iuran Kas "))) {
        const daftarBulan = months.map(formatBulanSingkat).join(", ");
        setTxUraian(
          `Iuran Kas ${kk.namaKepalaKeluarga} (${months.length} Bulan: ${daftarBulan})`
        );
      }
    }
  };

  const openTambahTx = () => {
    const defaultTipe: TransaksiTipe = "masuk";
    const defaultKategori =
      kategoriList.find((k) => k.tipe === defaultTipe)?.nama ?? "";
    setEditingTx(null);
    setTxTanggal(getTodayDateString());
    setTxTipe(defaultTipe);
    setTxKategori(defaultKategori);
    setTxUraian("");
    setTxNominal("");
    setTxKepalaKeluargaId("");
    setTxCatatBulanIuran(false);
    setTxBulanIuran([]);
    setIsQuickKatOpen(false);
    setQuickKatNama("");
    clearAlert();
    setIsTxModalOpen(true);
  };

  const openEditTx = (tx: AdminTransaksiRow) => {
    const existingMonths = paidMonthsByTx.get(tx.id) ?? [];
    setEditingTx(tx);
    setTxTanggal(tx.tanggal);
    setTxTipe(tx.tipe);
    setTxKategori(tx.kategori);
    setTxUraian(tx.uraian);
    setTxNominal(String(tx.nominal));
    setTxKepalaKeluargaId(
      tx.tipe === "masuk" && tx.kepalaKeluargaId
        ? String(tx.kepalaKeluargaId)
        : ""
    );
    setTxCatatBulanIuran(existingMonths.length > 0);
    setTxBulanIuran(existingMonths);
    setIsQuickKatOpen(false);
    setQuickKatNama("");
    clearAlert();
    setIsTxModalOpen(true);
  };

  const handleChangeTxTipe = (newTipe: TransaksiTipe) => {
    setTxTipe(newTipe);
    if (newTipe === "keluar") {
      setTxKepalaKeluargaId("");
      setTxCatatBulanIuran(false);
      setTxBulanIuran([]);
    }
    const listBaru = kategoriList.filter((k) => k.tipe === newTipe);
    if (!listBaru.some((k) => k.nama === txKategori)) {
      setTxKategori(listBaru[0]?.nama ?? "");
    }
  };

  const handleChangeTxKategori = (kat: string) => {
    setTxKategori(kat);
    if (
      txTipe === "masuk" &&
      txKepalaKeluargaId !== "" &&
      kat.toLowerCase().includes("iuran")
    ) {
      setTxCatatBulanIuran(true);
    }
  };

  const handleChangeTxKepalaKeluarga = (kkIdStr: string) => {
    setTxKepalaKeluargaId(kkIdStr);
    setTxBulanIuran([]);
    if (kkIdStr !== "" && txKategori.toLowerCase().includes("iuran")) {
      setTxCatatBulanIuran(true);
    } else if (kkIdStr === "") {
      setTxCatatBulanIuran(false);
    }
  };

  const handleChangeBulanIuran = (months: string[]) => {
    setTxBulanIuran(months);
    syncNominalAndUraianForMonths(months, txKepalaKeluargaId);
  };

  const handleBayarCepat = (kk: AdminKeluargaRow, defaultMonths: string[]) => {
    const masukCats = kategoriList.filter((k) => k.tipe === "masuk");
    const katIuran =
      masukCats.find((k) => k.nama.toLowerCase().includes("iuran"))?.nama ??
      masukCats[0]?.nama ??
      "Iuran Bulanan";
    const daftarBulan = defaultMonths.map(formatBulanSingkat).join(", ");

    setEditingTx(null);
    setTxTanggal(getTodayDateString());
    setTxTipe("masuk");
    setTxKategori(katIuran);
    setTxKepalaKeluargaId(String(kk.id));
    setTxCatatBulanIuran(true);
    setTxBulanIuran(defaultMonths);
    setTxNominal(String(defaultMonths.length * pengaturanIuran.nominalPerBulan));
    setTxUraian(
      `Iuran Kas ${kk.namaKepalaKeluarga} (${defaultMonths.length} Bulan: ${daftarBulan})`
    );
    setIsQuickKatOpen(false);
    setQuickKatNama("");
    clearAlert();
    setIsTxModalOpen(true);
  };

  const handleQuickCreateKat = async () => {
    const trimmed = quickKatNama.trim();
    if (!trimmed) {
      showAlert("error", "Nama kategori baru wajib diisi.");
      return;
    }

    setBusy(true);
    clearAlert();
    try {
      const res = await fetch("/api/admin/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: trimmed, tipe: txTipe }),
      });
      const data = (await res.json()) as {
        error?: string;
        data?: AdminKategoriRow;
      };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menambahkan kategori.");
        return;
      }

      const namaBaru = data.data?.nama ?? trimmed;
      setTxKategori(namaBaru);
      setQuickKatNama("");
      setIsQuickKatOpen(false);
      showAlert(
        "add",
        `Kategori "${namaBaru}" (${txTipe === "masuk" ? "Kas Masuk" : "Kas Keluar"}) berhasil ditambahkan.`
      );
      router.refresh();
    } catch {
      showAlert("error", "Terjadi kesalahan jaringan saat menambah kategori.");
    } finally {
      setBusy(false);
    }
  };

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const bulanToSubmit =
      txTipe === "masuk" && txKepalaKeluargaId && txCatatBulanIuran
        ? txBulanIuran
        : [];

    if (
      txTipe === "masuk" &&
      txKepalaKeluargaId &&
      txCatatBulanIuran &&
      bulanToSubmit.length === 0
    ) {
      showAlert(
        "error",
        "Pilih minimal 1 bulan iuran atau matikan centang rincian bulan iuran."
      );
      return;
    }

    setBusy(true);
    clearAlert();
    try {
      const endpoint = editingTx
        ? `/api/admin/transaksi/${editingTx.id}`
        : "/api/admin/transaksi";
      const res = await fetch(endpoint, {
        method: editingTx ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: txTanggal,
          tipe: txTipe,
          kategori: txKategori,
          uraian: txUraian,
          nominal: Number(txNominal),
          kepalaKeluargaId:
            txTipe === "masuk" && txKepalaKeluargaId
              ? Number(txKepalaKeluargaId)
              : null,
          bulanIuran: bulanToSubmit,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menyimpan transaksi.");
        return;
      }

      setIsTxModalOpen(false);
      showAlert(
        editingTx ? "edit" : "add",
        editingTx
          ? `Transaksi "${txUraian}" (${formatRupiah(Number(txNominal))}) berhasil diperbarui.`
          : `Transaksi "${txUraian}" (${formatRupiah(Number(txNominal))}) berhasil ditambahkan.`,
        { actionLabel: "Lihat Kas", actionHref: "/kas" }
      );
      router.refresh();
    } catch {
      showAlert("error", "Terjadi kesalahan jaringan saat menyimpan transaksi.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteTx = async (id: number) => {
    const targetTx = transaksiList.find((item) => item.id === id);
    setBusy(true);
    clearAlert();
    try {
      const res = await fetch(`/api/admin/transaksi/${id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menghapus transaksi.");
        return;
      }
      showAlert(
        "delete",
        targetTx
          ? `Transaksi "${targetTx.uraian}" (${formatRupiah(targetTx.nominal)}) telah dihapus.`
          : "Transaksi kas berhasil dihapus.",
        { actionLabel: "Lihat Kas", actionHref: "/kas" }
      );
      router.refresh();
    } catch {
      showAlert("error", "Terjadi kesalahan jaringan saat menghapus transaksi.");
    } finally {
      setBusy(false);
    }
  };

  const handleSavePengaturan = async (
    nominalPerBulan: number,
    mulaiPeriodeBulan: string
  ) => {
    setBusy(true);
    clearAlert();
    try {
      const res = await fetch("/api/admin/pengaturan-iuran", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nominalPerBulan, mulaiPeriodeBulan }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menyimpan pengaturan iuran.");
        return;
      }
      showAlert(
        "edit",
        `Pengaturan iuran diperbarui: ${formatRupiah(nominalPerBulan)}/bulan mulai ${formatBulanSingkat(mulaiPeriodeBulan)}.`
      );
      router.refresh();
    } catch {
      showAlert(
        "error",
        "Terjadi kesalahan jaringan saat menyimpan pengaturan iuran."
      );
    } finally {
      setBusy(false);
    }
  };

  const openTambahKk = () => {
    setEditingKk(null);
    setKkNama("");
    setKkRumah("");
    setKkBlok("Blok A");
    setKkMulaiBulan(pengaturanIuran.mulaiPeriodeBulan);
    clearAlert();
    setIsKkModalOpen(true);
  };

  const openEditKk = (kk: AdminKeluargaRow) => {
    setEditingKk(kk);
    setKkNama(kk.namaKepalaKeluarga);
    setKkRumah(kk.namaRumah);
    setKkBlok(kk.blok);
    setKkMulaiBulan(kk.mulaiIuranBulan || pengaturanIuran.mulaiPeriodeBulan);
    clearAlert();
    setIsKkModalOpen(true);
  };

  const handleSaveKk = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    clearAlert();
    try {
      const endpoint = editingKk
        ? `/api/admin/keluarga/${editingKk.id}`
        : "/api/admin/keluarga";
      const res = await fetch(endpoint, {
        method: editingKk ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namaKepalaKeluarga: kkNama,
          namaRumah: kkRumah,
          blok: kkBlok,
          mulaiIuranBulan: kkMulaiBulan,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menyimpan data kepala keluarga.");
        return;
      }

      const savedNama = kkNama.trim();
      const savedRumah = kkRumah.trim();
      const savedBlok = kkBlok.trim();
      setIsKkModalOpen(false);
      showAlert(
        editingKk ? "edit" : "add",
        editingKk
          ? `Data kepala keluarga "${savedNama}" (${savedRumah}, ${savedBlok}) berhasil diperbarui.`
          : `Kepala keluarga "${savedNama}" (${savedRumah}, ${savedBlok}) berhasil ditambahkan.`
      );
      router.refresh();
    } catch {
      showAlert(
        "error",
        "Terjadi kesalahan jaringan saat menyimpan data kepala keluarga."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteKk = async (id: number) => {
    const targetKk = keluargaList.find((k) => k.id === id);
    setBusy(true);
    clearAlert();
    try {
      const res = await fetch(`/api/admin/keluarga/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menghapus data kepala keluarga.");
        return;
      }
      showAlert(
        "delete",
        targetKk
          ? `Data "${targetKk.namaKepalaKeluarga}" (${targetKk.namaRumah}, ${targetKk.blok}) telah dihapus.`
          : "Data kepala keluarga berhasil dihapus."
      );
      router.refresh();
    } catch {
      showAlert(
        "error",
        "Terjadi kesalahan jaringan saat menghapus data kepala keluarga."
      );
    } finally {
      setBusy(false);
    }
  };

  const openTambahKat = () => {
    setEditingKat(null);
    setKatNama("");
    setKatTipe("masuk");
    clearAlert();
    setIsKatModalOpen(true);
  };

  const openEditKat = (kat: AdminKategoriRow) => {
    setEditingKat(kat);
    setKatNama(kat.nama);
    setKatTipe(kat.tipe);
    clearAlert();
    setIsKatModalOpen(true);
  };

  const handleSaveKat = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    clearAlert();
    try {
      const endpoint = editingKat
        ? `/api/admin/kategori/${editingKat.id}`
        : "/api/admin/kategori";
      const res = await fetch(endpoint, {
        method: editingKat ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: katNama, tipe: katTipe }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menyimpan kategori.");
        return;
      }
      const savedName = katNama.trim();
      const savedTipeLabel = katTipe === "masuk" ? "Kas Masuk" : "Kas Keluar";
      setIsKatModalOpen(false);
      showAlert(
        editingKat ? "edit" : "add",
        editingKat
          ? `Kategori "${savedName}" (${savedTipeLabel}) berhasil diperbarui.`
          : `Kategori "${savedName}" (${savedTipeLabel}) berhasil ditambahkan.`
      );
      router.refresh();
    } catch {
      showAlert("error", "Terjadi kesalahan jaringan saat menyimpan kategori.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteKat = async (id: number) => {
    const targetKat = kategoriList.find((k) => k.id === id);
    setBusy(true);
    clearAlert();
    try {
      const res = await fetch(`/api/admin/kategori/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menghapus kategori.");
        return;
      }
      showAlert(
        "delete",
        targetKat
          ? `Kategori "${targetKat.nama}" (${targetKat.tipe}) telah dihapus.`
          : "Kategori berhasil dihapus."
      );
      router.refresh();
    } catch {
      showAlert("error", "Terjadi kesalahan jaringan saat menghapus kategori.");
    } finally {
      setBusy(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    clearAlert();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: userNama,
          username: userUsername,
          password: userPassword,
          role: userRole,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menambahkan pengguna.");
        return;
      }
      const createdName = userNama;
      const createdUsername = userUsername.trim().toLowerCase();
      const createdRole = userRole;
      setIsUserModalOpen(false);
      setUserNama("");
      setUserUsername("");
      setUserPassword("");
      setUserRole("user");
      showAlert(
        "add",
        `Akun "${createdName}" (@${createdUsername}) dengan role ${createdRole} berhasil ditambahkan.`
      );
      router.refresh();
    } catch {
      showAlert("error", "Terjadi kesalahan jaringan saat membuat akun.");
    } finally {
      setBusy(false);
    }
  };

  const handleChangeRole = async (userId: number, newRole: UserRole) => {
    const targetUser = usersList.find((u) => u.id === userId);
    setBusy(true);
    clearAlert();
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal mengubah role pengguna.");
        return;
      }
      showAlert(
        "edit",
        targetUser
          ? `Role akun "${targetUser.nama}" (@${targetUser.username}) diubah menjadi ${newRole}.`
          : `Role pengguna berhasil diubah menjadi ${newRole}.`
      );
      router.refresh();
    } catch {
      showAlert("error", "Terjadi kesalahan jaringan saat mengubah role.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const targetUser = usersList.find((u) => u.id === userId);
    setBusy(true);
    clearAlert();
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menghapus pengguna.");
        return;
      }
      showAlert(
        "delete",
        targetUser
          ? `Akun "${targetUser.nama}" (@${targetUser.username}) telah dihapus.`
          : "Akun pengguna berhasil dihapus."
      );
      router.refresh();
    } catch {
      showAlert("error", "Terjadi kesalahan jaringan saat menghapus akun.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 animate-fade-in">
        <AlertNotification alert={alertState} onClose={clearAlert} />

        {/* Header Dashboard Minimalis */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">
                Masuk sebagai{" "}
                <strong className="text-slate-900">{currentUser.nama}</strong>
              </span>
              <SystemDateTimeBadge />
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900">
              Dashboard Admin RT 05
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Kelola kas masuk/keluar, iuran warga, kepala keluarga, dan akses pengguna.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Link
              href="/"
              className={buttonVariants({
                variant: "outlineSky",
                size: "sm",
                className: "flex-1 sm:flex-initial",
              })}
            >
              <Home className="w-4 h-4" />
              Beranda
            </Link>
            <Link
              href="/kas"
              className={buttonVariants({
                variant: "outlineSky",
                size: "sm",
                className: "flex-1 sm:flex-initial",
              })}
            >
              <ExternalLink className="w-4 h-4" />
              Kas Publik
            </Link>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              disabled={busy}
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>

        {/* Ringkasan Statistik (2x2 Ringkas di HP/Tablet, 4 Kolom di Laptop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-sky-500 text-white rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-sky-100 gap-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
                Saldo Kas Aktif
              </span>
              <Wallet className="w-4 h-4 shrink-0" />
            </div>
            <p className="text-base sm:text-xl lg:text-2xl font-black text-white truncate">
              {formatRupiah(ringkasan.saldo)}
            </p>
            <span className="text-[11px] sm:text-xs text-sky-100 block truncate">
              {ringkasan.jumlahTransaksi} transaksi
            </span>
          </div>

          <div className="bg-emerald-500 text-white rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-50 gap-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
                Total Pemasukan
              </span>
              <ArrowDownCircle className="w-4 h-4 shrink-0" />
            </div>
            <p className="text-base sm:text-xl lg:text-2xl font-black text-white truncate">
              {formatRupiah(ringkasan.totalMasuk)}
            </p>
            <span className="text-[11px] sm:text-xs text-emerald-50 block truncate">
              Akumulasi masuk
            </span>
          </div>

          <div className="bg-red-600 text-white rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-red-100 gap-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
                Total Pengeluaran
              </span>
              <ArrowUpCircle className="w-4 h-4 shrink-0" />
            </div>
            <p className="text-base sm:text-xl lg:text-2xl font-black text-white truncate">
              {formatRupiah(ringkasan.totalKeluar)}
            </p>
            <span className="text-[11px] sm:text-xs text-red-100 block truncate">
              Akumulasi keluar
            </span>
          </div>

          <div className="bg-amber-500 text-white rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-amber-50 gap-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">
                Akun Terdaftar
              </span>
              <Users className="w-4 h-4 shrink-0" />
            </div>
            <p className="text-base sm:text-xl lg:text-2xl font-black text-white truncate">
              {usersList.length} Akun
            </p>
            <span className="text-[11px] sm:text-xs text-amber-50 block truncate">
              {usersList.filter((u) => u.role === "admin").length} admin,{" "}
              {usersList.filter((u) => u.role === "user").length} user
            </span>
          </div>
        </div>

        {/* Tab Navigasi 1 Baris Horizontal Scroll di HP/Tablet */}
        <div
          role="tablist"
          aria-label="Menu pengelolaan admin"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 pb-2.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "transaksi"}
            onClick={() => setActiveTab("transaksi")}
            className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === "transaksi"
                ? "bg-sky-500 text-white shadow-xs"
                : "bg-white hover:bg-sky-50 text-slate-600 border border-slate-200"
            }`}
          >
            Transaksi Kas
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "iuran"}
            onClick={() => setActiveTab("iuran")}
            className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "iuran"
                ? "bg-sky-500 text-white shadow-xs"
                : "bg-white hover:bg-sky-50 text-slate-600 border border-slate-200"
            }`}
          >
            <CalendarClock className="w-4 h-4 shrink-0" />
            <span>Status & Tunggakan</span>
            {tunggakanCount > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  activeTab === "iuran"
                    ? "bg-white text-red-600"
                    : "bg-red-600 text-white"
                }`}
              >
                {tunggakanCount}
              </span>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "keluarga"}
            onClick={() => setActiveTab("keluarga")}
            className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "keluarga"
                ? "bg-sky-500 text-white shadow-xs"
                : "bg-white hover:bg-sky-50 text-slate-600 border border-slate-200"
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            Kepala Keluarga ({keluargaList.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "kategori"}
            onClick={() => setActiveTab("kategori")}
            className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "kategori"
                ? "bg-sky-500 text-white shadow-xs"
                : "bg-white hover:bg-sky-50 text-slate-600 border border-slate-200"
            }`}
          >
            <Tag className="w-4 h-4 shrink-0" />
            Kategori ({kategoriList.length})
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            className={`shrink-0 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "users"
                ? "bg-sky-500 text-white shadow-xs"
                : "bg-white hover:bg-sky-50 text-slate-600 border border-slate-200"
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            Pengguna ({usersList.length})
          </button>
        </div>

        {/* Konten Tab Aktif (Lazy-loaded per Tab) */}
        {activeTab === "transaksi" && (
          <AdminTransaksiTab
            transaksiList={transaksiList}
            keluargaById={keluargaById}
            paidMonthsByTx={paidMonthsByTx}
            busy={busy}
            onOpenTambah={openTambahTx}
            onOpenEdit={openEditTx}
            onDelete={handleDeleteTx}
          />
        )}

        {activeTab === "iuran" && (
          <AdminIuranTab
            keluargaList={keluargaList}
            pembayaranIuranList={pembayaranIuranList}
            pengaturanIuran={pengaturanIuran}
            currentYm={currentYm}
            busy={busy}
            onSavePengaturan={handleSavePengaturan}
            onBayarCepat={handleBayarCepat}
          />
        )}

        {activeTab === "keluarga" && (
          <AdminKeluargaTab
            keluargaList={keluargaList}
            blokOptions={blokOptions}
            busy={busy}
            onOpenTambah={openTambahKk}
            onOpenEdit={openEditKk}
            onDelete={handleDeleteKk}
          />
        )}

        {activeTab === "kategori" && (
          <AdminKategoriTab
            kategoriList={kategoriList}
            busy={busy}
            onOpenTambah={openTambahKat}
            onOpenEdit={openEditKat}
            onDelete={handleDeleteKat}
          />
        )}

        {activeTab === "users" && (
          <AdminUsersTab
            usersList={usersList}
            currentUserId={currentUser.userId}
            busy={busy}
            onOpenTambah={() => {
              clearAlert();
              setIsUserModalOpen(true);
            }}
            onChangeRole={handleChangeRole}
            onDelete={handleDeleteUser}
          />
        )}

        {/* MODAL TAMBAH / EDIT TRANSAKSI */}
        <Dialog open={isTxModalOpen} onOpenChange={setIsTxModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader
              title={editingTx ? "Edit Transaksi Kas" : "Tambah Transaksi Kas"}
            />

            <form onSubmit={handleSaveTx} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">
                    Tanggal
                  </label>
                  <Input
                    type="date"
                    value={txTanggal}
                    onChange={(e) => setTxTanggal(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">
                    Tipe Arus Kas
                  </label>
                  <Select
                    value={txTipe}
                    onChange={(e) =>
                      handleChangeTxTipe(e.target.value as TransaksiTipe)
                    }
                  >
                    <option value="masuk">Kas Masuk</option>
                    <option value="keluar">Kas Keluar</option>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-600">
                    Kategori ({txTipe === "masuk" ? "Kas Masuk" : "Kas Keluar"})
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickKatOpen((prev) => !prev)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    {isQuickKatOpen ? "Tutup" : "+ Kategori Baru"}
                  </button>
                </div>
                <Select
                  value={txKategori}
                  onChange={(e) => handleChangeTxKategori(e.target.value)}
                  required
                >
                  {kategoriSesuaiTipe.length === 0 && !txKategori && (
                    <option value="">Belum ada kategori {txTipe}</option>
                  )}
                  {kategoriSesuaiTipe.map((kat) => (
                    <option key={kat.id} value={kat.nama}>
                      {kat.nama}
                    </option>
                  ))}
                  {txKategori &&
                    !kategoriSesuaiTipe.some((k) => k.nama === txKategori) && (
                      <option value={txKategori}>{txKategori}</option>
                    )}
                </Select>

                {isQuickKatOpen && (
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      type="text"
                      value={quickKatNama}
                      onChange={(e) => setQuickKatNama(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handleQuickCreateKat();
                        }
                      }}
                      placeholder={`Nama kategori ${txTipe === "masuk" ? "masuk" : "keluar"} baru`}
                      className="flex-1 h-8 border-emerald-200 bg-emerald-50/40 text-xs focus:border-emerald-500"
                    />
                    <Button
                      type="button"
                      variant="success"
                      size="xs"
                      onClick={handleQuickCreateKat}
                      disabled={busy}
                    >
                      Simpan
                    </Button>
                  </div>
                )}
              </div>

              {txTipe === "masuk" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-600">
                      Dari Kepala Keluarga (Opsional)
                    </label>
                    <Select
                      value={txKepalaKeluargaId}
                      onChange={(e) =>
                        handleChangeTxKepalaKeluarga(e.target.value)
                      }
                    >
                      <option value="">
                        — Umum / Bukan per Kepala Keluarga —
                      </option>
                      {keluargaList.map((kk) => (
                        <option key={kk.id} value={String(kk.id)}>
                          {kk.namaKepalaKeluarga} — {kk.blok} ({kk.namaRumah})
                        </option>
                      ))}
                    </Select>
                    {keluargaList.length === 0 && (
                      <span className="text-[11px] text-amber-700 block">
                        Belum ada data kepala keluarga. Tambahkan di tab Kepala Keluarga.
                      </span>
                    )}
                  </div>

                  {txKepalaKeluargaId !== "" && (
                    <div className="space-y-2.5">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={txCatatBulanIuran}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setTxCatatBulanIuran(checked);
                            if (!checked) setTxBulanIuran([]);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          Catat Rincian Bulan Iuran (bisa bayar lebih dari 1 bulan)
                        </span>
                      </label>

                      {txCatatBulanIuran && (
                        <IuranBulanPicker
                          mulaiIuranBulan={
                            keluargaById.get(Number(txKepalaKeluargaId))
                              ?.mulaiIuranBulan ??
                            pengaturanIuran.mulaiPeriodeBulan
                          }
                          selectedMonths={txBulanIuran}
                          alreadyPaidInOtherTx={alreadyPaidInOtherTx}
                          tarifPerBulan={pengaturanIuran.nominalPerBulan}
                          currentYm={currentYm}
                          onChangeMonths={handleChangeBulanIuran}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Uraian / Keterangan
                </label>
                <Input
                  type="text"
                  value={txUraian}
                  onChange={(e) => setTxUraian(e.target.value)}
                  placeholder="Contoh: Iuran Warga Blok A (15 KK)"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Nominal (Rp)
                </label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={txNominal}
                  onChange={(e) => setTxNominal(e.target.value)}
                  placeholder="Contoh: 500000"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTxModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant={editingTx ? "warning" : "success"}
                  disabled={busy}
                >
                  {busy
                    ? "Menyimpan..."
                    : editingTx
                      ? "Simpan Perubahan"
                      : "Simpan Transaksi"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL TAMBAH / EDIT KATEGORI */}
        <Dialog open={isKatModalOpen} onOpenChange={setIsKatModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader
              title={editingKat ? "Edit Kategori Kas" : "Tambah Kategori Kas"}
            />

            <form onSubmit={handleSaveKat} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Nama Kategori
                </label>
                <Input
                  type="text"
                  value={katNama}
                  onChange={(e) => setKatNama(e.target.value)}
                  placeholder="Contoh: Iuran Sampah / Perbaikan Jalan"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Untuk Tipe Arus Kas
                </label>
                <Select
                  value={katTipe}
                  onChange={(e) => setKatTipe(e.target.value as TransaksiTipe)}
                >
                  <option value="masuk">Kas Masuk</option>
                  <option value="keluar">Kas Keluar</option>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsKatModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant={editingKat ? "warning" : "success"}
                  disabled={busy}
                >
                  {busy
                    ? "Menyimpan..."
                    : editingKat
                      ? "Simpan Perubahan"
                      : "Simpan Kategori"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL TAMBAH / EDIT KEPALA KELUARGA */}
        <Dialog open={isKkModalOpen} onOpenChange={setIsKkModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader
              title={
                editingKk ? "Edit Data Kepala Keluarga" : "Tambah Kepala Keluarga"
              }
            />

            <form onSubmit={handleSaveKk} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Nama Kepala Keluarga
                </label>
                <Input
                  type="text"
                  value={kkNama}
                  onChange={(e) => setKkNama(e.target.value)}
                  placeholder="Contoh: Bpk. Budi Santoso"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Nama / Nomor Rumah
                </label>
                <Input
                  type="text"
                  value={kkRumah}
                  onChange={(e) => setKkRumah(e.target.value)}
                  placeholder="Contoh: Rumah No. 01 / Griya Melati 1"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Blok Rumah
                </label>
                <Input
                  type="text"
                  list="daftar-blok-rumah"
                  value={kkBlok}
                  onChange={(e) => setKkBlok(e.target.value)}
                  placeholder="Contoh: Blok A"
                  required
                />
                <datalist id="daftar-blok-rumah">
                  {Array.from(
                    new Set([
                      "Blok A",
                      "Blok B",
                      "Blok C",
                      "Blok D",
                      "Blok E",
                      "Blok F",
                      ...blokOptions,
                    ])
                  ).map((blok) => (
                    <option key={blok} value={blok} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Mulai Wajib Iuran (Bulan/Tahun)
                </label>
                <Input
                  type="month"
                  value={kkMulaiBulan}
                  onChange={(e) => setKkMulaiBulan(e.target.value)}
                  required
                />
                <span className="text-[11px] text-slate-500 block">
                  Bulan sebelum tanggal ini tidak dihitung sebagai tunggakan.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsKkModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant={editingKk ? "warning" : "success"}
                  disabled={busy}
                >
                  {busy
                    ? "Menyimpan..."
                    : editingKk
                      ? "Simpan Perubahan"
                      : "Simpan Data KK"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL TAMBAH USER */}
        <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader title="Tambah Akun Pengguna" />

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  value={userNama}
                  onChange={(e) => setUserNama(e.target.value)}
                  placeholder="Contoh: Ibu Siti (Bendahara)"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Username
                </label>
                <Input
                  type="text"
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  placeholder="Huruf kecil, tanpa spasi"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Kata Sandi (min. 6 karakter)
                </label>
                <Input
                  type="password"
                  minLength={6}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Role Akses
                </label>
                <Select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                >
                  <option value="user">
                    user (Warga Biasa - Tidak Bisa Masuk Admin)
                  </option>
                  <option value="admin">
                    admin (Pengurus - Akses Penuh Dashboard)
                  </option>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUserModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="success" disabled={busy}>
                  {busy ? "Menyimpan..." : "Buat Akun"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
