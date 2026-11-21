"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatBulanSingkat } from "@/lib/iuran";
import type { AdminKeluargaRow } from "./types";

export default function AdminKeluargaTab({
  keluargaList,
  blokOptions,
  busy,
  onOpenTambah,
  onOpenEdit,
  onDelete,
}: {
  keluargaList: AdminKeluargaRow[];
  blokOptions: string[];
  busy: boolean;
  onOpenTambah: () => void;
  onOpenEdit: (kk: AdminKeluargaRow) => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const [searchKk, setSearchKk] = useState("");
  const [filterBlok, setFilterBlok] = useState("semua");
  const [confirmDeleteKkId, setConfirmDeleteKkId] = useState<number | null>(null);

  const filteredKeluarga = useMemo(() => {
    const q = searchKk.trim().toLowerCase();
    return keluargaList.filter((item) => {
      if (filterBlok !== "semua" && item.blok !== filterBlok) return false;
      if (!q) return true;
      return (
        item.namaKepalaKeluarga.toLowerCase().includes(q) ||
        item.namaRumah.toLowerCase().includes(q) ||
        item.blok.toLowerCase().includes(q)
      );
    });
  }, [keluargaList, searchKk, filterBlok]);

  const handleConfirmDelete = async (id: number) => {
    await onDelete(id);
    setConfirmDeleteKkId(null);
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={searchKk}
              onChange={(e) => setSearchKk(e.target.value)}
              placeholder="Cari nama KK, rumah, atau blok..."
              className="pl-9"
            />
          </div>

          <Select
            aria-label="Filter blok rumah"
            value={filterBlok}
            onChange={(e) => setFilterBlok(e.target.value)}
            className="w-auto font-semibold text-slate-700 text-xs sm:text-sm"
          >
            <option value="semua">Semua Blok</option>
            {blokOptions.map((blok) => (
              <option key={blok} value={blok}>
                {blok}
              </option>
            ))}
          </Select>
        </div>

        <Button type="button" variant="success" onClick={onOpenTambah}>
          <Plus className="w-4 h-4" />
          Tambah Kepala Keluarga
        </Button>
      </div>

      {filteredKeluarga.length === 0 ? (
        <div className="p-10 text-center text-sm text-slate-500">
          Belum ada data kepala keluarga yang cocok dengan filter.
        </div>
      ) : (
        <>
          {/* Tampilan Mobile */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filteredKeluarga.map((kk) => (
              <div key={kk.id} className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {kk.namaKepalaKeluarga}
                    </p>
                    <span className="text-xs text-slate-600 block mt-0.5">
                      {kk.namaRumah} • Mulai:{" "}
                      {formatBulanSingkat(kk.mulaiIuranBulan)}
                    </span>
                  </div>
                  <Badge variant="sky" className="shrink-0">
                    {kk.blok}
                  </Badge>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="warning"
                    size="xs"
                    onClick={() => onOpenEdit(kk)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  {confirmDeleteKkId === kk.id ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        onClick={() => handleConfirmDelete(kk.id)}
                        disabled={busy}
                      >
                        Ya, Hapus
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setConfirmDeleteKkId(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="xs"
                      onClick={() => setConfirmDeleteKkId(kk.id)}
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
                  <th className="py-3 px-4 font-bold">Nama Kepala Keluarga</th>
                  <th className="py-3 px-4 font-bold">Nama / No. Rumah</th>
                  <th className="py-3 px-4 font-bold">Blok</th>
                  <th className="py-3 px-4 font-bold">Mulai Iuran</th>
                  <th className="py-3 px-4 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredKeluarga.map((kk) => (
                  <tr
                    key={kk.id}
                    className="hover:bg-sky-50/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {kk.namaKepalaKeluarga}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{kk.namaRumah}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="sky" className="rounded-lg">
                        {kk.blok}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium whitespace-nowrap">
                      {formatBulanSingkat(kk.mulaiIuranBulan)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="warning"
                          size="icon"
                          onClick={() => onOpenEdit(kk)}
                          title="Edit kepala keluarga"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {confirmDeleteKkId === kk.id ? (
                          <div className="inline-flex items-center gap-1">
                            <Button
                              type="button"
                              variant="destructive"
                              size="xs"
                              onClick={() => handleConfirmDelete(kk.id)}
                              disabled={busy}
                            >
                              Hapus
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={() => setConfirmDeleteKkId(null)}
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => setConfirmDeleteKkId(kk.id)}
                            title="Hapus kepala keluarga"
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
