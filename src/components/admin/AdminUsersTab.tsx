"use client";

import { useState } from "react";
import { Trash2, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import type { UserRole } from "@/db/schema";
import type { AdminUserRow } from "./types";

export default function AdminUsersTab({
  usersList,
  currentUserId,
  busy,
  onOpenTambah,
  onChangeRole,
  onDelete,
}: {
  usersList: AdminUserRow[];
  currentUserId: number;
  busy: boolean;
  onOpenTambah: () => void;
  onChangeRole: (userId: number, newRole: UserRole) => Promise<void>;
  onDelete: (userId: number) => Promise<void>;
}) {
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<number | null>(null);

  const handleConfirmDelete = async (id: number) => {
    await onDelete(id);
    setConfirmDeleteUserId(null);
  };

  return (
    <Card className="overflow-hidden">
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
        <Button
          type="button"
          variant="success"
          onClick={onOpenTambah}
          className="w-full sm:w-auto"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Akun
        </Button>
      </div>

      {/* Tampilan Mobile */}
      <div className="divide-y divide-slate-100 md:hidden">
        {usersList.map((u) => {
          const isSelf = u.id === currentUserId;
          return (
            <div key={u.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {u.nama}
                    {isSelf && (
                      <Badge variant="sky" className="ml-2 text-[10px]">
                        Akun Anda
                      </Badge>
                    )}
                  </p>
                  <span className="text-xs font-mono text-slate-500 block mt-0.5">
                    @{u.username}
                  </span>
                </div>
                <Badge
                  variant={u.role === "admin" ? "sky" : "secondary"}
                  className="uppercase"
                >
                  {u.role}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Select
                  aria-label={`Ubah role untuk ${u.username}`}
                  value={u.role}
                  disabled={isSelf || busy}
                  onChange={(e) =>
                    onChangeRole(u.id, e.target.value as UserRole)
                  }
                  className="w-auto h-8 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <option value="admin">admin</option>
                  <option value="user">user</option>
                </Select>

                {!isSelf &&
                  (confirmDeleteUserId === u.id ? (
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        onClick={() => handleConfirmDelete(u.id)}
                        disabled={busy}
                      >
                        Ya, Hapus
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setConfirmDeleteUserId(null)}
                      >
                        Batal
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="xs"
                      onClick={() => setConfirmDeleteUserId(u.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </Button>
                  ))}
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
              <th className="py-3 px-4 font-bold">Nama</th>
              <th className="py-3 px-4 font-bold">Username</th>
              <th className="py-3 px-4 font-bold">Role</th>
              <th className="py-3 px-4 font-bold text-right">Ubah Role / Hapus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {usersList.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {u.nama}
                    {isSelf && (
                      <Badge variant="sky" className="ml-2">
                        Akun Anda
                      </Badge>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                    {u.username}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={u.role === "admin" ? "sky" : "secondary"}
                      className="uppercase"
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <Select
                        aria-label={`Ubah role untuk ${u.username}`}
                        value={u.role}
                        disabled={isSelf || busy}
                        onChange={(e) =>
                          onChangeRole(u.id, e.target.value as UserRole)
                        }
                        className="w-auto h-8 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700"
                      >
                        <option value="admin">admin</option>
                        <option value="user">user</option>
                      </Select>

                      {!isSelf &&
                        (confirmDeleteUserId === u.id ? (
                          <div className="inline-flex items-center gap-1">
                            <Button
                              type="button"
                              variant="destructive"
                              size="xs"
                              onClick={() => handleConfirmDelete(u.id)}
                              disabled={busy}
                            >
                              Hapus
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              onClick={() => setConfirmDeleteUserId(null)}
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => setConfirmDeleteUserId(u.id)}
                            title="Hapus akun"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
