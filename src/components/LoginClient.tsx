"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, LogOut, ShieldCheck, UserCheck } from "lucide-react";
import type { SessionUser } from "@/lib/auth";

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

      // Arahkan ke /admin; server akan mengizinkan role "admin" dan memblokir role "user"
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
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const isiAkunDemo = (userDemo: string, passDemo: string) => {
    setUsername(userDemo);
    setPassword(passDemo);
    setError("");
  };

  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="max-w-md mx-auto px-4 py-12 sm:py-16 animate-fade-in">
        <div className="bg-white border border-sky-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-extrabold text-slate-900">
              Sedang Masuk Sebagai Warga
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Anda masuk sebagai <strong className="text-slate-900">{currentUser.nama}</strong>{" "}
              (<span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">role: {currentUser.role}</span>).
              Halaman dashboard admin hanya dapat diakses oleh role <strong className="text-sky-700">admin</strong>.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {loading ? "Memproses..." : "Keluar & Login sebagai Admin"}
            </button>
            <Link
              href="/kas"
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-800 font-semibold text-sm transition-colors"
            >
              Lihat Transparansi Kas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 animate-fade-in">
      <div className="bg-white border border-sky-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
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
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
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
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: admin"
              autoComplete="username"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
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
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                required
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Lock className="w-4 h-4" />
            {loading ? "Memverifikasi..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
