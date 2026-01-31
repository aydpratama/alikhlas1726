"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Clock,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAdmin } from "@/hooks/useAdmin";

interface Study {
  id: number;
  ustadz: string;
  kitab: string;
  hari: string;
  waktu: string;
}

export function WeeklyKajianSchedule() {
  const { canManageKajian } = useAdmin();
  const [activeWeek, setActiveWeek] = useState(1);
  const [todayWeek, setTodayWeek] = useState(1);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editMode, setEditMode] = useState<"create" | "edit">("create");
  const [formData, setFormData] = useState({
    id: 0,
    ustadz: "",
    kitab: "",
    hari: "Senin",
    waktu: "18:00",
  });
  const [saving, setSaving] = useState(false);

  // Auto-detect current week based on date
  useEffect(() => {
    const day = new Date().getDate();
    const week =
      day <= 7 ? 1 : day <= 14 ? 2 : day <= 21 ? 3 : day <= 28 ? 4 : 5;
    setActiveWeek(week);
    setTodayWeek(week);
  }, []);

  const fetchStudies = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("kajian")
      .select("*")
      .eq("minggu_ke", activeWeek)
      .eq("aktif", true)
      .order("id", { ascending: true });

    if (data) {
      setStudies(
        data.map((item: Record<string, unknown>) => ({
          id: item.id as number,
          ustadz: item.nama_ustadz as string,
          kitab: item.judul as string,
          hari: item.hari as string,
          waktu: item.waktu as string,
        })),
      );
    } else {
      setStudies([]);
    }
    setLoading(false);
  }, [activeWeek]);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Record<string, unknown> = {
      nama_ustadz: formData.ustadz,
      judul: formData.kitab,
      hari: formData.hari,
      waktu: formData.waktu,
      minggu_ke: activeWeek,
      aktif: true,
    };

    try {
      const res =
        editMode === "create"
          ? await (supabase.from("kajian") as any).insert([payload])
          : await (supabase.from("kajian") as any).update(payload).eq("id", formData.id);

      if (res.error) {
        alert(`Gagal: ${res.error.message}`);
      } else {
        await fetchStudies();
        setIsEditorOpen(false);
        setFormData({
          id: 0,
          ustadz: "",
          kitab: "",
          hari: "Senin",
          waktu: "18:00",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Error: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus jadwal kajian ini?")) return;
    const { error } = await (supabase.from("kajian") as any).delete().eq("id", id);
    if (error) {
      alert(`Gagal: ${error.message}`);
    } else {
      await fetchStudies();
    }
  };

  const openCreate = () => {
    setEditMode("create");
    setFormData({
      id: 0,
      ustadz: "",
      kitab: "",
      hari: "Senin",
      waktu: "18:00",
    });
    setIsEditorOpen(true);
  };

  const openEdit = (study: Study) => {
    setEditMode("edit");
    setFormData({ ...study });
    setIsEditorOpen(true);
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="space-y-4">
        <div className="h-8 w-48 bg-slate-100 rounded-md mx-auto animate-pulse" />
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-16 h-8 bg-slate-100 rounded-md animate-pulse"
            />
          ))}
        </div>
        <div className="bg-gray-800 rounded-md p-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3 p-4">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-700 rounded" />
                  <div className="h-4 w-16 bg-gray-700 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-gray-700 rounded" />
                <div className="h-4 w-1/2 bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
          Jadwal <span className="text-emerald-600">Kajian</span>
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Ikuti kajian rutin mingguan untuk menambah ilmu dan mempererat ukhuwah
          islamiyah
        </p>
      </div>

      {/* Week Navigation + Add Button */}
      <div className="flex flex-row items-center justify-center gap-3">
        {canManageKajian && (
          <button
            onClick={openCreate}
            className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all duration-200 shadow-sm"
            title="Tambah Jadwal"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}

        {/* Week Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
          {[1, 2, 3, 4, 5].map((w) => (
            <button
              key={w}
              onClick={() => setActiveWeek(w)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${activeWeek === w
                  ? "bg-gray-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                } ${todayWeek === w ? "ring-2 ring-emerald-500 ring-offset-1" : ""}`}
            >
              Pekan {w}
            </button>
          ))}
        </div>
      </div>

      {/* Kajian Content */}
      {activeWeek === 5 ? (
        // Week 5 - Coming Soon
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-md p-8 md:p-12 text-center shadow-xl border border-slate-700">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-500 opacity-50" />
          <h4 className="text-lg font-semibold text-white mb-2">
            Jadwal Akan Segera Diumumkan
          </h4>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Jadwal kajian untuk pekan ke-5 masih dalam perencanaan. Pantau terus
            pengumuman dari pengurus masjid.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-md overflow-hidden shadow-xl border border-slate-700">
          {/* Week Header */}
          <div className="px-6 py-4 border-b border-slate-700/50 text-center">
            <h4 className="text-lg font-bold !text-white">
              Minggu ke-{activeWeek}
            </h4>
          </div>

          {/* Kajian List */}
          <div className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              {studies.length > 0 ? (
                <motion.div
                  key={`week-${activeWeek}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {studies.map((study, index) => (
                    <motion.div
                      key={study.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="group p-4 bg-gray-900 hover:bg-gray-700/50 rounded-md transition-colors relative"
                    >
                      {/* Action Buttons */}
                      {canManageKajian && (
                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(study)}
                            className="w-7 h-7 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 flex items-center justify-center transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(study.id)}
                            className="w-7 h-7 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 flex items-center justify-center transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 pr-16">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-white text-base md:text-lg mb-1 group-hover:text-emerald-400 transition-colors">
                            {study.kitab}
                          </h5>
                          <div className="flex items-center gap-1.5 text-sm text-gray-300">
                            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{study.ustadz}</span>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col gap-3 md:gap-1 text-xs md:text-sm md:items-end flex-shrink-0">
                          <div className="flex items-center gap-1.5 text-white font-medium bg-white/10 px-2 py-1 rounded">
                            <CalendarDays className="w-3.5 h-3.5" />
                            <span>{study.hari}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{study.waktu}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center"
                >
                  <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                  <p className="text-sm text-gray-500">
                    Belum ada jadwal kajian untuk pekan ke-{activeWeek}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) =>
              e.target === e.currentTarget && setIsEditorOpen(false)
            }
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-md rounded-md shadow-2xl p-6 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">
                    {editMode === "create" ? "Tambah" : "Edit"} Jadwal
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Pekan {activeWeek}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Judul Kitab / Kajian
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.kitab}
                    onChange={(e) =>
                      setFormData({ ...formData, kitab: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="Contoh: Tafsir Al-Quran"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Ustadz / Narasumber
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.ustadz}
                    onChange={(e) =>
                      setFormData({ ...formData, ustadz: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    placeholder="Contoh: Ustadz Ahmad Fauzi"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Hari
                    </label>
                    <select
                      value={formData.hari}
                      onChange={(e) =>
                        setFormData({ ...formData, hari: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:border-emerald-500 transition-all outline-none appearance-none cursor-pointer"
                    >
                      {[
                        "Senin",
                        "Selasa",
                        "Rabu",
                        "Kamis",
                        "Jumat",
                        "Sabtu",
                        "Ahad",
                      ].map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Waktu
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.waktu}
                      onChange={(e) =>
                        setFormData({ ...formData, waktu: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 transition-all outline-none"
                      placeholder="19:00 - 21:00"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="flex-1 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-full border border-slate-200 active:scale-[0.98] transition-all"
                  >
                    Batal
                  </button>
                  <button
                    disabled={saving}
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
