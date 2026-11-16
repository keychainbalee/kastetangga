"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  ExternalLink,
  Home,
  LogOut,
  Pencil,
  Plus,
  Search,
  Shield,
  Tag,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import type { TransaksiTipe, UserRole } from "@/db/schema";
import AlertNotification, {
  type AlertActionType,
  type AlertState,
} from "@/components/AlertNotification";

export interface AdminTransaksiRow {
  id: number;
  tanggal: string;
  tipe: "masuk" | "keluar";
  kategori: string;
  uraian: string;
  nominal: number;
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

function formatRupiah(num: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

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
}: {
  currentUser: SessionUser;
  transaksiList: AdminTransaksiRow[];
  usersList: AdminUserRow[];
  kategoriList: AdminKategoriRow[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"transaksi" | "kategori" | "users">("transaksi");
  const [alertState, setAlertState] = useState<AlertState | null>(null);
  const [busy, setBusy] = useState(false);

  // Filter Transaksi
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipe, setFilterTipe] = useState<"semua" | "masuk" | "keluar">("semua");

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
  const [confirmDeleteTxId, setConfirmDeleteTxId] = useState<number | null>(null);
  const [isQuickKatOpen, setIsQuickKatOpen] = useState(false);
  const [quickKatNama, setQuickKatNama] = useState("");

  // Modal & Filter Kategori
  const [filterKatTipe, setFilterKatTipe] = useState<"semua" | "masuk" | "keluar">("semua");
  const [isKatModalOpen, setIsKatModalOpen] = useState(false);
  const [editingKat, setEditingKat] = useState<AdminKategoriRow | null>(null);
  const [katNama, setKatNama] = useState("");
  const [katTipe, setKatTipe] = useState<TransaksiTipe>("masuk");
  const [confirmDeleteKatId, setConfirmDeleteKatId] = useState<number | null>(null);

  // Modal Tambah User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userNama, setUserNama] = useState("");
  const [userUsername, setUserUsername] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<number | null>(null);

  // Ringkasan Kas
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

  const filteredTransaksi = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transaksiList.filter((item) => {
      if (filterTipe !== "semua" && item.tipe !== filterTipe) return false;
      if (!q) return true;
      return (
        item.uraian.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.tanggal.includes(q)
      );
    });
  }, [transaksiList, searchQuery, filterTipe]);

  const kategoriSesuaiTipe = useMemo(() => {
    return kategoriList.filter((k) => k.tipe === txTipe);
  }, [kategoriList, txTipe]);

  const filteredKategori = useMemo(() => {
    if (filterKatTipe === "semua") return kategoriList;
    return kategoriList.filter((k) => k.tipe === filterKatTipe);
  }, [kategoriList, filterKatTipe]);

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

  const clearAlert = useCallback(() => {
    setAlertState(null);
  }, []);

  const handleLogout = async () => {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
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
    setIsQuickKatOpen(false);
    setQuickKatNama("");
    clearAlert();
    setIsTxModalOpen(true);
  };

  const openEditTx = (tx: AdminTransaksiRow) => {
    setEditingTx(tx);
    setTxTanggal(tx.tanggal);
    setTxTipe(tx.tipe);
    setTxKategori(tx.kategori);
    setTxUraian(tx.uraian);
    setTxNominal(String(tx.nominal));
    setIsQuickKatOpen(false);
    setQuickKatNama("");
    clearAlert();
    setIsTxModalOpen(true);
  };

  const handleChangeTxTipe = (newTipe: TransaksiTipe) => {
    setTxTipe(newTipe);
    const listBaru = kategoriList.filter((k) => k.tipe === newTipe);
    const masihCocok = listBaru.some((k) => k.nama === txKategori);
    if (!masihCocok) {
      setTxKategori(listBaru[0]?.nama ?? "");
    }
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
      const method = editingKat ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: katNama,
          tipe: katTipe,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menyimpan kategori.");
        return;
      }

      const savedName = katNama.trim();
      const savedTipeLabel = katTipe === "masuk" ? "Kas Masuk" : "Kas Keluar";
      setIsKatModalOpen(false);
      if (editingKat) {
        showAlert(
          "edit",
          `Kategori "${savedName}" (${savedTipeLabel}) berhasil diperbarui.`
        );
      } else {
        showAlert(
          "add",
          `Kategori "${savedName}" (${savedTipeLabel}) berhasil ditambahkan.`
        );
      }
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
      setConfirmDeleteKatId(null);
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

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    clearAlert();

    try {
      const endpoint = editingTx
        ? `/api/admin/transaksi/${editingTx.id}`
        : "/api/admin/transaksi";
      const method = editingTx ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tanggal: txTanggal,
          tipe: txTipe,
          kategori: txKategori,
          uraian: txUraian,
          nominal: Number(txNominal),
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menyimpan transaksi.");
        return;
      }

      setIsTxModalOpen(false);
      if (editingTx) {
        showAlert(
          "edit",
          `Transaksi "${txUraian}" (${formatRupiah(Number(txNominal))}) berhasil diperbarui.`,
          { actionLabel: "Lihat Kas", actionHref: "/kas" }
        );
      } else {
        showAlert(
          "add",
          `Transaksi "${txUraian}" (${formatRupiah(Number(txNominal))}) berhasil ditambahkan.`,
          { actionLabel: "Lihat Kas", actionHref: "/kas" }
        );
      }
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
      const res = await fetch(`/api/admin/transaksi/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menghapus transaksi.");
        return;
      }
      setConfirmDeleteTxId(null);
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
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        showAlert("error", data.error || "Gagal menghapus pengguna.");
        return;
      }
      setConfirmDeleteUserId(null);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-fade-in">
      <AlertNotification alert={alertState} onClose={clearAlert} />
      {/* Header Dashboard */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <span className="text-xs text-slate-600 font-medium block">
            Masuk sebagai <strong className="text-slate-900">{currentUser.nama}</strong>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Dashboard Admin RT 05
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Kelola catatan pemasukan/pengeluaran kas warga serta hak akses role pengguna.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <Link
            href="/"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-100/70 border border-sky-200 text-sky-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            Beranda
          </Link>
          <Link
            href="/kas"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-sky-100/70 border border-sky-200 text-sky-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Lihat Kas Publik
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={busy}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-sky-500 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-sky-100">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Kas Aktif</span>
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {formatRupiah(ringkasan.saldo)}
          </p>
          <span className="text-xs text-sky-100 block">
            {ringkasan.jumlahTransaksi} transaksi tercatat
          </span>
        </div>

        <div className="bg-emerald-500 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-50">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pemasukan</span>
            <ArrowDownCircle className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {formatRupiah(ringkasan.totalMasuk)}
          </p>
          <span className="text-xs text-emerald-50 block">Akumulasi kas masuk</span>
        </div>

        <div className="bg-red-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-red-100">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pengeluaran</span>
            <ArrowUpCircle className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {formatRupiah(ringkasan.totalKeluar)}
          </p>
          <span className="text-xs text-red-100 block">Akumulasi kas keluar</span>
        </div>

        <div className="bg-amber-500 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-amber-50">
            <span className="text-xs font-bold uppercase tracking-wider">Akun Terdaftar</span>
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {usersList.length} Akun
          </p>
          <span className="text-xs text-amber-50 block">
            {usersList.filter((u) => u.role === "admin").length} admin,{" "}
            {usersList.filter((u) => u.role === "user").length} user
          </span>
        </div>
      </div>

      {/* Tab Navigasi */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("transaksi")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            activeTab === "transaksi"
              ? "bg-sky-500 text-white shadow-xs"
              : "bg-white hover:bg-sky-50 text-slate-600 border border-slate-200"
          }`}
        >
          Kelola Transaksi Kas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("kategori")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "kategori"
              ? "bg-sky-500 text-white shadow-xs"
              : "bg-white hover:bg-sky-50 text-slate-600 border border-slate-200"
          }`}
        >
          <Tag className="w-4 h-4" />
          Kategori Kas ({kategoriList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === "users"
              ? "bg-sky-500 text-white shadow-xs"
              : "bg-white hover:bg-sky-50 text-slate-600 border border-slate-200"
          }`}
        >
          <Shield className="w-4 h-4" />
          Pengguna & Role ({usersList.length})
        </button>
      </div>

      {/* TAB 1: MANAJEMEN TRANSAKSI KAS */}
      {activeTab === "transaksi" && (
        <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari uraian, kategori, atau tanggal..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                {(["semua", "masuk", "keluar"] as const).map((tipe) => (
                  <button
                    key={tipe}
                    type="button"
                    onClick={() => setFilterTipe(tipe)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      filterTipe === tipe
                        ? "bg-sky-500 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tipe}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={openTambahTx}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Transaksi
            </button>
          </div>

          {filteredTransaksi.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Belum ada transaksi kas yang cocok dengan filter.
            </div>
          ) : (
            <>
              {/* Tampilan Mobile */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredTransaksi.map((tx) => (
                  <div key={tx.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-mono text-slate-500 block">
                          {tx.tanggal}
                        </span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {tx.uraian}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                          tx.tipe === "masuk"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {tx.tipe}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 font-medium">
                        {tx.kategori}
                      </span>
                      <span
                        className={`font-bold ${
                          tx.tipe === "masuk" ? "text-emerald-700" : "text-rose-600"
                        }`}
                      >
                        {tx.tipe === "masuk" ? "+" : "-"}
                        {formatRupiah(tx.nominal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => openEditTx(tx)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {confirmDeleteTxId === tx.id ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteTx(tx.id)}
                            disabled={busy}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                          >
                            Ya, Hapus
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTxId(null)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteTxId(tx.id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tampilan Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-sky-50/70 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4 font-bold">Tanggal</th>
                      <th className="py-3 px-4 font-bold">Kategori</th>
                      <th className="py-3 px-4 font-bold">Uraian</th>
                      <th className="py-3 px-4 font-bold">Tipe</th>
                      <th className="py-3 px-4 font-bold text-right">Nominal</th>
                      <th className="py-3 px-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredTransaksi.map((tx) => (
                      <tr key={tx.id} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                          {tx.tanggal}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 text-xs font-semibold">
                            {tx.kategori}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-medium">
                          {tx.uraian}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                              tx.tipe === "masuk"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {tx.tipe}
                          </span>
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-bold whitespace-nowrap ${
                            tx.tipe === "masuk" ? "text-emerald-700" : "text-rose-600"
                          }`}
                        >
                          {tx.tipe === "masuk" ? "+" : "-"}
                          {formatRupiah(tx.nominal)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditTx(tx)}
                              className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                              title="Edit transaksi"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {confirmDeleteTxId === tx.id ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTx(tx.id)}
                                  disabled={busy}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                                >
                                  Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteTxId(null)}
                                  className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteTxId(tx.id)}
                                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                                title="Hapus transaksi"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: MANAJEMEN KATEGORI KAS */}
      {activeTab === "kategori" && (
        <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">
                Kategori Transaksi Kas
              </h2>
              <p className="text-xs text-slate-500">
                Kategori otomatis dipisahkan antara <strong>Kas Masuk</strong> dan{" "}
                <strong>Kas Keluar</strong> saat admin menginput transaksi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                {(["semua", "masuk", "keluar"] as const).map((tipe) => (
                  <button
                    key={tipe}
                    type="button"
                    onClick={() => setFilterKatTipe(tipe)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      filterKatTipe === tipe
                        ? "bg-sky-500 text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tipe}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={openTambahKat}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Kategori
              </button>
            </div>
          </div>

          {filteredKategori.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Belum ada kategori untuk filter ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-sky-50/70 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Nama Kategori</th>
                    <th className="py-3 px-4 font-bold">Tipe Arus Kas</th>
                    <th className="py-3 px-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredKategori.map((kat) => (
                    <tr key={kat.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {kat.nama}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            kat.tipe === "masuk"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {kat.tipe === "masuk" ? "Kas Masuk" : "Kas Keluar"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditKat(kat)}
                            className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                            title="Edit kategori"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {confirmDeleteKatId === kat.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteKat(kat.id)}
                                disabled={busy}
                                className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                              >
                                Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteKatId(null)}
                                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-semibold"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteKatId(kat.id)}
                              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                              title="Hapus kategori"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MANAJEMEN PENGGUNA & ROLE */}
      {activeTab === "users" && (
        <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Daftar Akun & Hak Akses Role
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Role <strong>admin</strong> dapat mengakses Dashboard Admin. Role{" "}
                <strong>user</strong> hanya untuk warga biasa (akses dashboard ditolak).
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearAlert();
                setIsUserModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Akun
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sky-50/70 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4 font-bold">Nama</th>
                  <th className="py-3 px-4 font-bold">Username</th>
                  <th className="py-3 px-4 font-bold">Role</th>
                  <th className="py-3 px-4 font-bold text-right">Ubah Role / Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {usersList.map((u) => {
                  const isSelf = u.id === currentUser.userId;
                  return (
                    <tr key={u.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {u.nama}
                        {isSelf && (
                          <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                            Akun Anda
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {u.username}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                            u.role === "admin"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <select
                            aria-label={`Ubah role untuk ${u.username}`}
                            value={u.role}
                            disabled={isSelf || busy}
                            onChange={(e) =>
                              handleChangeRole(u.id, e.target.value as UserRole)
                            }
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 disabled:opacity-50"
                          >
                            <option value="admin">admin</option>
                            <option value="user">user</option>
                          </select>

                          {!isSelf &&
                            (confirmDeleteUserId === u.id ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(u.id)}
                                  disabled={busy}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                                >
                                  Hapus
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteUserId(null)}
                                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteUserId(u.id)}
                                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                                title="Hapus akun"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT TRANSAKSI */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white border border-sky-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingTx ? "Edit Transaksi Kas" : "Tambah Transaksi Kas"}
              </h3>
              <button
                type="button"
                onClick={() => setIsTxModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    value={txTanggal}
                    onChange={(e) => setTxTanggal(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-600">
                    Tipe Arus Kas
                  </label>
                  <select
                    value={txTipe}
                    onChange={(e) =>
                      handleChangeTxTipe(e.target.value as TransaksiTipe)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:border-sky-500"
                  >
                    <option value="masuk">Kas Masuk</option>
                    <option value="keluar">Kas Keluar</option>
                  </select>
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
                <select
                  value={txKategori}
                  onChange={(e) => setTxKategori(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:border-sky-500"
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
                </select>

                {isQuickKatOpen && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
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
                      className="flex-1 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/40 text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleQuickCreateKat}
                      disabled={busy}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-xs font-semibold transition-colors"
                    >
                      Simpan
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Uraian / Keterangan
                </label>
                <input
                  type="text"
                  value={txUraian}
                  onChange={(e) => setTxUraian(e.target.value)}
                  placeholder="Contoh: Iuran Warga Blok A (15 KK)"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={txNominal}
                  onChange={(e) => setTxNominal(e.target.value)}
                  placeholder="Contoh: 500000"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className={`px-4 py-2 rounded-xl disabled:opacity-60 text-white text-sm font-semibold transition-colors ${
                    editingTx
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {busy ? "Menyimpan..." : editingTx ? "Simpan Perubahan" : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH / EDIT KATEGORI */}
      {isKatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white border border-sky-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                {editingKat ? "Edit Kategori Kas" : "Tambah Kategori Kas"}
              </h3>
              <button
                type="button"
                onClick={() => setIsKatModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveKat} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  value={katNama}
                  onChange={(e) => setKatNama(e.target.value)}
                  placeholder="Contoh: Iuran Sampah / Perbaikan Jalan"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Untuk Tipe Arus Kas
                </label>
                <select
                  value={katTipe}
                  onChange={(e) => setKatTipe(e.target.value as TransaksiTipe)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:border-sky-500"
                >
                  <option value="masuk">Kas Masuk</option>
                  <option value="keluar">Kas Keluar</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className={`px-4 py-2 rounded-xl disabled:opacity-60 text-white text-sm font-semibold transition-colors ${
                    editingKat
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {busy
                    ? "Menyimpan..."
                    : editingKat
                      ? "Simpan Perubahan"
                      : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH USER */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white border border-sky-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900">
                Tambah Akun Pengguna
              </h3>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={userNama}
                  onChange={(e) => setUserNama(e.target.value)}
                  placeholder="Contoh: Ibu Siti (Bendahara)"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Username
                </label>
                <input
                  type="text"
                  value={userUsername}
                  onChange={(e) => setUserUsername(e.target.value)}
                  placeholder="Huruf kecil, tanpa spasi"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Kata Sandi (min. 6 karakter)
                </label>
                <input
                  type="password"
                  minLength={6}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600">
                  Role Akses
                </label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:border-sky-500"
                >
                  <option value="user">user (Warga Biasa - Tidak Bisa Masuk Admin)</option>
                  <option value="admin">admin (Pengurus - Akses Penuh Dashboard)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
                >
                  {busy ? "Menyimpan..." : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
