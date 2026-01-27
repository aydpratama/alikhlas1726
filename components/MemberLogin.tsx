"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, User, Users, Lock, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toTitleCase } from "@/lib/utils";
import { hashPassword, comparePassword, isHashed } from "@/lib/crypto";

export function MemberLogin() {
  const [step, setStep] = useState<"search" | "validation" | "password" | "success">("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [familyCount, setFamilyCount] = useState("");
  const [actualFamilyCount, setActualFamilyCount] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Live search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 3 && step === "search") {
        performSearch();
      } else if (searchTerm.length === 0) {
        setSearchResults([]);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, step]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("anggota_pemulasaraan")
        .select("*")
        .ilike("nama_lengkap", `%${searchTerm}%`)
        .limit(8);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMember = async (member: any) => {
    setSelectedMember(member);
    setLoading(true);
    setError(null);

    try {
      // 1. Check if member has an account
      const { data: account, error: accountError } = await supabase
        .from("member_accounts")
        .select("*")
        .eq("id_anggota", member.id)
        .single();

      if (accountError && accountError.code !== "PGRST116") throw accountError;
      
      setIsFirstTime(!account);

      // 2. Calculate actual family count
      const familyPrefix = member.no_anggota.split(".")[0];
      const { data: familyMembers, error: countError } = await supabase
        .from("anggota_pemulasaraan")
        .select("no_anggota")
        .or(`no_anggota.eq.${familyPrefix},no_anggota.like.${familyPrefix}.%`);

      if (countError) throw countError;
      setActualFamilyCount(familyMembers?.length || 0);
      
      setStep("validation");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateFamilyCount = () => {
    if (parseInt(familyCount) === actualFamilyCount) {
      setStep("password");
      setError(null);
    } else {
      setError("Jumlah anggota tidak sesuai. Silakan periksa kembali.");
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isFirstTime) {
        if (password !== confirmPassword) {
          setError("Password tidak cocok.");
          setLoading(false);
          return;
        }

        const hashedPassword = await hashPassword(password);

        const { error: insertError } = await supabase
          .from("member_accounts")
          .insert({
            id_anggota: selectedMember.id,
            password: hashedPassword,
          });

        if (insertError) throw insertError;
        
        setStep("success");
      } else {
        const { data: account, error: loginError } = await supabase
          .from("member_accounts")
          .select("*")
          .eq("id_anggota", selectedMember.id)
          .single();

        if (loginError || !account) {
          setError("Data akun tidak ditemukan.");
          setLoading(false);
          return;
        }

        let isMatch = false;
        const storedPassword = account.password;

        if (isHashed(storedPassword)) {
          isMatch = await comparePassword(password, storedPassword);
        } else {
          // Plain text check (for legacy passwords)
          isMatch = password === storedPassword;
          
          // If match, auto-upgrade to hashed password
          if (isMatch) {
            const newHashedPassword = await hashPassword(password);
            await supabase
              .from("member_accounts")
              .update({ password: newHashedPassword })
              .eq("id_anggota", selectedMember.id);
          }
        }

        if (!isMatch) {
          setError("Password salah.");
          setLoading(false);
          return;
        }

        // Success Login
        const loginData = {
          id: selectedMember.id,
          nama: selectedMember.nama_lengkap,
          no_anggota: selectedMember.no_anggota,
          familyNo: selectedMember.no_anggota.split(".")[0]
        };
        
        localStorage.setItem("member_session", JSON.stringify(loginData));
        setStep("success");
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "/pemulasaraan";
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {step === "search" && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Cari Nama Anggota</h2>
              <p className="text-sm text-slate-500">Masukkan nama lengkap sesuai pendaftaran</p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ketik nama anda (min. 3 huruf)..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            </div>

            {loading && (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {searchResults.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => handleSelectMember(member)}
                    className="w-full p-4 flex items-center justify-between bg-white border border-slate-100 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                        <User className="w-5 h-5 text-slate-500 group-hover:text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{member.nama_lengkap}</p>
                        <p className="text-xs text-slate-500">{member.no_anggota}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
                  </button>
                ))}
              </div>
            )}

            {searchTerm.length >= 3 && searchResults.length === 0 && !loading && (
              <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 italic">Nama tidak ditemukan. Pastikan ejaan benar.</p>
              </div>
            )}
          </motion.div>
        )}

        {step === "validation" && (
          <motion.div
            key="validation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2 bg-emerald-600 p-6 rounded-2xl -mx-2 mb-6 shadow-lg shadow-emerald-600/10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Verifikasi Keamanan</h2>
              <p className="text-sm text-emerald-50">Halo, <span className="font-bold text-white">{toTitleCase(selectedMember?.nama_lengkap)}</span></p>
            </div>

            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
              <label className="block text-sm font-medium text-emerald-900 text-center">
                Berapa jumlah anggota anda yang didaftarkan?
              </label>
              <input
                type="number"
                value={familyCount}
                onChange={(e) => setFamilyCount(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-center text-2xl font-bold"
                placeholder="0"
              />
              {error && (
                <p className="text-xs text-red-600 flex items-center gap-1 justify-center">
                  <AlertCircle className="w-3 h-3" /> {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("search")}
                className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-all"
              >
                Kembali
              </button>
              <button
                onClick={validateFamilyCount}
                className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
              >
                Lanjut
              </button>
            </div>
          </motion.div>
        )}

        {step === "password" && (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {isFirstTime ? "Buat Password Baru" : "Masukkan Password"}
              </h2>
              <p className="text-sm text-slate-500">
                {isFirstTime 
                  ? "Ini adalah login pertama anda. Silakan buat password." 
                  : "Silakan masukkan password akun anda."}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              {isFirstTime && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Konfirmasi Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {error}
                </p>
              )}
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isFirstTime ? "Buat Akun & Login" : "Masuk"}
            </button>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {isFirstTime ? "Password Berhasil Dibuat!" : "Berhasil Masuk!"}
              </h2>
              <p className="text-slate-500">
                {isFirstTime 
                  ? "Silakan login kembali dengan password yang baru dibuat." 
                  : `Selamat datang kembali, ${toTitleCase(selectedMember?.nama_lengkap)}`}
              </p>
            </div>
            
            {isFirstTime ? (
              <button
                onClick={() => {
                  setStep("search");
                  setPassword("");
                  setConfirmPassword("");
                  setIsFirstTime(false);
                }}
                className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all"
              >
                Kembali ke Login
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mengalihkan ke halaman...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
