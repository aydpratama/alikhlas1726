"use client";

import { useState, useEffect } from "react";
import { RegistrationApproval } from "@/components/RegistrationApproval";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";
import {
  Search,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toTitleCase, getRelationRank } from "@/lib/utils";

interface OthersViewProps {
  isAdmin: boolean;
  isSuperAdmin?: boolean;
  profile?: any;
  onDataChange: () => void;
}

export function OthersView({
  isAdmin,
  isSuperAdmin,
  profile,
  onDataChange,
}: OthersViewProps) {
  const [activeTab, setActiveTab] = useState<"cuti" | "pendaftaran" | "password">(
    profile?.peran === "imam" || profile?.peran === "marbot" ? "cuti" : "pendaftaran"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const isImamOrMarbot = profile?.peran === "imam" || profile?.peran === "marbot";

  // Search members who have accounts
  useEffect(() => {
    if (activeTab !== "password") return;

    const fetchMembers = async () => {
      setLoading(true);

      try {
        // 1. Dapatkan semua akun yang ada di member_accounts dengan relasi ke anggota_pemulasaraan
        const { data: accounts, error: accountError } = await supabase
          .from("member_accounts")
          .select(`
            id_anggota,
            anggota_pemulasaraan (
              id,
              no_anggota,
              nama_lengkap,
              rt,
              rw,
              hubungan_keluarga
            )
          `);

        if (accountError) throw accountError;

        if (!accounts || accounts.length === 0) {
          setMembers([]);
          setLoading(false);
          return;
        }

        // Transform data agar mudah dibaca di UI
        let allAccounts = accounts.map((a: any) => ({
          account_id_anggota: a.id_anggota,
          id: a.anggota_pemulasaraan.id,
          no_anggota: a.anggota_pemulasaraan.no_anggota,
          nama_lengkap: a.anggota_pemulasaraan.nama_lengkap,
          rt: a.anggota_pemulasaraan.rt,
          rw: a.anggota_pemulasaraan.rw,
          hubungan: a.anggota_pemulasaraan.hubungan_keluarga
        }));

        // Sort strategy:
        // 1. Urutkan berdasarkan No. Keluarga (bagian depan no_anggota)
        // 2. Jika sama, urutkan berdasarkan Hubungan Keluarga (KK > Istri > Anak)
        allAccounts.sort((a, b) => {
          const numA = parseInt(a.no_anggota.split('/')[0]) || 0;
          const numB = parseInt(b.no_anggota.split('/')[0]) || 0;

          if (numA !== numB) return numA - numB;
          return getRelationRank(a.hubungan) - getRelationRank(b.hubungan);
        });

        if (searchTerm) {
          setMembers(allAccounts.filter(m =>
            m.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.no_anggota.includes(searchTerm)
          ));
        } else {
          setMembers(allAccounts);
        }
      } catch (err) {
        console.error("Error fetching accounts for reset:", err);
        toast.error("Gagal memuat data akun");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchMembers, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, activeTab]);

  const handleResetPassword = async (m: any) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin me-reset password untuk ${toTitleCase(m.nama_lengkap)} (${m.hubungan})? Login ini akan dihapus secara permanen.`,
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("member_accounts")
        .delete()
        .eq("id_anggota", m.account_id_anggota);

      if (error) throw error;

      toast.success(`Password ${m.nama_lengkap} berhasil di-reset`);
      setMembers((prev) => prev.filter((item) => item.account_id_anggota !== m.account_id_anggota));
    } catch (err) {
      console.error("Error during reset:", err);
      toast.error("Gagal melakukan reset password");
    }
  };

  // If not admin/imam/marbot, don't show anything
  if (!isAdmin && !isImamOrMarbot) return null;

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-fit overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("cuti")}
          className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === "cuti"
            ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
            : "text-gray-500 hover:bg-gray-50"
            }`}
        >
          <Calendar className="w-4 h-4" />
          Tab Cuti
        </button>

        {/* Only Super Admin can see Pendaftaran & Password Reset */}
        {isSuperAdmin && (
          <>
            <button
              onClick={() => setActiveTab("pendaftaran")}
              className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === "pendaftaran"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              Persetujuan Pendaftaran
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === "password"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              Reset Password Member
            </button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "cuti" && (
          <motion.div
            key="cuti"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center"
          >
            <Calendar className="w-12 h-12 mx-auto mb-4 text-emerald-200" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {isImamOrMarbot ? "Pengajuan Cuti" : "Persetujuan Cuti"}
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              {isImamOrMarbot
                ? "Halaman pengajuan cuti sedang dalam pengembangan."
                : "Halaman persetujuan cuti sedang dalam pengembangan."}
            </p>
          </motion.div>
        )}

        {activeTab === "pendaftaran" && isSuperAdmin && (
          <motion.div
            key="pendaftaran"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
          >
            <RegistrationApproval
              isAdminProp={isAdmin}
              isAdminLoadingProp={false}
              onDataChange={onDataChange}
            />
          </motion.div>
        )}

        {activeTab === "password" && isSuperAdmin && (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 leading-tight">
                    Reset Password Anggota
                  </h3>
                  <p className="text-xs text-gray-500">
                    Semua individu yang memiliki akun login akan muncul di sini.
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama Kepala Keluarga..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 bg-gray-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-full py-12 text-center text-gray-400 animate-pulse font-medium">
                    Memuat data anggota...
                  </div>
                ) : members.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed text-gray-400 font-medium">
                    Tidak ada data anggota dengan akun aktif.
                  </div>
                ) : (
                  members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                          {m.nama_lengkap.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-xs">
                            {toTitleCase(m.nama_lengkap)}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium tracking-wide">
                            {m.hubungan} • RT {m.rt}/RW {m.rw} • {m.no_anggota}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleResetPassword(m)
                        }
                        className="text-amber-600 hover:text-white hover:bg-amber-600 rounded-lg gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="hidden sm:inline">Reset</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                <span className="font-bold">Informasi:</span> Me-reset password
                akan menghapus data akses login member tersebut secara permanen.
                Member harus memilih nama mereka kembali di halaman login dan
                menentukan password baru untuk bisa masuk ke "Kartu Saya".
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
