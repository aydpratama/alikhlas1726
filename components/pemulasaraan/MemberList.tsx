"use client";

import { useState, useEffect } from "react";
import { Member } from "@/types/membership";
import { FamilyMember } from "@/components/FamilyCard";
import { MemberDialog } from "./MemberDialog";
import { FamilyCard } from "@/components/FamilyCard";
import { ExportDuesDialog } from "./ExportDuesDialog";
import {
  Search,
  UserPlus,
  FileText,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";

interface MemberListViewProps {
  members: Member[];
  dues: any[];
  isAdmin: boolean;
  selectedYear: number;
  onAddMember: () => void;
  onEditMember: (m: Member) => void;
  onDeleteMember: (id: number) => void;
  onDataChange: () => void;
}

export function MemberListView({
  members,
  dues,
  isAdmin,
  selectedYear,
  onAddMember,
  onEditMember,
  onDeleteMember,
  onDataChange,
}: MemberListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [filterJenisAnggota, setFilterJenisAnggota] = useState<string>("");
  const [filterRt, setFilterRt] = useState<string>("");
  const [filterRw, setFilterRw] = useState<string>("");
  const itemsPerPage = 5;

  const hasActiveFilters = filterJenisAnggota || filterRt || filterRw;

  const uniqueJenisAnggota = Array.from(
    new Set(members.map((m) => m.jenis_anggota)),
  ).sort();
  const uniqueRtValues = Array.from(
    new Set(
      members.map((m) => m.rt).filter((rt): rt is number => rt !== undefined),
    ),
  ).sort((a, b) => a - b);
  const uniqueRwValues = Array.from(
    new Set(
      members.map((m) => m.rw).filter((rw): rw is number => rw !== undefined),
    ),
  ).sort((a, b) => a - b);

  const resetFilters = () => {
    setFilterJenisAnggota("");
    setFilterRt("");
    setFilterRw("");
    setSearchTerm("");
  };

  const filteredMembers = members.filter((member) => {
    const matchSearch =
      member.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.no_anggota.toLowerCase().includes(searchTerm.toLowerCase());
    const matchJenisAnggota =
      !filterJenisAnggota || member.jenis_anggota === filterJenisAnggota;
    const matchRt = !filterRt || member.rt === parseInt(filterRt);
    const matchRw = !filterRw || member.rw === parseInt(filterRw);
    return matchSearch && matchJenisAnggota && matchRt && matchRw;
  });

  // Group members by Family
  const families = Object.values(
    filteredMembers.reduce(
      (acc, member) => {
        const familyId = member.no_anggota.split(".")[0];
        if (!acc[familyId]) {
          acc[familyId] = {
            id: familyId,
            members: [],
          };
        }
        acc[familyId].members.push(member);
        return acc;
      },
      {} as Record<string, { id: string; members: Member[] }>,
    ),
  )
    .sort((a, b) => {
      const extractNumber = (noAnggota: string) => {
        const match = noAnggota.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      };
      return extractNumber(a.id) - extractNumber(b.id);
    })
    .map((family) => {
      const normalizeRelation = (rel?: string) =>
        (rel || "").trim().toLowerCase();
      const getRelationRank = (rel?: string) => {
        const r = normalizeRelation(rel);
        if (r === "kepala keluarga" || r.includes("kepala")) return 1;
        if (r === "istri") return 2;
        if (r === "anak") return 3;
        if (r === "cucu") return 4;
        return 99;
      };

      return {
        ...family,
        members: [...family.members].sort((a, b) => {
          const ra = getRelationRank(a.hubungan_keluarga);
          const rb = getRelationRank(b.hubungan_keluarga);
          return ra - rb;
        }),
      };
    });

  const totalPages = Math.ceil(families.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedFamilies = families.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterJenisAnggota, filterRt, filterRw]);

  const Badge = ({
    label,
    onRemove,
  }: {
    label: string;
    onRemove: () => void;
  }) => (
    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100/50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200/50 group transition-all hover:bg-emerald-100">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        {/* Row 1: Search & Actions */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari anggota berdasarkan nama atau nomor..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full lg:w-auto">
            {isAdmin && (
              <button
                onClick={() => setIsExportDialogOpen(true)}
                className="w-full lg:w-auto flex items-center justify-center gap-2.5 px-6 h-11 sm:h-10 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-200 transition-all active:scale-95 shadow-sm"
              >
                <FileDown className="w-4 h-4" />
                <span className="whitespace-nowrap">Export PDF</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Combined Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 pt-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-slate-400 min-w-fit">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Filter:
            </span>
          </div>

          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-2 flex-1">
            <select
              value={filterRw}
              onChange={(e) => setFilterRw(e.target.value)}
              className="w-full md:w-auto px-3 h-11 sm:h-9 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
            >
              <option value="">RW: Semua</option>
              {uniqueRwValues.map((rw) => (
                <option key={rw} value={rw}>
                  RW {rw}
                </option>
              ))}
            </select>

            <select
              value={filterRt}
              onChange={(e) => setFilterRt(e.target.value)}
              className="w-full md:w-auto px-3 h-11 sm:h-9 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
            >
              <option value="">RT: Semua</option>
              {uniqueRtValues.map((rt) => (
                <option key={rt} value={rt}>
                  RT {rt}
                </option>
              ))}
            </select>

            <select
              value={filterJenisAnggota}
              onChange={(e) => setFilterJenisAnggota(e.target.value)}
              className="col-span-2 md:w-auto px-3 h-11 sm:h-9 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer transition-all"
            >
              <option value="">Jenis Anggota: Semua</option>
              {uniqueJenisAnggota.map((jenis) => (
                <option key={jenis} value={jenis}>
                  {jenis}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="col-span-2 md:w-auto flex items-center justify-center gap-2 px-3 h-11 sm:h-9 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg hover:bg-rose-100 hover:border-rose-200 transition-all active:scale-95"
              >
                <RefreshCw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Filter Badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              Aktif:
            </span>
            <div className="flex flex-wrap gap-2">
              {filterRw && (
                <Badge
                  label={`RW ${filterRw}`}
                  onRemove={() => setFilterRw("")}
                />
              )}
              {filterRt && (
                <Badge
                  label={`RT ${filterRt}`}
                  onRemove={() => setFilterRt("")}
                />
              )}
              {filterJenisAnggota && (
                <Badge
                  label={filterJenisAnggota}
                  onRemove={() => setFilterJenisAnggota("")}
                />
              )}
            </div>
            <span className="text-[10px] text-emerald-600/70 ml-auto font-medium">
              Menampilkan {filteredMembers.length} anggota
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {displayedFamilies.map((family) => (
          <FamilyCard
            key={family.id}
            members={family.members}
            kartuList={dues.filter((d) =>
              family.members.some((m) => m.id === d.id_anggota),
            )}
            selectedYear={selectedYear}
            isAdmin={isAdmin}
            onEditMember={(m) => onEditMember(m as Member)}
            onDeleteMember={onDeleteMember}
            onDataChange={onDataChange}
            onAddMember={onAddMember} // Or specific add to family logic if needed
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <span className="text-sm text-slate-600">
            Halaman {currentPage} dari {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 h-11 sm:h-10 text-sm font-medium rounded-full border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Sebelumnya</span>
            </button>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 h-11 sm:h-10 text-sm font-medium rounded-full border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-slate-200"
            >
              <span className="hidden xs:inline">Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ExportDuesDialog
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        members={filteredMembers}
        dues={dues}
        defaultYear={selectedYear}
        activeFilters={{
          jenisAnggota: filterJenisAnggota,
          rt: filterRt,
          rw: filterRw,
          searchTerm: searchTerm,
        }}
      />
    </div>
  );
}
