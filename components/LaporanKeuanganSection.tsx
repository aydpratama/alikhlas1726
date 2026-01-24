"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  X,
  Download,
  Loader2,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCallback } from "react";

// Types
interface LaporanKeuangan {
  id: number;
  tahun: number;
  bulan: number;
  minggu_ke: number;
  saldo_awal: number;
  pemasukan: number;
  pengeluaran: number;
  saldo_akhir: number;
  url_file_pdf: string | null;
  dipublikasikan: boolean;
  dibuat_pada: string;
}

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const initialFormData = {
  tahun: new Date().getFullYear(),
  bulan: new Date().getMonth() + 1,
  minggu_ke: 1,
  saldo_awal: 0,
  pemasukan: 0,
  pengeluaran: 0,
  saldo_akhir: 0,
  url_file_pdf: "",
  dipublikasikan: true,
};

export function LaporanKeuanganSection() {
  const canManageFinance = true; // Temporary open for CRUD without auth
  const [laporan, setLaporan] = useState<LaporanKeuangan[]>([]);
  const [loading, setLoading] = useState(true);

  // CRUD state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    try {
      const query = supabase.from("laporan_keuangan").select("*");

      if (!canManageFinance) {
        query.eq("dipublikasikan", true);
      }

      const { data, error } = await query
        .order("tahun", { ascending: false })
        .order("bulan", { ascending: false })
        .order("minggu_ke", { ascending: false })
        .limit(10);

      if (error) throw error;
      setLaporan(data || []);
    } catch (err) {
      console.error("Error fetching laporan:", err);
    } finally {
      setLoading(false);
    }
  }, [canManageFinance]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormData);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (item: LaporanKeuangan) => {
    setEditingId(item.id);
    setFormData({
      tahun: item.tahun,
      bulan: item.bulan,
      minggu_ke: item.minggu_ke,
      saldo_awal: item.saldo_awal,
      pemasukan: item.pemasukan,
      pengeluaran: item.pengeluaran,
      saldo_akhir: item.saldo_akhir,
      url_file_pdf: item.url_file_pdf || "",
      dipublikasikan: item.dipublikasikan,
    });
    setIsDialogOpen(true);
  };

  const updateFormWithCalculation = (updates: Partial<typeof formData>) => {
    const newForm = { ...formData, ...updates };
    newForm.saldo_akhir =
      Number(newForm.saldo_awal) +
      Number(newForm.pemasukan) -
      Number(newForm.pengeluaran);
    setFormData(newForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (editingId) {
        const { error: updateError } = await supabase
          .from("laporan_keuangan")
          .update(payload)
          .eq("id", editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("laporan_keuangan")
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      setIsDialogOpen(false);
      fetchLaporan();
    } catch (err) {
      console.error("Error saving laporan:", err);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      alert("❌ Gagal menyimpan: " + message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;

    try {
      const { error } = await supabase
        .from("laporan_keuangan")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchLaporan();
    } catch (err) {
      console.error("Error deleting laporan:", err);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      alert("❌ Gagal menghapus: " + message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="py-12 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Laporan <span className="text-teal-600">Keuangan</span>
              </h2>
              <p className="text-xs text-slate-500">
                Transparansi kas masjid setiap pekan
              </p>
            </div>
          </div>

          {canManageFinance && (
            <button
              onClick={openAddDialog}
              className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-full text-xs font-bold shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              TAMBAH LAPORAN
            </button>
          )}
        </div>

        {/* Laporan List */}
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-slate-400 text-sm animate-pulse">
              Memuat data keuangan...
            </p>
          </div>
        ) : laporan.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">
              Belum ada laporan yang tersedia
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {laporan.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-teal-600 tracking-widest bg-teal-50 px-2 py-1 rounded-md">
                      Minggu {item.minggu_ke}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mt-2">
                      {BULAN_NAMES[item.bulan - 1]} {item.tahun}
                    </h4>
                  </div>
                  {canManageFinance && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Saldo Awal</span>
                    <span className="font-bold text-slate-700">
                      {formatCurrency(item.saldo_awal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <ArrowUpCircle className="w-3 h-3" />
                      <span>Pemasukan</span>
                    </div>
                    <span className="font-bold text-emerald-600">
                      +{formatCurrency(item.pemasukan)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-1 text-rose-500">
                      <ArrowDownCircle className="w-3 h-3" />
                      <span>Pengeluaran</span>
                    </div>
                    <span className="font-bold text-rose-500">
                      -{formatCurrency(item.pengeluaran)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase">
                      Saldo Akhir
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(item.saldo_akhir)}
                    </span>
                  </div>
                </div>

                {item.url_file_pdf && (
                  <button
                    onClick={() => window.open(item.url_file_pdf!, "_blank")}
                    className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    DOWNLOAD PDF
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Dialog Modal */}
        <AnimatePresence>
          {isDialogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingId ? "Edit Laporan" : "Tambah Laporan Baru"}
                  </h3>
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">
                        Bulan
                      </label>
                      <select
                        value={formData.bulan}
                        onChange={(e) =>
                          updateFormWithCalculation({
                            bulan: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-100"
                      >
                        {BULAN_NAMES.map((m, i) => (
                          <option key={m} value={i + 1}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">
                        Tahun
                      </label>
                      <input
                        type="number"
                        value={formData.tahun}
                        onChange={(e) =>
                          updateFormWithCalculation({
                            tahun: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-100"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">
                        Minggu Ke
                      </label>
                      <select
                        value={formData.minggu_ke}
                        onChange={(e) =>
                          updateFormWithCalculation({
                            minggu_ke: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-100"
                      >
                        {[1, 2, 3, 4, 5].map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400">
                        Saldo Awal (Rp)
                      </label>
                      <input
                        type="number"
                        value={formData.saldo_awal}
                        onChange={(e) =>
                          updateFormWithCalculation({
                            saldo_awal: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-emerald-600">
                          Pemasukan (Rp)
                        </label>
                        <input
                          type="number"
                          value={formData.pemasukan}
                          onChange={(e) =>
                            updateFormWithCalculation({
                              pemasukan: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-bold text-emerald-700"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-rose-600">
                          Pengeluaran (Rp)
                        </label>
                        <input
                          type="number"
                          value={formData.pengeluaran}
                          onChange={(e) =>
                            updateFormWithCalculation({
                              pengeluaran: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-sm font-bold text-rose-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-6 text-white">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                      Estimasi Saldo Akhir
                    </p>
                    <p className="text-2xl font-black">
                      {formatCurrency(formData.saldo_akhir)}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      URL PDF Laporan
                    </label>
                    <input
                      type="text"
                      value={formData.url_file_pdf}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          url_file_pdf: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      BATAL
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-4 bg-teal-600 text-white text-sm font-bold rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-100 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      SIMPAN DATA
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
