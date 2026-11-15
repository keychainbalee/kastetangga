"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, ShieldAlert } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

export default function AdminAccessDenied({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-14 sm:py-20 animate-fade-in">
      <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider">
            Akses Ditolak (403)
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Khusus Pengguna Role Admin
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Akun <strong className="text-slate-900">{user.nama}</strong> ({user.username}) memiliki role{" "}
            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-800">
              {user.role}
            </span>
            . Halaman Dashboard Admin hanya dapat diakses oleh pengguna dengan role{" "}
            <strong className="text-sky-700">admin</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            href="/"
            className="flex-1 py-2.5 px-4 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ke Beranda
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {loading ? "Keluar..." : "Ganti Akun Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}
