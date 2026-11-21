"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, ShieldAlert } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminAccessDenied({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.dispatchEvent(new Event("wargakas-auth-changed"));
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-14 sm:py-20 animate-fade-in">
      <Card className="border-red-200 p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <Badge variant="destructive" className="uppercase tracking-wider">
            Akses Ditolak (403)
          </Badge>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Khusus Pengguna Role Admin
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Akun <strong className="text-slate-900">{user.nama}</strong> ({user.username}) memiliki role{" "}
            <Badge variant="secondary" className="font-mono">
              {user.role}
            </Badge>
            . Halaman Dashboard Admin hanya dapat diakses oleh pengguna dengan role{" "}
            <strong className="text-sky-700">admin</strong>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <Link
            href="/"
            className={buttonVariants({
              variant: "outlineSky",
              className: "flex-1 py-2.5",
            })}
          >
            <ArrowLeft className="w-4 h-4" />
            Ke Beranda
          </Link>
          <Button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 py-2.5"
          >
            <LogOut className="w-4 h-4" />
            {loading ? "Keluar..." : "Ganti Akun Admin"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
