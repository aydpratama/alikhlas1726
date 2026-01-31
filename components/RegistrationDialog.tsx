"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import {
  Users,
  UserPlus,
  Heart,
  CheckCircle2,
  Star,
  ShieldCheck,
  AlertCircle,
  Info,
  ArrowRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";
import { toTitleCase } from "@/lib/utils";

interface RegistrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type JenisAnggota = "Tetap" | "Tetap Tambahan" | "Umum" | null;

const JENIS_ANGGOTA_INFO = {
  Tetap: {
    title: "Anggota Tetap (Kepala)",
    icon: Star,
    color: "emerald",
    biaya: 1000000,
    iuran: "Bayar 1x Seumur Hidup",
    desc: "Pendaftaran untuk Kepala Keluarga",
  },
  "Tetap Tambahan": {
    title: "Anggota Tetap (Anggota)",
    icon: UserPlus,
    color: "emerald",
    biaya: 800000,
    iuran: "Bayar 1x Seumur Hidup",
    desc: "Pendaftaran untuk Anggota Keluarga",
  },
  Umum: {
    title: "Anggota Umum",
    icon: Heart,
    color: "orange",
    biaya: 30000,
    iuran: "Iuran Bulanan Rp5.000",
    desc: "Pendaftaran & Iuran Bulanan",
  },
};

type MemberEntry = {
  nama_lengkap: string;
  hubungan_keluarga: string;
  jenis_anggota: JenisAnggota;
};

