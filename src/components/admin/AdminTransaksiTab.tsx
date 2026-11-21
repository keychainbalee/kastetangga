"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatBulanSingkat } from "@/lib/iuran";
import {
  formatRupiah,
  type AdminKeluargaRow,
  type AdminTransaksiRow,
} from "./types";

export default function AdminTransaksiTab({
  transaksiList,
  keluargaById,
  paidMonthsByTx,
  busy,
  onOpenTambah,
  onOpenEdit,
  onDelete,
}: {
  transaksiList: AdminTransaksiRow[];
  keluargaById: Map<number, AdminKeluargaRow>;
  paidMonthsByTx: Map<number, string[]>;
  busy: boolean;
  onOpenTambah: () => void;
  onOpenEdit: (tx: AdminTransaksiRow) => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTipe, setFilterTipe] = useState<"semua" | "masuk" | "keluar">("semua");
  const [confirmDeleteTxId, setConfirmDeleteTxId] = useState<number | null>(null);

  const filteredTransaksi = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transaksiList.filter((item) => {
      if (filterTipe !== "semua" && item.tipe !== filterTipe) return false;
      if (!q) return true;
      const kk =
        item.kepalaKeluargaId !== null
          ? keluargaById.get(item.kepalaKeluargaId)
          : undefined;
      return (
        item.uraian.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.tanggal.includes(q) ||
        Boolean(kk?.namaKepalaKeluarga.toLowerCase().includes(q)) ||
        Boolean(kk?.namaRumah.toLowerCase().includes(q)) ||
        Boolean(kk?.blok.toLowerCase().includes(q))
      );
    });
  }, [transaksiList, searchQuery, filterTipe, keluargaById]);

  const handleConfirmDelete = async (id: number) => {
    await onDelete(id);
    setConfirmDeleteTxId(null);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari uraian, kategori, KK, atau tanggal..."
              className="pl-9"
            />
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 self-start sm:self-auto gap-0.5">
            {(["semua", "masuk", "keluar"] as const).map((tipe) => (
              <Button
                key={tipe}
                type="button"
                size="xs"
                variant={filterTipe === tipe ? "default" : "ghost"}
                onClick={() => setFilterTipe(tipe)}
                className="capitalize rounded-lg"
              >
                {tipe}
              </Button>
            ))}
          </div>
        </div>

        <Button type="button" variant="success" onClick={onOpenTambah}>
          <Plus className="w-4 h-4" />
          Tambah Transaksi
        </Button>
      </div>

      {filteredTransaksi.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          Belum ada transaksi kas yang cocok dengan filter.
        </div>
      ) : (
        <>
          {/* Tampilan Mobile */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filteredTransaksi.map((tx) => {
              const kk =
                tx.tipe === "masuk" && tx.kepalaKeluargaId !== null
                  ? keluargaById.get(tx.kepalaKeluargaId)
                  : undefined;
              const paidMonths = paidMonthsByTx.get(tx.id) ?? [];
              return (
                <div key={tx.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-xs font-mono text-slate-500 block">
                        {tx.tanggal}
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5 break-words">
                        {tx.uraian}
                      </p>
                      {kk && (
                        <span className="text-xs font-medium text-sky-700 block mt-0.5">
                          Dari: {kk.namaKepalaKeluarga} ({kk.blok} • {kk.namaRumah})
                        </span>
                      )}
                      {paidMonths.length > 0 && (
                        <span className="text-[11px] font-semibold text-emerald-700 block mt-0.5">
                          Iuran ({paidMonths.length} bln):{" "}
                          {paidMonths.map(formatBulanSingkat).join(", ")}
                        </span>
                      )}
                    </div>
                    <Badge
                      variant={tx.tipe === "masuk" ? "success" : "destructive"}
                      className="uppercase shrink-0"
                    >
                      {tx.tipe}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="sky" className="rounded-md font-medium">
                      {tx.kategori}
                    </Badge>
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
                    <Button
                      type="button"
                      variant="warning"
                      size="xs"
                      onClick={() => onOpenEdit(tx)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Button>
                    {confirmDeleteTxId === tx.id ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="destructive"
                          size="xs"
                          onClick={() => handleConfirmDelete(tx.id)}
                          disabled={busy}
                        >
                          Ya, Hapus
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setConfirmDeleteTxId(null)}
                        >
                          Batal
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        onClick={() => setConfirmDeleteTxId(tx.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tampilan Tablet & Laptop */}
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
                {filteredTransaksi.map((tx) => {
                  const kk =
                    tx.tipe === "masuk" && tx.kepalaKeluargaId !== null
                      ? keluargaById.get(tx.kepalaKeluargaId)
                      : undefined;
                  const paidMonths = paidMonthsByTx.get(tx.id) ?? [];
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-sky-50/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {tx.tanggal}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant="sky" className="rounded-lg">
                          {tx.kategori}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        <span>{tx.uraian}</span>
                        {kk && (
                          <span className="block text-xs font-medium text-sky-700 mt-0.5">
                            Dari: {kk.namaKepalaKeluarga} ({kk.blok} • {kk.namaRumah})
                          </span>
                        )}
                        {paidMonths.length > 0 && (
                          <span className="block text-[11px] font-semibold text-emerald-700 mt-0.5">
                            Iuran ({paidMonths.length} bln):{" "}
                            {paidMonths.map(formatBulanSingkat).join(", ")}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={tx.tipe === "masuk" ? "success" : "destructive"}
                          className="uppercase"
                        >
                          {tx.tipe}
                        </Badge>
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
                          <Button
                            type="button"
                            variant="warning"
                            size="icon"
                            onClick={() => onOpenEdit(tx)}
                            title="Edit transaksi"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {confirmDeleteTxId === tx.id ? (
                            <div className="inline-flex items-center gap-1">
                              <Button
                                type="button"
                                variant="destructive"
                                size="xs"
                                onClick={() => handleConfirmDelete(tx.id)}
                                disabled={busy}
                              >
                                Hapus
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => setConfirmDeleteTxId(null)}
                              >
                                Batal
                              </Button>
                            </div>
                          ) : (
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => setConfirmDeleteTxId(tx.id)}
                              title="Hapus transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
