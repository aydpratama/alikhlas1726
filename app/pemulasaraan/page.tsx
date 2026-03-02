"use client";

import { Header } from "@/components/Header";
import { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useMembers } from "@/hooks/pemulasaraan/useMembers";
import { useDues } from "@/hooks/pemulasaraan/useDues";
import { supabase } from "@/lib/supabase";
import { InfoView } from "@/components/pemulasaraan/PemulasaraanInfo";
import { MemberListView } from "@/components/pemulasaraan/MemberList";
import { ReportView } from "@/components/pemulasaraan/Laporan";
import { MemberDialog } from "@/components/pemulasaraan/MemberDialog";
import { OthersView } from "@/components/pemulasaraan/Lainlain";
import { RegistrationDialog } from "@/components/RegistrationDialog";
import { FamilyCard, FamilyMember } from "@/components/FamilyCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileText,
  Info as InfoIcon,
  LayoutGrid,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { toTitleCase } from "@/lib/utils";

const BASE_START_YEAR = 2020;
const BASE_END_YEAR = 2026;

const buildDefaultYears = () => {
  const currentYear = new Date().getFullYear();
  const maxYear = Math.max(BASE_END_YEAR, currentYear);
  return Array.from(
    { length: maxYear - BASE_START_YEAR + 1 },
    (_, idx) => BASE_START_YEAR + idx,
  );
};

const normalizeYears = (years: number[]) =>
  Array.from(
    new Set(
      years.filter(
        (year) =>
          Number.isInteger(year) && year >= BASE_START_YEAR && year <= 3000,
      ),
    ),
  ).sort((a, b) => a - b);

