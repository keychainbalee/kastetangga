"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, LogOut, ShieldCheck, UserCheck } from "lucide-react";
import type { SessionUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginClient({
  currentUser,
}: {
  currentUser: SessionUser | null;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = (await res.json()) as {
        error?: string;
        user?: { role: "admin" | "user" };
      };

      if (!res.ok) {
        setError(data.error || "Gagal masuk. Periksa kembali akun Anda.");
        setLoading(false);
        return;
      }

      window.dispatchEvent(new Event("wargakas-auth-changed"));
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Gagal menghubungi server. Coba beberapa saat lagi.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.dispatchEvent(new Event("wargakas-auth-changed"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-16 animate-fade-in">
        <Card className="border-sky-200 p-6 sm:p-8 shadow-sm space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-slate-900">
              Sedang Masuk Sebagai Warga
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Anda masuk sebagai{" "}
              <strong className="text-slate-900">{currentUser.nama}</strong>{" "}
              <Badge variant="secondary" className="font-mono">
                role: {currentUser.role}
              </Badge>
              . Halaman dashboard admin hanya dapat diakses oleh role{" "}
              <strong className="text-sky-700">admin</strong>.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="w-full py-2.5"
            >
              <LogOut className="w-4 h-4" />
              {loading ? "Memproses..." : "Keluar & Login sebagai Admin"}
            </Button>
            <Link
              href="/kas"
              className={buttonVariants({
                variant: "outlineSky",
                className: "w-full py-2.5",
              })}
            >
              Lihat Transparansi Kas
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 animate-fade-in">
      <Card className="border-sky-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Login Admin RT 05
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Masuk untuk mengelola data transaksi kas dan akun pengguna. Hanya role{" "}
            <strong className="text-sky-700">admin</strong> yang dapat membuka dashboard.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: admin"
              autoComplete="username"
              required
              className="py-2.5"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                required
                className="pr-10 py-2.5"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-2.5">
            <Lock className="w-4 h-4" />
            {loading ? "Memverifikasi..." : "Masuk"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
