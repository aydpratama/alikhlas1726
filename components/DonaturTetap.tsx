"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Calendar,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  ChevronDown,
  Trash2,
  Pencil,
  Wallet,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface DonaturTetapIuran {
  id: number;
  tahun: number;
  donatur_id: number;
  bulan_januari: number;
  bulan_februari: number;
  bulan_maret: number;
  bulan_april: number;
  bulan_mei: number;
  bulan_juni: number;
  bulan_juli: number;
  bulan_agustus: number;
  bulan_september: number;
  bulan_oktober: number;
  bulan_november: number;
  bulan_desember: number;
}

interface Donatur {
  id: number;
  nama: string;
  donatur_tetap_iuran: DonaturTetapIuran[];
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

const MONTH_COLUMNS = [
  "bulan_januari",
  "bulan_februari",
  "bulan_maret",
  "bulan_april",
  "bulan_mei",
  "bulan_juni",
  "bulan_juli",
  "bulan_agustus",
  "bulan_september",
  "bulan_oktober",
  "bulan_november",
  "bulan_desember",
];

interface DonaturTetapCardProps {
  donor: Donatur;
  year: number;
  index: number;
  isOpen: boolean;
  isEditing: boolean;
  editingDonorName: string;
  editingDonorIuran: Record<string, number>;
  canManage: boolean;
  onToggle: () => void;
  onDelete: (id: number, name: string) => void;
  onEdit: () => void;
  onNameChange: (name: string) => void;
  onIuranChange: (monthKey: string, value: number) => void;
  onSave: () => void;
  onCancel: () => void;
  onClearIuran: () => void;
  formatCurrency: (amount: number) => string;
}

function DonaturTetapCard({
  donor,
  year,
  index,
  isOpen,
  isEditing,
  editingDonorName,
  editingDonorIuran,
  canManage,
  onToggle,
  onDelete,
  onEdit,
  onNameChange,
  onIuranChange,
  onSave,
  onCancel,
  onClearIuran,
  formatCurrency,
}: DonaturTetapCardProps) {
  const iuran =
    donor.donatur_tetap_iuran?.find(
      (i: DonaturTetapIuran) => i.tahun === year,
    ) || ({} as Partial<DonaturTetapIuran>);

  let totalTahun = 0;
  MONTH_NAMES.forEach((bulan) => {
    const key = `bulan_${bulan.toLowerCase()}` as keyof DonaturTetapIuran;
    totalTahun += Number(iuran[key]) || 0;
  });

  const rowBg = index % 2 === 0 ? "bg-amber-50" : "bg-white";

  return (
    <div className="transition-all">
      <div
        role="button"
        tabIndex={0}
        onClick={!isEditing ? onToggle : undefined}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isEditing) {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`w-full px-6 py-5 flex items-center justify-between text-left transition-colors cursor-pointer ${isOpen ? "bg-amber-50/30" : `hover:bg-amber-50/10 ${rowBg}`}`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isOpen ? "bg-amber-100 border-amber-200 text-amber-600" : "bg-gray-100 border-slate-200 text-gray-400"}`}
          >
            <User className="w-5 h-5" />
          </div>
          <div>
            <span
              className={`font-bold text-base block ${isOpen ? "text-amber-900" : "text-gray-800"}`}
            >
              {donor.nama}
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Donatur Tetap • {year}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p
              className={`font-black text-sm ${totalTahun > 0 ? "text-emerald-600" : "text-gray-300"}`}
            >
              {formatCurrency(totalTahun)}
            </p>
          </div>
          {canManage && !isOpen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(donor.id, donor.nama);
              }}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              title="Hapus Donatur"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className={`${isOpen ? "text-amber-600" : "text-gray-300"}`}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-6 pb-8 pt-2 bg-white">
              {canManage && !isEditing && (
                <div className="flex justify-end mb-4">
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 text-[10px] font-black tracking-widest uppercase transition-colors border border-amber-100"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit Data
                  </button>
                </div>
              )}

              {isEditing ? (
                <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-200 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
                      <div className="flex-1 mr-4">
                        <label className="block text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1.5 ml-1">
                          Nama Lengkap Donatur
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                          <input
                            type="text"
                            value={editingDonorName}
                            onChange={(e) => onNameChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border-2 border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 bg-white"
                            placeholder="Nama donatur..."
                          />
                        </div>
                      </div>
                      <button
                        onClick={onClearIuran}
                        className="h-fit px-3 py-1.5 bg-white border border-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase hover:bg-rose-50 transition-colors shadow-sm"
                      >
                        Bersihkan Iuran
                      </button>
                    </div>

                    <div className="p-4 bg-white/50 rounded-xl border border-amber-50">
                      <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-3 text-center">
                        Rekap Kontribusi • {year}
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {MONTH_NAMES.map((bulan) => {
                          const key = `bulan_${bulan.toLowerCase()}`;
                          return (
                            <div key={bulan} className="space-y-1">
                              <label className="text-[10px] font-black text-amber-800 uppercase block text-center tracking-tighter">
                                {bulan.substring(0, 3)}
                              </label>
                              <input
                                type="number"
                                value={editingDonorIuran[key] || 0}
                                onChange={(e) =>
                                  onIuranChange(
                                    key,
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                className="w-full px-1 py-1.5 text-xs text-center border-2 border-amber-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-gray-900 bg-white"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={onCancel}
                      className="flex-1 py-2 text-xs bg-gray-100 text-gray-600 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={onSave}
                      className="flex-1 py-2 text-xs bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-all flex items-center justify-center gap-2"
                    >
                      Update Data
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 sm:gap-2">
                    {MONTH_NAMES.map((bulan) => {
                      const key =
                        `bulan_${bulan.toLowerCase()}` as keyof DonaturTetapIuran;
                      const val = Number(iuran[key]) || 0;
                      const isPaid = val > 0;
                      return (
                        <div
                          key={bulan}
                          className={`relative rounded-lg p-2 transition-all border flex flex-col items-center justify-center ${
                            isPaid
                              ? "bg-teal-50 border-teal-100"
                              : "bg-rose-50/50 border-rose-100/50 opacity-40"
                          }`}
                        >
                          <span
                            className={`text-[10px] uppercase font-black mb-0.5 ${isPaid ? "text-teal-700" : "text-rose-700"}`}
                          >
                            {bulan.substring(0, 3)}
                          </span>
                          <span
                            className={`text-[9px] font-black ${isPaid ? "text-emerald-600" : "text-rose-300"}`}
                          >
                            {isPaid
                              ? formatCurrency(val).replace("Rp", "").trim()
                              : "-"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-slate-200">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                        Total Donasi {year}
                      </p>
                      <p className="text-xl font-black text-emerald-600">
                        {formatCurrency(totalTahun)}
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-gray-400">
                      <Wallet className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useAdmin } from "@/hooks/useAdmin";

export function DonaturTetap() {
  const { canManageDonors } = useAdmin();
  const [donors, setDonors] = useState<Donatur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // CRUD State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDonorName, setNewDonorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States for Card Editing
  const [editingDonorId, setEditingDonorId] = useState<number | null>(null);
  const [editingDonorName, setEditingDonorName] = useState("");
  const [editingDonorIuran, setEditingDonorIuran] = useState<
    Record<string, number>
  >({});

  const exportToPDF = () => {
    if (donors.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add Title
    doc.setFontSize(18);
    doc.text(`Laporan Donatur Tetap - Tahun ${selectedYear}`, 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(
      `Masjid Al Ikhlas - Dicetak pada: ${new Date().toLocaleDateString("id-ID")}`,
      14,
      28,
    );

    const tableColumn = [
      "No",
      "Nama Donatur",
      ...MONTH_NAMES.map((m) => m.substring(0, 3)),
      "Total",
    ];
    const tableRows: (string | number)[][] = [];
    const monthlyTotals = new Array(12).fill(0);
    let grandTotal = 0;

    donors.forEach((donor, index) => {
      const iuran =
        donor.donatur_tetap_iuran?.find((i) => i.tahun === selectedYear) ||
        ({} as DonaturTetapIuran);

      let total = 0;
      const rowData: (string | number)[] = [index + 1, donor.nama];

      MONTH_NAMES.forEach((bulan, i) => {
        const key = `bulan_${bulan.toLowerCase()}` as keyof DonaturTetapIuran;
        const val = Number(iuran[key]) || 0;
        total += val;
        monthlyTotals[i] += val;
        rowData.push(val > 0 ? val.toLocaleString("id-ID") : "-");
      });

      grandTotal += total;
      rowData.push(total.toLocaleString("id-ID"));
      tableRows.push(rowData);
    });

    // Add Summary Row
    const summaryRow: (string | number)[] = [
      "",
      "TOTAL PER BULAN",
      ...monthlyTotals.map((val) =>
        val > 0 ? val.toLocaleString("id-ID") : "-",
      ),
      grandTotal.toLocaleString("id-ID"),
    ];
    tableRows.push(summaryRow);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        halign: "center",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        1: { cellWidth: 40 },
        14: { halign: "right", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        if (data.column.index >= 2 && data.column.index <= 14) {
          data.cell.styles.halign = "right";
        }
        // Bold the last row (Summary Row)
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [240, 253, 244]; // Light emerald bg
          data.cell.styles.textColor = [5, 150, 105]; // Emerald-600
        }
      },
    });

    doc.save(`Donatur_Tetap_${selectedYear}.pdf`);
  };

  const startEditing = (donor: Donatur) => {
    const iuran =
      donor.donatur_tetap_iuran?.find((i) => i.tahun === selectedYear) || {};
    const initialIuran: Record<string, number> = {};
    MONTH_NAMES.forEach((bulan) => {
      const key = `bulan_${bulan.toLowerCase()}` as keyof DonaturTetapIuran;
      initialIuran[key] = (iuran as Record<string, number>)[key] || 0;
    });
    setEditingDonorIuran(initialIuran);
    setEditingDonorName(donor.nama);
    setEditingDonorId(donor.id);
  };

  const handleSaveDonor = async (id: number) => {
    if (!canManageDonors) return;
    setIsSubmitting(true);
    try {
      // 1. Update Nama
      const { error: nameError } = await supabase
        .from("donatur_tetap")
        .update({ nama: editingDonorName.trim() })
        .eq("id", id);
      if (nameError) throw nameError;

      // 2. Upsert Iuran
      const { error: iuranError } = await supabase
        .from("donatur_tetap_iuran")
        .upsert(
          {
            donatur_id: id,
            tahun: selectedYear,
            ...editingDonorIuran,
          },
          { onConflict: "donatur_id,tahun" },
        );
      if (iuranError) throw iuranError;

      setEditingDonorId(null);
      fetchDonors();
    } catch (err) {
      console.error("Error saving donor:", err);
      alert("Gagal menyimpan data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDonor = async (id: number, name: string) => {
    if (!canManageDonors) return;
    if (!window.confirm(`Hapus donatur "${name}" dan semua data iurannya?`))
      return;

    try {
      const { error } = await supabase
        .from("donatur_tetap")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchDonors();
    } catch (err) {
      console.error("Error deleting donor:", err);
      alert("Gagal menghapus donatur");
    }
  };

  const canManageFinance = canManageDonors; // Use RBAC hook instead of hardcoded true

  const fetchDonors = async () => {
    setLoading(true);
    try {
      console.log("DEBUG: Fetching donors with NEW query structure...");
      const { data, error } = await supabase
        .from("donatur_tetap")
        .select(
          `
                    id,
                    nama,
                    donatur_tetap_iuran (*)
                `,
        )
        .order("nama", { ascending: true });

      if (error) {
        console.error("CRITICAL_FETCH_ERROR:", JSON.stringify(error, null, 2));
      } else if (data) {
        console.log("DEBUG: Received Data Sample:", data[0]);
        setDonors(data as unknown as Donatur[]);
      }
    } catch (err) {
      console.error("Unexpected fetch failure:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();

    const channel = supabase
      .channel("donatur_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donatur_tetap" },
        () => fetchDonors(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "donatur_tetap_iuran" },
        () => fetchDonors(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredDonors = donors.filter((d) =>
    d.nama.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredDonors.length / itemsPerPage);
  const paginatedDonors = filteredDonors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  // CRUD Functions
  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorName.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Insert ke donatur_tetap
      const { data: donorData, error: donorError } = await supabase
        .from("donatur_tetap")
        .insert([{ nama: newDonorName.trim() }])
        .select()
        .single();

      if (donorError) throw donorError;

      // 2. Inisialisasi iuran untuk tahun berjalan
      const currentYear = new Date().getFullYear();
      const { error: iuranError } = await supabase
        .from("donatur_tetap_iuran")
        .insert([
          {
            donatur_id: donorData.id,
            tahun: currentYear,
          },
        ]);

      if (iuranError) throw iuranError;

      setIsAddModalOpen(false);
      setNewDonorName("");
      fetchDonors();
    } catch (err) {
      console.error("Error adding donor:", err);
      alert("Gagal menambah donatur");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 sm:space-y-8 px-0 sm:px-2">
      {/* Header Section - Mobile First */}
      <div className="text-center mb-5 px-4 sm:px-2">
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
          Donatur <span className="text-emerald-600">Tetap</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Laporan kontribusi infaq bulanan masjid
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-4 sm:px-2">
        {/* Search Bar - Material Pill */}
        <div className="relative group w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Cari nama..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-5 py-2.5 bg-slate-100/50 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
          />
        </div>

        {/* Year Selector - Dropdown */}
        <div className="relative w-full sm:w-32">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-5 py-2.5 bg-slate-100/50 border-none rounded-full text-[11px] sm:text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white cursor-pointer appearance-none pr-10"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto">
          {canManageDonors && (
            <>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-full text-xs font-bold shadow-md hover:bg-slate-900 transition-all active:scale-95 flex-1 sm:flex-initial justify-center"
              >
                <FileText className="w-4 h-4" />
                EXPORT PDF
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-bold shadow-md hover:bg-emerald-700 transition-all active:scale-95 flex-1 sm:flex-initial justify-center"
              >
                <Plus className="w-4 h-4" />
                TAMBAH
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add Donor Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-slate-900">
                  Tambah Donatur Baru
                </h4>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddDonor} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={newDonorName}
                    onChange={(e) => setNewDonorName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-200 transition-all text-sm"
                    placeholder="Masukkan nama donatur..."
                    required
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newDonorName.trim()}
                    className="flex-1 px-6 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    {isSubmitting ? "MENYIMPAN..." : "SIMPAN DATA"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* List Container - Card Style */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-200 mb-6">
          {loading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse font-medium">
              Memuat data donatur...
            </div>
          ) : paginatedDonors.length > 0 ? (
            paginatedDonors.map((donor, index) => (
              <DonaturTetapCard
                key={donor.id}
                donor={donor}
                year={selectedYear}
                index={index}
                isOpen={expandedId === donor.id}
                isEditing={editingDonorId === donor.id}
                editingDonorName={editingDonorName}
                editingDonorIuran={editingDonorIuran}
                canManage={canManageFinance}
                onToggle={() =>
                  setExpandedId(expandedId === donor.id ? null : donor.id)
                }
                onDelete={handleDeleteDonor}
                onEdit={() => startEditing(donor)}
                onNameChange={setEditingDonorName}
                onIuranChange={(key, val) =>
                  setEditingDonorIuran({ ...editingDonorIuran, [key]: val })
                }
                onSave={() => handleSaveDonor(donor.id)}
                onCancel={() => setEditingDonorId(null)}
                onClearIuran={() => {
                  const reset: Record<string, number> = {};
                  MONTH_NAMES.forEach(
                    (b) => (reset[`bulan_${b.toLowerCase()}`] = 0),
                  );
                  setEditingDonorIuran(reset);
                }}
                formatCurrency={formatCurrency}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white">
              <p className="text-gray-500 font-bold">
                Tidak ada donatur ditemukan
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                setExpandedId(null);
              }}
              disabled={currentPage === 1}
              className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-500">
              Halaman <span className="text-emerald-600">{currentPage}</span>{" "}
              dari {totalPages}
            </span>
            <button
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                setExpandedId(null);
              }}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-4 sm:px-0">
        <div className="bg-[#E8F0FE] rounded-md sm:rounded-md p-6 sm:p-8 text-blue-900 shadow-sm">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-blue-600/70">
              Total Kolektif {selectedYear}
            </p>
            <h4 className="text-2xl sm:text-3xl font-medium tracking-tight">
              {formatCurrency(
                donors.reduce((acc, d) => {
                  const iuranYear = d.donatur_tetap_iuran?.find(
                    (ir) => ir.tahun === selectedYear,
                  );
                  const sum = iuranYear
                    ? MONTH_COLUMNS.reduce(
                        (s, col) =>
                          s +
                          ((iuranYear[
                            col as keyof DonaturTetapIuran
                          ] as number) || 0),
                        0,
                      )
                    : 0;
                  return acc + sum;
                }, 0),
              )}
            </h4>
          </div>
        </div>
        <div className="bg-[#F8F9FA] rounded-md sm:rounded-md p-6 sm:p-8 text-slate-900 border border-slate-200 shadow-sm">
          <div className="flex flex-col gap-0.5 sm:gap-1">
            <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-500">
              Persentase Keaktifan
            </p>
            <div className="flex items-end gap-2 sm:gap-3">
              <h4 className="text-2xl sm:text-3xl font-medium tracking-tight">
                94.2%
              </h4>
              <div className="flex items-center gap-1 text-emerald-600 mb-1">
                <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-[10px] sm:text-xs font-bold">+2.1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
