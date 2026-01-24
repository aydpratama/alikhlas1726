"use client";

import { useState, useEffect } from "react";
import { RegistrationApproval } from "@/components/RegistrationApproval";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/Toast";
import {
  Search,
  RotateCcw,
  User,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface OthersViewProps {
  isAdmin: boolean;
  onDataChange: () => void;
}

export function OthersView({ isAdmin, onDataChange }: OthersViewProps) {
  const [subTab, setSubTab] = useState<"approval" | "password">("approval");
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Search members who have accounts
  useEffect(() => {
    if (subTab !== "password") return;

    const fetchMembers = async () => {
      setLoading(true);
      const supabase = createClient();

      // Fetch members joined with their accounts
      let query = supabase
        .from("anggota_pemulasaraan")
        .select(
          `
                    id, no_anggota, nama_lengkap, rt, rw,
                    member_accounts(id_anggota, password)
                `,
        )
        .eq("hubungan_keluarga", "Kepala Keluarga")
        .not("member_accounts", "is", null);

      if (searchTerm) {
        query = query.ilike("nama_lengkap", `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        console.error("Error fetching members for reset:", error);
      } else {
        setMembers(data || []);
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchMembers, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, subTab]);

  const handleResetPassword = async (id_anggota: number, name: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin me-reset password untuk ${name}? Member akan diminta membuat password baru saat login berikutnya.`,
      )
    ) {
      return;
    }

    const supabase = createClient();
    const { error } = await supabase
      .from("member_accounts")
      .delete()
      .eq("id_anggota", id_anggota);

    if (error) {
      toast.error("Gagal melakukan reset password");
    } else {
      toast.success(`Password ${name} berhasil di-reset`);
      setMembers((prev) => prev.filter((m) => m.id !== id_anggota));
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      {/* Sub-Tab Navigation */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm max-w-md">
        <button
          onClick={() => setSubTab("approval")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            subTab === "approval"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Persetujuan Pendaftaran
        </button>
        <button
          onClick={() => setSubTab("password")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            subTab === "password"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          Reset Password Member
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === "approval" ? (
          <motion.div
            key="approval"
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
        ) : (
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
                    Hanya anggota yang sudah pernah membuat password yang muncul
                    di sini.
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
                          {m.nama_lengkap.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors uppercase text-xs">
                            {m.nama_lengkap}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium tracking-wide">
                            RT {m.rt}/RW {m.rw} • {m.no_anggota}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleResetPassword(m.id, m.nama_lengkap)
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