export default function PemulasaraanPage() {
  const {
    isSuperAdmin,
    isMember,
    familyNo,
    isLoading: isAdminLoading,
    userEmail,
    profile,
    canManageIuranPemulasaraan,
  } = useAdmin();
  const isIuranOnly = profile?.peran === "iuran";
  const [activeTab, setActiveTab] = useState(isMember ? "my-card" : "info");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] =
    useState<number[]>(buildDefaultYears);
  const [isAddingYear, setIsAddingYear] = useState(false);
  const [hasSetInitialTab, setHasSetInitialTab] = useState(false);

  // Set default tab for member when loaded
  useEffect(() => {
    if (isMember && !hasSetInitialTab) {
      setActiveTab("my-card");
      setHasSetInitialTab(true);
    }
  }, [isMember, hasSetInitialTab]);

  const fetchAvailableYears = useCallback(async () => {
    const [rpcRes, duesRes] = await Promise.all([
      (supabase as any).rpc("ambil_tahun_tersedia"),
      (supabase.from("view_rekap_iuran_tahunan") as any).select("tahun"),
    ]);

    const rpcYears = (rpcRes.data || [])
      .map((item: { tahun?: number }) => Number(item.tahun))
      .filter((year: number) => Number.isInteger(year));
    const duesYears = (duesRes.data || [])
      .map((item: { tahun?: number }) => Number(item.tahun))
      .filter((year: number) => Number.isInteger(year));

    return normalizeYears([...buildDefaultYears(), ...rpcYears, ...duesYears]);
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadYears = async () => {
      const years = await fetchAvailableYears();
      if (!mounted || years.length === 0) return;
      setAvailableYears(years);
      setSelectedYear((prev) =>
        years.includes(prev) ? prev : Math.max(...years),
      );
    };
    loadYears();
    return () => {
      mounted = false;
    };
  }, [fetchAvailableYears]);

  // Hooks
  const {
    members,
    isLoading: isMembersLoading,
    addMember,
    updateMember,
    deleteMember,
    mutate: mutateMembers,
  } = useMembers();
  const { dues, updatePayment, mutate: mutateDues } = useDues(selectedYear);

  // Dialog States
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] =
    useState(false);

  // Handlers
  const handleAddMember = () => {
    setEditingMember(null);
    setIsMemberDialogOpen(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setIsMemberDialogOpen(true);
  };

  const handleMemberDialogSubmit = async (data: Omit<FamilyMember, "id">) => {
    if (editingMember && editingMember.id) {
      await updateMember(editingMember.id, data);
    } else {
      await addMember(data);
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus anggota ini?")) {
      await deleteMember(id);
    }
  };

  // Tab Content Component
  const renderContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <InfoView onRegister={() => setIsRegistrationDialogOpen(true)} />
        );
      case "my-card":
        if (isAdminLoading || isMembersLoading)
          return (
            <div className="p-12 text-center text-gray-400 font-bold italic animate-pulse">
              Memuat data kartu keluarga...
            </div>
          );
        if (!isMember || !familyNo)
          return (
            <div className="p-8 text-center text-gray-500 font-bold">
              Akses Dibatasi
            </div>
          );

        // Find family members based on familyNo (e.g. 001/PEM/2026.01)
        // Everything before the dot is the family ID
        const familyPrefix = familyNo.split(".")[0];
        const familyMembers = members.filter((m) =>
          m.no_anggota.startsWith(familyPrefix),
        );
        const familyDues = dues.filter((d) =>
          familyMembers.some((m) => m.id === d.id_anggota),
        );

        if (familyMembers.length === 0) {
          return (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-emerald-200" />
              <p className="text-gray-500 font-bold">
                Data keluarga tidak ditemukan.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Hubungi pengurus untuk sinkronisasi email Anda.
              </p>
            </div>
          );
        }

        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-200">
              <h3 className="text-lg font-bold !text-white">
                Halo,{" "}
                <span className="!text-white">
                  {toTitleCase(familyMembers[0].nama_lengkap)}
                </span>
              </h3>
              <p className="text-emerald-50 text-sm">
                Berikut adalah kartu iuran pemulasaraan keluarga Anda.
              </p>
            </div>
            <FamilyCard
              members={familyMembers}
              kartuList={familyDues}
              selectedYear={selectedYear}
              isAdmin={false} // Member can't edit
            />
          </div>
        );
      case "member":
        if (!isSuperAdmin && !canManageIuranPemulasaraan)
          return (
            <div className="p-8 text-center text-gray-500 font-bold">
              Akses Dibatasi
            </div>
          );

        return (
          <MemberListView
            members={members}
            dues={dues}
            isAdmin={isSuperAdmin || canManageIuranPemulasaraan}
            isIuranOnly={isIuranOnly}
            selectedYear={selectedYear}
            onAddMember={handleAddMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            onDataChange={() => {
              mutateMembers();
              mutateDues();
            }}
          />
        );
      case "laporan":
        if (!isSuperAdmin)
          return (
            <div className="p-8 text-center text-gray-500 font-bold">
              Akses Dibatasi
            </div>
          );
        return (
          <ReportView year={selectedYear} duesData={dues} members={members} />
        );
      case "lainnya":
        const isImamOrMarbot =
          profile?.peran === "imam" || profile?.peran === "marbot";
        if (!isSuperAdmin && !isImamOrMarbot) return null;
        return (
          <OthersView
            isAdmin={isSuperAdmin}
            isSuperAdmin={isSuperAdmin}
            profile={profile}
            onDataChange={() => {
              mutateMembers();
              mutateDues();
            }}
          />
        );
      default:
        return null;
    }
  };

  const handleAddYear = async () => {
    if (!isSuperAdmin || isAddingYear) return;
    const maxYear =
      availableYears.length > 0
        ? Math.max(...availableYears)
        : new Date().getFullYear();
    const nextYear = maxYear + 1;

    setIsAddingYear(true);
    const umumMembers = members.filter(
      (m) => m.id && (m.jenis_anggota || "").trim().toLowerCase() === "umum",
    );
    const chunkSize = 20;
    let error: any = null;

    for (let i = 0; i < umumMembers.length; i += chunkSize) {
      const chunk = umumMembers.slice(i, i + chunkSize);
      const results = await Promise.all(
        chunk.map(async (member) =>
          (supabase as any).rpc("inisiasi_catatan_iuran_anggota", {
            p_id_anggota: member.id,
            p_tahun: nextYear,
          }),
        ),
      );

      const firstFatal = results.find((res: any) => {
        if (!res?.error) return false;
        const msg = String(res.error.message || "").toLowerCase();
        return !(
          msg.includes("duplicate") ||
          msg.includes("already exists") ||
          msg.includes("unique")
        );
      });

      if (firstFatal) {
        error = firstFatal.error;
        break;
      }
    }
    setIsAddingYear(false);

    if (error) {
      console.error("Gagal menambah tahun iuran di Supabase:", error);
      alert(
        `Gagal menambah tahun ${nextYear}: ${error.message || "Unknown error"}`,
      );
      return;
    }
    const years = await fetchAvailableYears();
    if (years.length > 0) {
      setAvailableYears(normalizeYears([...years, nextYear]));
    } else {
      setAvailableYears((prev) => normalizeYears([...prev, nextYear]));
    }
    setSelectedYear(nextYear);
    mutateDues();
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      {/* Banner Section */}
      <div className="container max-w-5xl md:max-w-3xl mx-auto px-4 mt-6">
        <div className="relative rounded-2xl overflow-hidden shadow-sm">
          <Image
            src="/ayo_shalat.png"
            alt="Banner Pemulasaraan"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto"
            priority
          />
        </div>
      </div>

      {/* Navigation & Header Section (Non-sticky) */}
      <div className="container mx-auto px-4 mt-10 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Pemulasaraan
            </h1>
            <p className="text-gray-500 font-medium tracking-wide">
              Layanan Pengurusan Jenazah Al-Ikhlas
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Year Selector Dropdown (Only for Member & Laporan) */}
            {(activeTab === "member" ||
              activeTab === "laporan" ||
              activeTab === "my-card") && (
              <div className="flex items-center gap-2 bg-white border-2 border-emerald-100 px-4 py-2.5 rounded-2xl group hover:border-emerald-500 transition-all shadow-sm">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Periode :
                </span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-sm font-black text-emerald-700 outline-none cursor-pointer pr-1"
                >
                  {availableYears.map((year) => (
                    <option
                      key={year}
                      value={year}
                      className="font-sans text-gray-900"
                    >
                      Tahun {year}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {isSuperAdmin &&
              (activeTab === "member" ||
                activeTab === "laporan" ||
                activeTab === "my-card") && (
                <button
                  type="button"
                  onClick={handleAddYear}
                  disabled={isAddingYear}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white border-2 border-emerald-100 rounded-2xl text-xs font-black text-emerald-700 hover:border-emerald-500 transition-all shadow-sm"
                  title="Tambah periode tahun berikutnya"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingYear ? "Menyimpan..." : "Tambah Tahun"}
                </button>
              )}
          </div>
        </div>

        {/* Tab Selection Toggle */}
        <div className="flex justify-center md:justify-start">
          <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-full flex items-center gap-1 w-full sm:w-auto overflow-x-auto no-scrollbar border-2 border-emerald-100/50 shadow-xl shadow-emerald-900/5">
            {[
              { id: "info", label: "Informasi", icon: InfoIcon },
              ...(isMember
                ? [{ id: "my-card", label: "Kartu Saya", icon: FileText }]
                : []),
              ...(isSuperAdmin ||
              canManageIuranPemulasaraan ||
              profile?.peran === "imam" ||
              profile?.peran === "marbot"
                ? [
                    ...(isSuperAdmin || canManageIuranPemulasaraan
                      ? [
                          { id: "member", label: "Anggota", icon: Users },
                          ...(isSuperAdmin
                            ? [
                                {
                                  id: "laporan",
                                  label: "Laporan",
                                  icon: FileText,
                                },
                              ]
                            : []),
                        ]
                      : []),
                    ...(!isIuranOnly
                      ? [{ id: "lainnya", label: "Lainnya", icon: LayoutGrid }]
                      : []),
                  ]
                : []),
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 whitespace-nowrap text-sm font-bold tracking-tight ${
                    active
                      ? "text-white"
                      : "text-gray-600 hover:text-emerald-800"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTabSlider"
                      className="absolute inset-0 bg-emerald-600 rounded-full shadow-md"
                      transition={{
                        type: "spring",
                        bounce: 0.1,
                        duration: 0.5,
                      }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <tab.icon
                      className={`w-4 h-4 transition-transform duration-300 ${active ? "scale-105" : ""}`}
                    />
                    <span className="font-bold">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global User Registration Dialog */}
      <RegistrationDialog
        isOpen={isRegistrationDialogOpen}
        onClose={() => setIsRegistrationDialogOpen(false)}
      />

      {/* Admin Member Dialog */}
      <MemberDialog
        isOpen={isMemberDialogOpen}
        onClose={() => setIsMemberDialogOpen(false)}
        onSubmit={handleMemberDialogSubmit}
        editingMember={editingMember}
      />
    </div>
  );
}
