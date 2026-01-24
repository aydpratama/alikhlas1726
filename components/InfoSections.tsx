"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { WeeklyKajianSchedule } from "./WeeklyKajianSchedule";
import { DonationSection } from "./DonationSection";
import { DonaturTetap } from "./DonaturTetap";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Wallet,
  TrendingUp,
  TrendingDown,
  Info,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  Clock,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Announcement {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
  gallery: string[];
}

interface FinancialReport {
  id: number;
  month: number;
  year: number;
  week: number;
  initialBalance: number;
  income: number;
  expense: number;
  finalBalance: number;
  url_file_pdf: string | null;
  createdAt: string;
}

const MONTH_NAMES = [
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

export function InfoSections() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [finance, setFinance] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);

  // Announcement CRUD States
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [annForm, setAnnForm] = useState({
    id: 0,
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    gallery: [] as string[],
  });

  // Finance CRUD States
  const [isFinModalOpen, setIsFinModalOpen] = useState(false);
  const [finForm, setFinForm] = useState({
    id: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    week: 1,
    initialBalance: 0,
    income: 0,
    expense: 0,
    url_file_pdf: "",
  });

  const [saving, setSaving] = useState(false);

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Announcements
    const { data: annData } = await supabase
      .from("announcements")
      .select("*")
      .eq("aktif", true)
      .order("tanggal_pengumuman", { ascending: false })
      .limit(2);

    if (annData) {
      setAnnouncements(
        annData.map((item) => ({
          id: item.id,
          title: item.judul,
          date: new Date(item.tanggal_pengumuman).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          description: item.konten,
          image: item.url_gambar,
          gallery: item.gallery || [],
        })),
      );
    }

    // Finance
    const { data: finData } = await supabase
      .from("laporan_keuangan")
      .select("*")
      .order("tahun", { ascending: false })
      .order("bulan", { ascending: false })
      .order("minggu_ke", { ascending: false })
      .limit(1)
      .single();

    if (finData) {
      setFinance({
        id: finData.id,
        month: finData.bulan,
        year: finData.tahun,
        week: finData.minggu_ke,
        initialBalance: finData.saldo_awal,
        income: finData.pemasukan,
        expense: finData.pengeluaran,
        finalBalance: finData.saldo_akhir,
        url_file_pdf: finData.url_file_pdf,
        createdAt: finData.dibuat_pada
          ? new Date(finData.dibuat_pada)
              .toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
              .replace(",", "")
          : "Baru saja",
      });
    }
    setLoading(false);
  };

  const handleViewReport = () => {
    if (!finance?.url_file_pdf) {
      alert("File PDF laporan belum tersedia untuk periode ini.");
      return;
    }
    window.open(finance.url_file_pdf, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (
    files: FileList | null,
  ): Promise<string[]> => {
    if (!files || files.length === 0) return [];

    const uploadedUrls: string[] = [];
    setUploadingImages(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `announcements/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("announcements")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("announcements").getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  // Announcement Actions
  const handleAnnSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      judul: annForm.title,
      konten: annForm.description,
      url_gambar: annForm.gallery.length > 0 ? annForm.gallery[0] : null,
      tanggal_pengumuman: annForm.date,
      aktif: true,
      gallery: annForm.gallery,
    };

    try {
      let res;
      if (annForm.id === 0) {
        res = await supabase.from("announcements").insert([payload]);
      } else {
        res = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", annForm.id);
      }

      if (res.error) {
        alert(`Gagal menyimpan: ${res.error.message}`);
      } else {
        await fetchData();
        alert("Pengumuman berhasil disimpan!");
        setIsAnnModalOpen(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Sistem Error: ${message}`);
    }
    setSaving(false);
  };

  const handleAnnDelete = async (id: number) => {
    if (!confirm("Hapus pengumuman ini secara permanen?")) return;
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
    } else {
      await fetchData();
      alert("Pengumuman berhasil dihapus permanen!");
    }
  };

  // Finance Actions
  const handleFinSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const finalBalance =
      Number(finForm.initialBalance) +
      Number(finForm.income) -
      Number(finForm.expense);

    const payload = {
      bulan: finForm.month,
      tahun: finForm.year,
      minggu_ke: finForm.week,
      saldo_awal: finForm.initialBalance,
      pemasukan: finForm.income,
      pengeluaran: finForm.expense,
      saldo_akhir: finalBalance,
      url_file_pdf: finForm.url_file_pdf,
      dipublikasikan: true,
    };

    try {
      let res;
      if (finForm.id === 0) {
        res = await supabase.from("laporan_keuangan").insert([payload]);
      } else {
        res = await supabase
          .from("laporan_keuangan")
          .update(payload)
          .eq("id", finForm.id);
      }

      if (res.error) {
        alert(`Gagal menyimpan: ${res.error.message}`);
      } else {
        await fetchData();
        alert("Laporan keuangan berhasil disimpan!");
        setIsFinModalOpen(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Sistem Error: ${message}`);
    }
    setSaving(false);
  };

  const handleFinDelete = async (id: number) => {
    if (!confirm("Hapus laporan keuangan ini secara permanen?")) return;
    const { error } = await supabase
      .from("laporan_keuangan")
      .delete()
      .eq("id", id);
    if (error) {
      alert(`Gagal menghapus: ${error.message}`);
    } else {
      await fetchData();
      setFinance(null);
      alert("Laporan keuangan berhasil dihapus permanen!");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-3 sm:px-6">
      <div className="lg:col-span-2 space-y-12">
        <WeeklyKajianSchedule />

        {/* Announcements */}
        <div className="space-y-6">
          <div className="text-center px-2">
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Pengumuman <span className="text-emerald-600">Terbaru</span>
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Informasi penting seputar kegiatan masjid
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              [1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-100 rounded-md overflow-hidden animate-pulse"
                >
                  <div className="aspect-video bg-slate-100" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-5 bg-slate-100 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))
            ) : announcements.length > 0 ? (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white border border-slate-200 rounded-md overflow-hidden group hover:border-emerald-300 hover:shadow-lg transition-all duration-300 relative"
                >
                  {/* Image - Clickable for Detail */}
                  <div
                    className="aspect-video relative overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedAnnouncement(ann);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <Image
                      src={
                        ann.image ||
                        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={ann.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 shadow-lg">
                        Lihat Detail
                      </div>
                    </div>
                  </div>

                  {/* Content - Title Below Image */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                        {ann.date}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-base md:text-lg group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">
                      {ann.title}
                    </h4>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {ann.description}
                    </p>

                    {ann.gallery && ann.gallery.length > 0 && (
                      <div className="mt-3 flex gap-1">
                        {ann.gallery.slice(0, 3).map((img, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0"
                          >
                            <Image
                              src={img}
                              alt={`Gallery ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                        {ann.gallery.length > 3 && (
                          <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                            +{ann.gallery.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inline Actions */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnnouncement(ann);
                        setIsDetailModalOpen(true);
                      }}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 flex items-center justify-center transition-all shadow-sm"
                      title="Lihat Detail"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnnForm({
                          id: ann.id,
                          title: ann.title,
                          description: ann.description,
                          date: "",
                          gallery: ann.gallery,
                        });
                        setIsAnnModalOpen(true);
                      }}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center transition-all shadow-sm"
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnnDelete(ann.id);
                      }}
                      className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-600 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-all shadow-sm"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 py-12 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-md">
                <Info className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  Belum ada pengumuman terbaru.
                </p>
              </div>
            )}
          </div>

          {/* Add Announcement Button */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                setAnnForm({
                  id: 0,
                  title: "",
                  description: "",
                  date: new Date().toISOString().split("T")[0],
                  gallery: [] as string[],
                });
                setIsAnnModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Pengumuman
            </button>
          </div>
        </div>
      </div>

      {/* Simple Vertical Financial Report Section */}
      <div className="lg:col-span-1 space-y-6">
        <div className="text-center px-2">
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
            Laporan <span className="text-emerald-600">Keuangan</span>
          </h3>
          <p className="text-sm text-slate-500">
            Transparansi laporan keuangan masjid setiap minggu
          </p>
          <div className="flex justify-center gap-1.5 mt-3">
            <button
              onClick={() => {
                setFinForm({
                  id: 0,
                  month: new Date().getMonth() + 1,
                  year: new Date().getFullYear(),
                  week: 1,
                  initialBalance: 0,
                  income: 0,
                  expense: 0,
                  url_file_pdf: "",
                });
                setIsFinModalOpen(true);
              }}
              className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            {finance && (
              <>
                <button
                  onClick={() => {
                    setFinForm({
                      id: finance.id,
                      month: finance.month,
                      year: finance.year,
                      week: finance.week,
                      initialBalance: finance.initialBalance,
                      income: finance.income,
                      expense: finance.expense,
                      url_file_pdf: finance.url_file_pdf || "",
                    });
                    setIsFinModalOpen(true);
                  }}
                  className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleFinDelete(finance.id)}
                  className="w-7 h-7 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="h-[300px] bg-slate-100 rounded-md animate-pulse" />
        ) : finance ? (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-emerald-800 rounded-md p-6 shadow-lg text-white relative overflow-hidden flex flex-col"
          >
            <div className="space-y-6">
              {/* Simple Vertical Header */}
              <div className="border-b border-white/10 pb-4">
                <p className="text-[10px] font-black tracking-widest text-emerald-100 mb-0.5">
                  Laporan Keuangan
                </p>
                <h4 className="text-xl font-bold !text-white leading-tight">
                  {MONTH_NAMES[finance.month - 1]} {finance.year}
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-100/90">
                    <Clock className="w-3 h-3" />
                    <span>{finance.createdAt}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded">
                    Minggu {finance.week}
                  </span>
                </div>
              </div>

              {/* Metrics Stacked Vertically */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-emerald-100 font-medium">
                    Saldo Awal
                  </span>
                  <span className="font-bold">
                    {formatCurrency(finance.initialBalance)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-100 font-medium">
                      Pemasukan
                    </span>
                  </div>
                  <span className="font-bold text-emerald-50">
                    {formatCurrency(finance.income)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-3.5 h-3.5 text-red-300" />
                    <span className="text-emerald-100 font-medium">
                      Pengeluaran
                    </span>
                  </div>
                  <span className="font-bold text-red-200">
                    ({formatCurrency(finance.expense)})
                  </span>
                </div>

                <div className="pt-2 flex justify-between items-end">
                  <span className="text-xs font-black tracking-widest text-emerald-200">
                    Saldo Akhir
                  </span>
                  <span className="text-2xl font-black tracking-tight">
                    {formatCurrency(finance.finalBalance)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleViewReport}
                className="w-full py-3 mt-2 bg-white text-emerald-900 rounded-full font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-xs shadow-md"
              >
                <FileText className="w-4 h-4" />
                Lihat Detail Laporan
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="py-12 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-md">
            <Wallet className="w-8 h-8 mx-auto mb-2 opacity-10" />
            <p className="text-xs font-medium px-4">
              Data keuangan periode ini belum tersedia.
            </p>
          </div>
        )}
      </div>

      {/* Donation & Donor Section - Full Width */}
      <div className="lg:col-span-3 mt-8 border-t border-slate-100 pt-12 space-y-20">
        <DonaturTetap />
        <DonationSection />
      </div>

      {/* Announcement Editor Modal */}
      <AnimatePresence>
        {isAnnModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-md shadow-2xl p-8 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-bold text-slate-900 text-xl">
                  {annForm.id === 0 ? "Tambah" : "Edit"} Pengumuman
                </h4>
                <button
                  onClick={() => {
                    setIsAnnModalOpen(false);
                    setAnnForm({
                      id: 0,
                      title: "",
                      description: "",
                      date: new Date().toISOString().split("T")[0],
                      gallery: [] as string[],
                    });
                  }}
                  className="text-slate-400 hover:text-slate-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAnnSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Judul Pengumuman
                  </label>
                  <input
                    required
                    type="text"
                    value={annForm.title}
                    onChange={(e) =>
                      setAnnForm({ ...annForm, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
                    placeholder="Contoh: Renovasi Masjid..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={annForm.description}
                    onChange={(e) =>
                      setAnnForm({ ...annForm, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
                    placeholder="Tuliskan isi pengumuman..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Tanggal
                  </label>
                  <input
                    required
                    type="date"
                    value={annForm.date}
                    onChange={(e) =>
                      setAnnForm({ ...annForm, date: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Galeri Gambar (Upload File)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      const urls = await handleImageUpload(e.target.files);
                      if (urls.length > 0) {
                        setAnnForm({
                          ...annForm,
                          gallery: [...annForm.gallery, ...urls],
                        });
                      }
                    }}
                    disabled={uploadingImages}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {uploadingImages && (
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Mengupload
                      gambar...
                    </p>
                  )}
                </div>
                {annForm.gallery.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      Galeri Saat Ini ({annForm.gallery.length} gambar)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {annForm.gallery.map((img, idx) => (
                        <div key={idx} className="relative aspect-video">
                          <Image
                            src={img}
                            alt={`Gallery ${idx}`}
                            fill
                            className="object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAnnForm({
                                ...annForm,
                                gallery: annForm.gallery.filter(
                                  (_, i) => i !== idx,
                                ),
                              })
                            }
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAnnModalOpen(false);
                      setAnnForm({
                        id: 0,
                        title: "",
                        description: "",
                        date: new Date().toISOString().split("T")[0],
                        gallery: [] as string[],
                      });
                    }}
                    className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-full transition-all"
                  >
                    Batal
                  </button>
                  <button
                    disabled={saving}
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 text-white text-xs font-bold rounded-full hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}{" "}
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Financial Report Editor Modal */}
      <AnimatePresence>
        {isFinModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-lg rounded-md shadow-2xl p-8 border border-slate-200"
            >
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-bold text-slate-900 text-xl">
                  {finForm.id === 0 ? "Tambah" : "Edit"} Laporan Keuangan
                </h4>
                <button
                  onClick={() => setIsFinModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleFinSave} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      Bulan
                    </label>
                    <select
                      value={finForm.month}
                      onChange={(e) =>
                        setFinForm({
                          ...finForm,
                          month: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm"
                    >
                      {MONTH_NAMES.map((m, i) => (
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
                      value={finForm.year}
                      onChange={(e) =>
                        setFinForm({ ...finForm, year: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      Minggu Ke
                    </label>
                    <select
                      value={finForm.week}
                      onChange={(e) =>
                        setFinForm({ ...finForm, week: Number(e.target.value) })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm"
                    >
                      {[1, 2, 3, 4, 5].map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    Saldo Awal (Rp)
                  </label>
                  <input
                    type="number"
                    value={finForm.initialBalance}
                    onChange={(e) =>
                      setFinForm({
                        ...finForm,
                        initialBalance: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      Pemasukan (Rp)
                    </label>
                    <input
                      type="number"
                      value={finForm.income}
                      onChange={(e) =>
                        setFinForm({
                          ...finForm,
                          income: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-emerald-600 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-400">
                      Pengeluaran (Rp)
                    </label>
                    <input
                      type="number"
                      value={finForm.expense}
                      onChange={(e) =>
                        setFinForm({
                          ...finForm,
                          expense: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm text-red-600 font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400">
                    URL File PDF Laporan
                  </label>
                  <input
                    type="text"
                    value={finForm.url_file_pdf}
                    onChange={(e) =>
                      setFinForm({ ...finForm, url_file_pdf: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
                    placeholder="https://jriioagbsjylwxhrzqbn.supabase.co/storage/v1/object/public/laporan-keuangan/..."
                  />
                  <p className="text-[9px] text-slate-400">
                    Masukkan link publik dari Supabase Storage
                  </p>
                </div>

                <div className="bg-emerald-50 p-4 rounded-md border border-emerald-100 mt-4">
                  <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">
                    Estimasi Saldo Akhir
                  </p>
                  <p className="text-xl font-black text-emerald-900">
                    {formatCurrency(
                      Number(finForm.initialBalance) +
                        Number(finForm.income) -
                        Number(finForm.expense),
                    )}
                  </p>
                </div>

                <div className="pt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFinModalOpen(false)}
                    className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 border border-slate-200 rounded-full transition-all"
                  >
                    Batal
                  </button>
                  <button
                    disabled={saving}
                    type="submit"
                    className="flex-1 py-3 bg-emerald-600 text-white text-xs font-bold rounded-full hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}{" "}
                    Simpan Laporan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Announcement Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedAnnouncement && (
          <div
            className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsDetailModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-3xl max-h-[90vh] rounded-md shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">
                      {selectedAnnouncement.date}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-2xl">
                    {selectedAnnouncement.title}
                  </h4>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-slate-400 hover:text-slate-900"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {selectedAnnouncement.image && (
                  <div className="mb-6">
                    <Image
                      src={selectedAnnouncement.image}
                      alt={selectedAnnouncement.title}
                      width={800}
                      height={450}
                      className="w-full h-auto rounded-md"
                    />
                  </div>
                )}

                {selectedAnnouncement.gallery &&
                  selectedAnnouncement.gallery.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-bold text-slate-700 mb-3">
                        Galeri Gambar
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedAnnouncement.gallery.map((img, idx) => (
                          <div
                            key={idx}
                            className="aspect-video relative overflow-hidden rounded-md cursor-pointer group"
                            onClick={() => setPreviewImage(img)}
                          >
                            <Image
                              src={img}
                              alt={`Gallery ${idx + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-600 whitespace-pre-wrap">
                    {selectedAnnouncement.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal (Lightbox) */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            onClick={() => setPreviewImage(null)}
          >
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-5xl w-full max-h-[85vh] aspect-video rounded-md overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
