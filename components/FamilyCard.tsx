"use client";

import { useState } from "react";
import { Keluarga } from "@/types/membership";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Pencil,
  CheckCircle,
  X,
  Trash2,
  Users,
  UserPlus,
  FileText,
  FileDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { useToast } from "@/components/Toast";
import { toTitleCase } from "@/lib/utils";

export type FamilyMember = {
  id?: number;
  no_anggota: string;
  nama_lengkap: string;
  jenis_anggota: string;
  hubungan_keluarga: string;
  tanggal_keanggotaan: string;
  tanggal_keterangan?: string | null;
  pendaftaran: number;
  alamat?: string;
  rt?: number;
  rw?: number;
  status?: string;
  no_telepon?: string;
};

type KartuIuran = {
  id?: number; // Optional now as view might not have single ID
  id_anggota: number;
  tahun: number;
  [key: string]: string | number | null | undefined;
};

interface FamilyCardProps {
  keluarga?: Keluarga;
  members: FamilyMember[];
  kartuList: Array<KartuIuran>;
  selectedYear?: number;
  isAdmin?: boolean;
  onDataChange?: () => void; // Callback to refresh data after CRUD
  onEditMember?: (member: FamilyMember) => void; // Callback for editing member
  onDeleteMember?: (memberId: number) => void; // Callback for deleting member
  onAddMember?: () => void; // Callback for adding new member
}

const MONTHS = [
  { key: "bulan_januari", label: "Jan", dateKey: "tanggal_bayar_januari" },
  { key: "bulan_februari", label: "Feb", dateKey: "tanggal_bayar_februari" },
  { key: "bulan_maret", label: "Mac", dateKey: "tanggal_bayar_maret" },
  { key: "bulan_april", label: "Apr", dateKey: "tanggal_bayar_april" },
  { key: "bulan_mei", label: "Mei", dateKey: "tanggal_bayar_mei" },
  { key: "bulan_juni", label: "Jun", dateKey: "tanggal_bayar_juni" },
  { key: "bulan_juli", label: "Jul", dateKey: "tanggal_bayar_juli" },
  { key: "bulan_agustus", label: "Agt", dateKey: "tanggal_bayar_agustus" },
  { key: "bulan_september", label: "Sep", dateKey: "tanggal_bayar_september" },
  { key: "bulan_oktober", label: "Okt", dateKey: "tanggal_bayar_oktober" },
  { key: "bulan_november", label: "Nov", dateKey: "tanggal_bayar_november" },
  { key: "bulan_desember", label: "Des", dateKey: "tanggal_bayar_desember" },
];