export function RegistrationDialog({
  isOpen,
  onClose,
}: RegistrationDialogProps) {
  const [step, setStep] = useState<"pilih" | "form">("pilih");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [familyInfo, setFamilyInfo] = useState({
    alamat: "",
    rt: "",
    rw: "",
    email: "",
    no_telepon: "",
  });

  const [members, setMembers] = useState<MemberEntry[]>([
    { nama_lengkap: "", hubungan_keluarga: "", jenis_anggota: null },
  ]);

  const handleReset = () => {
    setStep("pilih");
    setFamilyInfo({ alamat: "", rt: "", rw: "", email: "", no_telepon: "" });
    setMembers([
      { nama_lengkap: "", hubungan_keluarga: "", jenis_anggota: null },
    ]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const addMember = () => {
    setMembers([
      ...members,
      { nama_lengkap: "", hubungan_keluarga: "", jenis_anggota: "Umum" },
    ]);
  };

  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const updateMember = (index: number, updates: Partial<MemberEntry>) => {
    let newMembers = [...members];

    // Jika set sebagai Kepala Keluarga, ubah anggota lain yang sebelumnya KK menjadi Lainnya
    if (updates.hubungan_keluarga === "Kepala Keluarga") {
      newMembers = newMembers.map((m, i) =>
        i === index
          ? { ...m, ...updates }
          : {
            ...m,
            hubungan_keluarga:
              m.hubungan_keluarga === "Kepala Keluarga"
                ? "Lainnya"
                : m.hubungan_keluarga,
          },
      );
    } else {
      newMembers[index] = { ...newMembers[index], ...updates };
    }

    setMembers(newMembers);
  };

  const totalBiaya = members.reduce((sum, m) => {
    return (
      sum + (m.jenis_anggota ? JENIS_ANGGOTA_INFO[m.jenis_anggota].biaya : 0)
    );
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (members.some((m) => !m.jenis_anggota || !m.nama_lengkap)) {
      toast.error("Mohon lengkapi semua data anggota.");
      return;
    }

    setIsSubmitting(true);

    try {
      const kepalaKeluargaRaw =
        members.find((m) => m.hubungan_keluarga === "Kepala Keluarga")
          ?.nama_lengkap || members[0].nama_lengkap;
      const kepalaKeluarga = kepalaKeluargaRaw.trim();

      const membersToInsert = members.map((m) => {
        const pendaftaranBiaya = m.jenis_anggota
          ? JENIS_ANGGOTA_INFO[m.jenis_anggota].biaya
          : 0;
        return {
          nama_lengkap: m.nama_lengkap.trim(),
          jenis_anggota: m.jenis_anggota,
          hubungan_keluarga: m.hubungan_keluarga,
          alamat: familyInfo.alamat.trim(),
          rt: parseInt(familyInfo.rt),
          rw: parseInt(familyInfo.rw),
          email: familyInfo.email?.trim() || null,
          no_telepon: familyInfo.no_telepon?.trim() || null,
          nama_kepala_keluarga: kepalaKeluarga,
          biaya_pendaftaran: pendaftaranBiaya,
          status: "pending",
        };
      });

      const { error } = await (
        supabase.from("pendaftaran_pemulasaraan") as any
      ).insert(membersToInsert);

      if (error) throw error;

      toast.success(
        "Pendaftaran berhasil dikirim! Mohon tunggu konfirmasi dari admin.",
      );
      handleClose();
    } catch (error) {
      console.error("Error submitting registration:", error);
      toast.error("Gagal mengirim pendaftaran. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-none bg-transparent shadow-none [&>button]:hidden">
        {/* Single Refined Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-50 w-8 h-8 bg-white/90 backdrop-blur text-gray-900 rounded-full flex items-center justify-center shadow-lg border border-slate-200 hover:bg-white transition-all active:scale-95 group"
        >
          <X className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait">
          {step === "pilih" ? (
            <motion.div
              key="step-pilih"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-md shadow-2xl overflow-hidden border border-emerald-50"
            >
              <div className="relative bg-emerald-600 p-8 text-white text-center">
                <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                  <ShieldCheck size={180} />
                </div>
                <div className="relative z-10 space-y-2">
                  <DialogTitle className="text-2xl font-bold !text-white">
                    Pendaftaran Online
                  </DialogTitle>
                  <DialogDescription className="text-white opacity-90 text-sm font-medium">
                    Layanan Pemulasaraan Jenazah Al-Ikhlas
                  </DialogDescription>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="bg-emerald-50 p-4 rounded-md border border-emerald-100 flex gap-3 items-start">
                  <div className="bg-emerald-200 p-1.5 rounded-lg text-emerald-900 shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-950 text-xs uppercase tracking-tight">
                      Informasi Pendaftaran
                    </p>
                    <p className="text-[11px] text-emerald-950 leading-relaxed font-semibold">
                      Anda bisa mendaftarkan{" "}
                      <strong>seluruh anggota keluarga</strong> sekaligus. Pilih
                      tipe keanggotaan untuk setiap orang.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="p-6 border-2 border-dashed border-slate-200 rounded-md text-center space-y-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                      <Users size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        Mulai Pendaftaran Keluarga
                      </h4>
                      <p className="text-[10px] text-gray-700 mt-0.5 font-semibold">
                        Siapkan data KTP/KK untuk mempermudah
                      </p>
                    </div>
                    <Button
                      onClick={() => setStep("form")}
                      className="w-full h-12 !bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs shadow-lg shadow-emerald-500/20"
                    >
                      Mulai Sekarang
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full h-11 sm:h-auto text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Batal & Tutup
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-md shadow-2xl overflow-hidden border border-emerald-50 flex flex-col max-h-[92vh]"
            >
              <div className="bg-emerald-600 p-5 text-white shrink-0">
                <h2 className="text-lg !text-white font-bold leading-none">
                  Formulir Pendaftaran
                </h2>
                <p className="text-[10px] text-emerald-100 font-semibold mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  Input Data Anggota Keluarga
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-5 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-white"
              >
                {/* Section 1: Family Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-200">
                    <div className="w-5 h-5 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                      <Info className="w-3 h-3" />
                    </div>
                    <h3 className="text-xs font-bold text-gray-800">
                      Informasi Alamat
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-sm font-bold text-gray-900 block px-1">
                        Alamat Lengkap *
                      </label>
                      <Input
                        required
                        value={familyInfo.alamat}
                        onChange={(e) =>
                          setFamilyInfo({
                            ...familyInfo,
                            alamat: e.target.value,
                          })
                        }
                        placeholder="Contoh: Jl. Kakap Raya No. 12"
                        className="h-11 rounded-md border-slate-200 bg-white text-black focus:ring-emerald-500 text-sm font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-900 block px-1">
                          RT *
                        </label>
                        <Input
                          required
                          type="number"
                          value={familyInfo.rt}
                          onChange={(e) =>
                            setFamilyInfo({ ...familyInfo, rt: e.target.value })
                          }
                          placeholder="001"
                          className="h-11 rounded-md border-slate-200 bg-white text-black text-sm font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-900 block px-1">
                          RW *
                        </label>
                        <Input
                          required
                          type="number"
                          value={familyInfo.rw}
                          onChange={(e) =>
                            setFamilyInfo({ ...familyInfo, rw: e.target.value })
                          }
                          placeholder="017"
                          className="h-11 rounded-md border-slate-200 bg-white text-black text-sm font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-sm font-bold text-gray-900 block px-1">
                        No. Telepon (WhatsApp) *
                      </label>
                      <Input
                        required
                        value={familyInfo.no_telepon}
                        onChange={(e) =>
                          setFamilyInfo({
                            ...familyInfo,
                            no_telepon: e.target.value,
                          })
                        }
                        placeholder="Contoh: 08123456789"
                        className="h-11 rounded-md border-slate-200 bg-white text-black focus:ring-emerald-500 text-sm font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Members List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                        <UserPlus className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Daftar Anggota ({members.length})
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {members.map((m, idx) => (
                      <div
                        key={idx}
                        className="relative p-4 bg-gray-50/50 rounded-md border border-slate-200 space-y-3"
                      >
                        {members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMember(idx)}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                          <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 block px-1">
                              Nama Anggota #{idx + 1}
                            </label>
                            <Input
                              required
                              value={m.nama_lengkap}
                              onChange={(e) =>
                                updateMember(idx, {
                                  nama_lengkap: toTitleCase(e.target.value),
                                })
                              }
                              placeholder="Nama Lengkap"
                              className="h-11 rounded-md border-slate-200 bg-white text-black text-sm font-bold"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-900 block px-1">
                              Status Keluarga
                            </label>
                            <select
                              required
                              value={m.hubungan_keluarga}
                              onChange={(e) =>
                                updateMember(idx, {
                                  hubungan_keluarga: e.target.value,
                                })
                              }
                              className="w-full h-11 px-3 border border-slate-200 bg-white rounded-md text-black text-sm font-bold outline-none focus:border-emerald-500 transition-all cursor-pointer"
                            >
                              <option value="">Pilih Hubungan...</option>
                              <option value="Kepala Keluarga">
                                Kepala Keluarga
                              </option>
                              <option value="Istri">Istri</option>
                              <option value="Anak">Anak</option>
                              <option value="Cucu">Cucu</option>
                              <option value="Orang Tua">Orang Tua</option>
                              <option value="Lainnya">Lainnya</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                          <label className="text-sm font-bold text-gray-900 block px-1">
                            Tipe Keanggotaan
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(JENIS_ANGGOTA_INFO).map(
                              ([key, info]) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() =>
                                    updateMember(idx, {
                                      jenis_anggota: key as JenisAnggota,
                                    })
                                  }
                                  className={`py-3 px-1 rounded-full flex flex-col items-center justify-center border-2 transition-all ${
                                    m.jenis_anggota === key
                                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                      : "bg-white border-slate-200 text-gray-500 hover:border-emerald-200 shadow-sm"
                                  }`}
                                >
                                  <span className="text-[10px] font-black uppercase tracking-tight">
                                    {key}
                                  </span>
                                  <span
                                    className={`text-[9px] mt-1 font-bold ${m.jenis_anggota === key ? "text-emerald-50" : "text-emerald-600"}`}
                                  >
                                    {info.biaya.toLocaleString()}
                                  </span>
                                  {key === "Umum" && (
                                    <span
                                      className={`text-[7px] mt-0.5 font-bold ${m.jenis_anggota === key ? "text-emerald-100/80" : "text-gray-400"}`}
                                    >
                                      + Rp 5000/bln
                                    </span>
                                  )}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addMember}
                    className="text-xs font-bold text-white bg-emerald-600 px-4 h-11 sm:h-9 rounded-full hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Tambah Orang
                  </button>
                </div>

                {/* Total & Submit */}
                <div className="space-y-4 pt-6 shrink-0">
                  <div className="p-4 bg-emerald-600 rounded-md text-white shadow-lg shadow-emerald-600/5 border border-emerald-500">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-100/80">
                        Total Biaya Pendaftaran
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-100/80" />
                    </div>
                    <p className="text-xl font-bold">
                      Rp {totalBiaya.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[10px] text-emerald-50 mt-0.5 italic font-medium leading-tight text-white/80">
                      * Pembayaran iuran bulanan (Anggota Umum) dimulai bulan
                      depan.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep("pilih")}
                      className="h-14 w-14 border border-slate-200 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-all"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-sm shadow-lg shadow-emerald-600/10 disabled:opacity-50 transition-all active:scale-[0.99]"
                    >
                      {isSubmitting ? "Mengirim Data..." : "Kirim Pendaftaran"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
