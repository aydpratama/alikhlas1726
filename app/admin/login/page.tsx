"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { MosqueIcon } from "@/components/MosqueIcon";
import { Loader2, LogIn, ArrowLeft, User, Shield } from "lucide-react";
import Link from "next/link";
import { MemberLogin } from "@/components/MemberLogin";

export default function LoginPage() {
  const [loginType, setLoginType] = useState<"admin" | "member">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Gagal masuk. Periksa email dan kata sandi Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfdfc] flex flex-col items-center justify-center p-4">
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setLoginType("admin")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              loginType === "admin"
                ? "text-emerald-700 bg-emerald-50/50 border-b-2 border-emerald-600"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
          <button
            onClick={() => setLoginType("member")}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              loginType === "member"
                ? "text-emerald-700 bg-emerald-50/50 border-b-2 border-emerald-600"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <User className="w-4 h-4" />
            Anggota
          </button>
        </div>

        <div className="p-8 pb-4 text-center">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-emerald-600/20 rotate-3 group-hover:rotate-0 transition-transform">
            <MosqueIcon className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {loginType === "admin" ? "Admin Al-Ikhlas" : "Portal Anggota"}
          </h1>
          <p className="text-slate-500 mt-2">
            {loginType === "admin" 
              ? "Masuk untuk mengelola konten dan sistem" 
              : "Masuk untuk melihat kartu digital & iuran"}
          </p>
        </div>

        {loginType === "admin" ? (
          <form onSubmit={handleLogin} className="p-8 pt-4 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="admin@alikhlas.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Kata Sandi
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Masuk Sekarang
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-8 pt-4">
            <MemberLogin />
          </div>
        )}

        <div className="p-6 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {loginType === "admin" 
              ? "Halaman ini khusus untuk pengurus DKM Masjid Al-Ikhlas." 
              : "Gunakan data yang terdaftar pada sistem Pemulasaraan."}
            <br />
            Akses dicatat dan diaudit secara berkala.
          </p>
        </div>
      </div>
    </div>
  );
}