export function FamilyCard({
  keluarga,
  members,
  kartuList,
  selectedYear,
  isAdmin = false,
  onDataChange,
  onEditMember,
  onDeleteMember,
  onAddMember,
}: FamilyCardProps) {
  // State for editing iuran
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingKartu, setEditingKartu] = useState<Record<
    string,
    number
  > | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const normalizeRelation = (rel?: string) => (rel || "").trim().toLowerCase();
  const getRelationRank = (rel?: string) => {
    const r = normalizeRelation(rel);
    if (r === "kepala keluarga" || r.includes("kepala")) return 1;
    if (r === "istri") return 2;
    if (r === "anak") return 3;
    if (r === "cucu") return 4;
    return 99;
  };

  const sortedMembers = [...members].sort((a, b) => {
    const ra = getRelationRank(a.hubungan_keluarga);
    const rb = getRelationRank(b.hubungan_keluarga);
    if (ra !== rb) return ra - rb;
    return (a.nama_lengkap || "").localeCompare(b.nama_lengkap || "", "id-ID");
  });

  // Use first member (kepala keluarga) if keluarga prop not provided
  const familyData =
    keluarga ||
    (sortedMembers[0]
      ? {
        no_anggota: sortedMembers[0].no_anggota.split(".")[0],
        alamat: sortedMembers[0].alamat || "",
        rt: sortedMembers[0].rt || 0,
        rw: sortedMembers[0].rw || 0,
      }
      : null);

  if (!familyData) return null;

  // Start editing iuran for a member
  const startEditingIuran = (
    member: FamilyMember,
    kartu: KartuIuran | undefined,
  ) => {
    if (!member.id) return;
    setEditingMemberId(member.id);

    // Initialize with existing kartu data or zeros
    const initialData: Record<string, number> = {};
    MONTHS.forEach((m) => {
      initialData[m.key] = kartu
        ? Number(kartu[m.key as keyof typeof kartu]) || 0
        : 0;
    });
    if (kartu?.id) {
      initialData.id = kartu.id;
    }
    setEditingKartu(initialData);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMemberId(null);
    setEditingKartu(null);
  };

  // Save iuran changes using RPC
  const saveIuran = async (memberId: number) => {
    if (!editingKartu) return;

    setIsSaving(true);
    const year = selectedYear || new Date().getFullYear();

    try {
      // Update each month using RPC
      const promises = MONTHS.map(async (month, index) => {
        const monthNumber = index + 1;
        const newValue =
          editingKartu[month.key as keyof typeof editingKartu] || 0;

        const { error } = await (supabase as any).rpc("simpan_pembayaran_iuran", {
          p_id_anggota: memberId,
          p_tahun: year,
          p_bulan_ke: monthNumber,
          p_nominal: newValue,
        });

        if (error) {
          console.error(`Error saving month ${monthNumber}:`, error);
          throw error;
        }
      });

      await Promise.all(promises);

      toast.success("Iuran berhasil disimpan!");
      cancelEditing();
      // Refresh parent data to show updated values
      if (onDataChange) {
        await onDataChange();
      }
    } catch (err) {
      console.error("Error saving iuran:", err);
      toast.error("Gagal menyimpan iuran. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  // Update a month's value while editing
  const updateMonthValue = (monthKey: string, value: number) => {
    if (!editingKartu) return;
    setEditingKartu({ ...editingKartu, [monthKey]: value });
  };

  // Quick set all months
  const setAllMonths = (value: number) => {
    if (!editingKartu) return;
    const updated = { ...editingKartu };
    MONTHS.forEach((m) => {
      updated[m.key] = value;
    });
    setEditingKartu(updated);
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "Rp. 0";
    return `Rp. ${amount.toLocaleString("id-ID")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getBadgeColor = (jenisAnggota: string) => {
    const normalized = jenisAnggota?.trim().toLowerCase();

    switch (normalized) {
      case "tetap":
        return "bg-teal-100 text-teal-700";
      case "tetap tambahan":
        return "bg-teal-100 text-teal-700";
      case "umum":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const createMemberId = (member: FamilyMember) => {
    return `${member.no_anggota}-${member.nama_lengkap.replace(/\s+/g, "-")}`;
  };

  const _toStatusText = (raw: unknown) => {
    const s = String(raw ?? "").toLowerCase();
    if (["lunas", "1", "true", "ya", "yes"].includes(s)) return "Lunas";
    if (
      ["belum lunas", "belum", "0", "false", "tidak", "no", "unpaid"].includes(
        s,
      )
    )
      return "Belum Lunas";
    return raw == null || s === "" ? "-" : String(raw);
  };

  const handleExportExcel = () => {
    try {
      const year =
        selectedYear ||
        (kartuList && kartuList[0] && kartuList[0].tahun) ||
        new Date().getFullYear();

      const MONTH_LABELS_EN = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const kepalaKeluarga =
        members.find((m) =>
          m.hubungan_keluarga?.toLowerCase().includes("kepala"),
        ) || members[0];

      // 1. Prepare Meta Data (Headers)
      const metaRows = [
        ["KARTU IURAN PEMULASARAAN AL IKHLAS"],
        ["TAHUN :", year],
        ["NO Anggota :", familyData.no_anggota],
        ["Nama Kepala Keluarga :", kepalaKeluarga?.nama_lengkap || ""],
        ["Alamat :", familyData.alamat || ""],
        [], // empty row for spacing
      ];

      // 2. Table Headers
      const tableHeaders = ["No", "Nama", "Pendaftaran", ...MONTH_LABELS_EN];

      // 3. Member Data
      const hasUmum = members.some(
        (m) => m.jenis_anggota?.trim().toLowerCase() === "umum",
      );
      const hasTetapLike = members.some((m) => {
        const t = m.jenis_anggota?.trim().toLowerCase();
        return t === "tetap" || t === "tetap tambahan";
      });

      const targetMembers = sortedMembers.filter((m) => {
        const t = m.jenis_anggota?.trim().toLowerCase();
        if (hasUmum && !hasTetapLike) return t === "umum";
        if (!hasUmum && hasTetapLike) return t === "tetap" || t === "tetap tambahan";
        return true;
      });

      const memberRows = targetMembers.map((m, index) => {
        const jenis = m.jenis_anggota?.trim().toLowerCase();
        const isUmumMember = jenis === "umum";
        const kartu = isUmumMember
          ? kartuList.find((k) => k.id_anggota === (m.id ?? -1))
          : undefined;

        const monthValues = MONTHS.map(({ key }) => {
          if (!isUmumMember || !kartu) return "";
          const nominal = Number(kartu[key]) || 0;
          return nominal === 0 ? "" : nominal;
        });

        return [
          index + 1,
          m.nama_lengkap,
          m.pendaftaran || 0,
          ...monthValues,
        ];
      });

      // 4. Footer Data
      const today = new Date();
      const formattedDate = new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(today);

      const footerRows = [
        [], // spacing
        ["Note"],
        [], // spacing
        ["", "", "", "", "", "", "", "", "", "", `Bekasi, ${formattedDate}`],
        ["", "", "", "", "", "", "", "", "", "", "Koordinator Bidang Pemulasaraan"],
        [], // spacing
        [], // spacing
        ["", "", "", "", "", "", "", "", "", "", "Kamiso"],
      ];

      // 5. Create Workbook & Sheet
      const worksheet = XLSX.utils.aoa_to_sheet([
        ...metaRows,
        tableHeaders,
        ...memberRows,
        ...footerRows
      ]);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Kartu Iuran");

      // 6. Save File
      XLSX.writeFile(workbook, `Kartu_Iuran_${familyData.no_anggota}_${year}.xlsx`);
    } catch (e) {
      console.error("Error exporting Excel:", e);
    }
  };

  const handleExportPDF = () => {
    try {
      const year =
        selectedYear ||
        (kartuList && kartuList[0] && kartuList[0].tahun) ||
        new Date().getFullYear();
      // Gunakan logika pemilihan anggota yang sama dengan CSV
      const hasUmum = members.some(
        (m) => m.jenis_anggota?.trim().toLowerCase() === "umum",
      );
      const hasTetapLike = members.some((m) => {
        const t = m.jenis_anggota?.trim().toLowerCase();
        return t === "tetap" || t === "tetap tambahan";
      });

      const targetMembers = members.filter((m) => {
        const t = m.jenis_anggota?.trim().toLowerCase();
        if (hasUmum && !hasTetapLike) {
          return t === "umum";
        }
        if (!hasUmum && hasTetapLike) {
          return t === "tetap" || t === "tetap tambahan";
        }
        return true;
      });

      const kepalaKeluarga =
        members.find((m) =>
          m.hubungan_keluarga?.toLowerCase().includes("kepala"),
        ) || members[0];

      const monthLabels = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const bodyRows = targetMembers
        .map((m, index) => {
          const jenis = m.jenis_anggota?.trim().toLowerCase();
          const isUmumMember = jenis === "umum";
          const kartu = isUmumMember
            ? kartuList.find((k) => k.id_anggota === (m.id ?? -1))
            : undefined;

          const monthCells = MONTHS.map(({ key }) => {
            if (!isUmumMember || !kartu) return "";
            const raw = kartu[key];
            const nominal = Number(raw) || 0;
            return nominal === 0 ? "" : nominal.toLocaleString("id-ID");
          })
            .map(
              (v) =>
                `<td style="padding:6px;border:1px solid #ddd;text-align:center;">${v || ""
                }</td>`,
            )
            .join("");

          return `
            <tr>
              <td style="padding:6px;border:1px solid #ddd;text-align:center;">${index + 1
            }</td>
              <td style="padding:6px;border:1px solid #ddd;">${m.nama_lengkap
            }</td>
              <td style="padding:6px;border:1px solid #ddd;text-align:right;">${m.pendaftaran ? m.pendaftaran.toLocaleString("id-ID") : "0"
            }</td>
              ${monthCells}
            </tr>
          `;
        })
        .join("");

      const headerRow = `
        <tr style="background:#f3f4f6;">
          <th style="padding:6px;border:1px solid #ddd;">No</th>
          <th style="padding:6px;border:1px solid #ddd;">Nama</th>
          <th style="padding:6px;border:1px solid #ddd;">Pendaftaran</th>
          ${monthLabels
          .map(
            (ml) =>
              `<th style="padding:6px;border:1px solid #ddd;text-align:center;">${ml}</th>`,
          )
          .join("")}
        </tr>
      `;

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Kartu Iuran ${familyData.no_anggota} - ${year}</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; padding: 24px; color: #111; line-height: 1.5; }
              .header { margin-bottom: 24px; border-bottom: 2px solid #059669; padding-bottom: 12px; }
              h1 { font-size: 20px; margin: 0 0 12px; color: #059669; font-weight: bold; text-transform: uppercase; }
              .info-grid { display: flex; flex-direction: column; gap: 4px; font-size: 13px; color: #374151; }
              .info-row { display: flex; }
              .info-label { width: 160px; font-weight: bold; color: #6b7280; }
              .info-value { font-weight: 600; color: #111; }
              table { border-collapse: collapse; width: 100%; font-size: 11px; margin-top: 10px; }
              th { background: #f3f4f6; font-weight: bold; text-transform: uppercase; letter-spacing: 0.025em; }
              th, td { border: 1px solid #d1d5db; padding: 8px 6px; text-align: left; }
              .footer-section { margin-top: 40px; display: flex; justify-content: flex-end; }
              .signature-block { text-align: center; min-width: 250px; font-size: 12px; }
              @media print { 
                body { padding: 0; }
                @page { size: A4 landscape; margin: 10mm; } 
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>KARTU IURAN PEMULASARAAN AL IKHLAS</h1>
              <div class="info-grid">
                <div class="info-row">
                  <span class="info-label">TAHUN:</span>
                  <span class="info-value">${year}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">NO Anggota:</span>
                  <span class="info-value">${familyData.no_anggota}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Nama Kepala Keluarga:</span>
                  <span class="info-value">${kepalaKeluarga?.nama_lengkap || "-"}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Alamat:</span>
                  <span class="info-value">${familyData.alamat || "-"}</span>
                </div>
              </div>
            </div>
            <table>
              <thead>
                ${headerRow}
              </thead>
              <tbody>
                ${bodyRows || '<tr><td colspan="15" style="padding:20px;text-align:center;color:#6b7280;">Tidak ada data pembayaran untuk tahun ini</td></tr>'}
              </tbody>
            </table>

            <div class="footer-section">
              <div class="signature-block">
                <p>Bekasi, ${new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(new Date())}</p>
                <p style="margin-top: 4px;">Koordinator Bidang Pemulasaraan</p>
                <div style="height: 60px;"></div>
                <p style="font-weight: bold; text-decoration: underline;">Kamiso</p>
              </div>
            </div>

            <div style="margin-top: 20px; font-size: 10px; color: #9ca3af; text-align: left;">
              Dicetak pada: ${new Date().toLocaleString("id-ID")}
            </div>
            <script>window.onload = function(){ window.print(); }<\/script>
          </body>
        </html>
      `;

      const w = window.open("", "_blank");
      if (!w) return;
      w.document.open();
      w.document.write(html);
      w.document.close();
    } catch (e) {
      console.error("Error exporting PDF:", e);
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* Family Header */}
      <div className="p-4 bg-emerald-50/40 border-b border-emerald-100/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">
                No. Keluarga
              </p>
              <p className="text-sm font-bold text-gray-900">
                {familyData.no_anggota}
              </p>
            </div>
            <div className="space-y-0.5 max-w-xs">
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">
                Alamat
              </p>
              <p className="text-sm font-medium text-gray-700 leading-tight">
                {familyData.alamat || "-"}
                {(familyData.rt || familyData.rw) && (
                  <span className="text-gray-400 ml-1">
                    (RT.{String(familyData.rt).padStart(3, "0")} RW.
                    {String(familyData.rw).padStart(3, "0")})
                  </span>
                )}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-wider">
                Total Keluarga
              </p>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-bold text-gray-900">
                  {members.length} Anggota
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && onAddMember && (
              <button
                onClick={onAddMember}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all shadow-sm active:scale-95"
              >
                <UserPlus className="w-3.5 h-3.5" />+ Keluarga
              </button>
            )}

            {isAdmin ? (
              <div className="flex items-center bg-white shadow-sm border border-slate-200 rounded-lg p-0.5 overflow-hidden">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  Excel
                </button>
                <div className="w-[1px] h-4 bg-slate-200" />
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            ) : (
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[11px] font-bold hover:bg-indigo-100 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                Export Iuran ke PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="divide-y divide-slate-200">
        {sortedMembers.map((member) => {
          const memberKey = createMemberId(member);
          const memberKartu = member.id
            ? kartuList.filter((k) => k.id_anggota === member.id)
            : [];
          const isUmum = member.jenis_anggota?.trim().toLowerCase() === "umum";

          return (
            <div key={memberKey} className="p-3">
              {/* Member Name and Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-900">
                    {toTitleCase(member.nama_lengkap)}
                  </h4>
                  {isAdmin && (
                    <div className="flex gap-1">
                      {onEditMember && (
                        <button
                          onClick={() => onEditMember(member)}
                          className="p-1 bg-amber-100 hover:bg-amber-200 rounded text-amber-700"
                          title="Edit Anggota"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      )}
                      {onDeleteMember && member.id && (
                        <button
                          onClick={() => {
                            if (
                              confirm(`Hapus anggota "${toTitleCase(member.nama_lengkap)}"?`)
                            ) {
                              onDeleteMember(member.id!);
                            }
                          }}
                          className="p-1 bg-red-100 hover:bg-red-200 rounded text-red-700"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <Badge
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${getBadgeColor(member.jenis_anggota)}`}
                >
                  {member.jenis_anggota}
                </Badge>
              </div>

              {/* Member Details */}
              <div className="space-y-2 mb-3">
                {/* Row 1 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Hubungan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Tgl. Daftar</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">
                      {member.hubungan_keluarga}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">
                      {formatDate(member.tanggal_keanggotaan)}
                    </span>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Pendaftaran</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Iuran/bulan</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(member.pendaftaran)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">
                      {isUmum ? formatCurrency(5000) : "-"}
                    </span>
                  </div>
                </div>

                {member.no_telepon && (
                  <div className="flex items-center justify-between text-xs border-t border-slate-200 pt-2 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">No. Telepon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-bold text-emerald-700">
                        {member.no_telepon}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Grid - Only for Umum */}
              {isUmum && (
                <div className="space-y-2">
                  {/* Show edit button for admin if not currently editing */}
                  {isAdmin && editingMemberId !== member.id && (
                    <button
                      onClick={() => startEditingIuran(member, memberKartu[0])}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit Iuran {selectedYear || new Date().getFullYear()}
                    </button>
                  )}

                  {/* Edit Mode UI */}
                  {isAdmin && editingMemberId === member.id && editingKartu && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-amber-800">
                          Edit Iuran {selectedYear || new Date().getFullYear()}
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setAllMonths(5000)}
                            className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            Isi Semua 5rb
                          </button>
                          <button
                            onClick={() => setAllMonths(0)}
                            className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            Reset
                          </button>
                        </div>
                      </div>

                      {/* Edit Grid */}
                      <div className="grid grid-cols-4 gap-2">
                        {MONTHS.map((month) => {
                          const value = editingKartu[month.key] || 0;
                          const isPaid = value > 0;
                          return (
                            <div key={month.key} className="space-y-1">
                              <label className="text-xs font-medium text-gray-600 block text-center">
                                {month.label}
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                value={value}
                                onChange={(e) =>
                                  updateMonthValue(
                                    month.key,
                                    Number(e.target.value) || 0,
                                  )
                                }
                                className={`w-full px-2 py-1.5 text-xs text-center border-2 rounded transition-all focus:outline-none text-gray-900 ${isPaid
                                  ? "border-emerald-400 bg-emerald-50"
                                  : "border-slate-200 bg-white"
                                  }`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateMonthValue(
                                    month.key,
                                    value > 0 ? 0 : 5000,
                                  )
                                }
                                className={`w-full px-1 py-0.5 text-[10px] rounded ${isPaid
                                  ? "bg-rose-100 text-rose-600 hover:bg-rose-200"
                                  : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                  }`}
                              >
                                {isPaid ? "Hapus" : "5.000"}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Save/Cancel Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-amber-200">
                        <button
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                        >
                          <X className="w-3 h-3" />
                          Batal
                        </button>
                        <button
                          onClick={() => member.id && saveIuran(member.id)}
                          disabled={isSaving}
                          className="flex-1 flex items-center justify-center gap-1 py-2 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" />
                          {isSaving ? "Menyimpan..." : "Simpan"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Display Mode - Show existing kartu */}
                  {memberKartu.length > 0 &&
                    editingMemberId !== member.id &&
                    memberKartu.map((kartu) => {
                      return (
                        <div
                          key={`${kartu.id_anggota}-${kartu.tahun}-${Math.random()}`}
                        >
                          <div className="bg-emerald-50 p-2 mb-2">
                            <p className="text-xs font-semibold text-gray-700">
                              Kartu Iuran {kartu.tahun}
                            </p>
                          </div>

                          {/* Months Grid - 4 columns */}
                          <div className="grid grid-cols-4 gap-2">
                            {MONTHS.map((month) => {
                              const nominal =
                                Number(
                                  kartu[month.key as keyof typeof kartu],
                                ) || 0;
                              const isPaid = nominal > 0;
                              return (
                                <div
                                  key={month.key}
                                  className={`relative rounded-lg p-2.5 transition-all ${isPaid ? "bg-teal-50" : "bg-rose-50"
                                    }`}
                                >
                                  <div className="text-center">
                                    <span
                                      className={`text-xs font-medium block mb-0.5 ${isPaid
                                        ? "text-teal-700"
                                        : "text-rose-700"
                                        }`}
                                    >
                                      {month.label}
                                    </span>
                                    {isPaid ? (
                                      <>
                                        <span className="text-xs font-bold text-teal-600 block">
                                          {nominal.toLocaleString("id-ID")}
                                        </span>
                                        {kartu[
                                          month.dateKey as keyof typeof kartu
                                        ] && (
                                            <span className="text-[9px] text-teal-500 block mt-0.5">
                                              {new Date(
                                                kartu[
                                                month.dateKey as keyof typeof kartu
                                                ] as string,
                                              ).toLocaleDateString("id-ID", {
                                                day: "2-digit",
                                                month: "2-digit",
                                              })}
                                            </span>
                                          )}
                                      </>
                                    ) : (
                                      <span className="text-xs text-rose-500 block">
                                        -
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                  {/* Show create button if no kartu exists */}
                  {memberKartu.length === 0 &&
                    editingMemberId !== member.id &&
                    isAdmin && (
                      <div className="text-center py-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2">
                          Belum ada data iuran untuk tahun {selectedYear}
                        </p>
                        <button
                          onClick={() => startEditingIuran(member, undefined)}
                          className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          + Tambah Iuran
                        </button>
                      </div>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
