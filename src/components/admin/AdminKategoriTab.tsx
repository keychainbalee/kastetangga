"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AdminKategoriRow } from "./types";

export default function AdminKategoriTab({
  kategoriList,
  busy,
  onOpenTambah,
  onOpenEdit,
  onDelete,
}: {
  kategoriList: AdminKategoriRow[];
  busy: boolean;
  onOpenTambah: () => void;
  onOpenEdit: (kat: AdminKategoriRow) => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const [filterKatTipe, setFilterKatTipe] = useState<"semua" | "masuk" | "keluar">("semua");
  const [confirmDeleteKatId, setConfirmDeleteKatId] = useState<number | null>(null);

  const filteredKategori = useMemo(() => {
    if (filterKatTipe === "semua") return kategoriList;
    return kategoriList.filter((k) => k.tipe === filterKatTipe);
  }, [kategoriList, filterKatTipe]);

  const handleConfirmDelete = async (id: number) => {
    await onDelete(id);
    setConfirmDeleteKatId(null);
  };

  return (
    <Card className="overflow-hidden">
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
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-0.5">
            {(["semua", "masuk", "keluar"] as const).map((tipe) => (
              <Button
                key={tipe}
                type="button"
                size="xs"
                variant={filterKatTipe === tipe ? "default" : "ghost"}
                onClick={() => setFilterKatTipe(tipe)}
                className="capitalize rounded-lg"
              >
                {tipe}
              </Button>
            ))}
          </div>

          <Button type="button" variant="success" onClick={onOpenTambah}>
            <Plus className="w-4 h-4" />
            Tambah Kategori
          </Button>
        </div>
      </div>

      {filteredKategori.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          Belum ada kategori untuk filter ini.
        </div>
      ) : (
        <>
          {/* Tampilan Mobile */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filteredKategori.map((kat) => (
              <div key={kat.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{kat.nama}</p>
                  <Badge
                    variant={kat.tipe === "masuk" ? "success" : "destructive"}
                    className="uppercase"
                  >
                    {kat.tipe === "masuk" ? "Kas Masuk" : "Kas Keluar"}
                  </Badge>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="warning"
                    size="xs"
                    onClick={() => onOpenEdit(kat)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  {confirmDeleteKatId === kat.id ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        onClick={() => handleConfirmDelete(kat.id)}
                        disabled={busy}
                      >
                        Ya, Hapus
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setConfirmDeleteKatId(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="xs"
                      onClick={() => setConfirmDeleteKatId(kat.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tampilan Tablet & Laptop */}
          <div className="hidden md:block overflow-x-auto">
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
                  <tr
                    key={kat.id}
                    className="hover:bg-sky-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {kat.nama}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={kat.tipe === "masuk" ? "success" : "destructive"}
                        className="uppercase"
                      >
                        {kat.tipe === "masuk" ? "Kas Masuk" : "Kas Keluar"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="warning"
                          size="icon"
                          onClick={() => onOpenEdit(kat)}
                          title="Edit kategori"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {confirmDeleteKatId === kat.id ? (
                          <div className="inline-flex items-center gap-1">
                            <Button
                              type="button"
                              variant="destructive"
                              size="xs"
                              onClick={() => handleConfirmDelete(kat.id)}
                              disabled={busy}
                            >
                              Hapus
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={() => setConfirmDeleteKatId(null)}
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => setConfirmDeleteKatId(kat.id)}
                            title="Hapus kategori"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
    </Card>
  );
}
