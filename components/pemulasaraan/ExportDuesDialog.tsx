"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2, Filter } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Member, KartuBulanan } from "@/types/membership";

interface ExportDuesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  dues: KartuBulanan[];
  activeFilters?: {
    jenisAnggota?: string;
    rt?: string;
    rw?: string;
    searchTerm?: string;
  };
}

export function ExportDuesDialog({
  isOpen,
  onClose,
  members,
  dues,
  activeFilters,
  defaultYear,
}: ExportDuesDialogProps & { defaultYear?: number }) {
  const [yearFilter, setYearFilter] = useState<number>(
    defaultYear || new Date().getFullYear(),
  );
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (defaultYear) {
      setYearFilter(defaultYear);
    }
  }, [defaultYear]);

  const availableYears = Array.from(new Set(dues.map((d) => d.tahun))).sort(
    (a, b) => b - a,
  );

  // If dues is empty or doesn't have the defaultYear, add it to available years
  if (defaultYear && !availableYears.includes(defaultYear)) {
    availableYears.push(defaultYear);
    availableYears.sort((a, b) => b - a);
  }

  const getDuesForMember = (memberId: number, year: number) => {
    return dues.find(
      (d) =>
        Number(d.id_anggota) === Number(memberId) &&
        Number(d.tahun) === Number(year),
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ orientation: "landscape" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("DAFTAR ANGGOTA PEMULASARAAN AL-IKHLAS", pageWidth / 2, 15, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Tahun ${yearFilter}`, pageWidth / 2, 22, {
        align: "center",
      });

      const filterText = [
        activeFilters?.searchTerm
          ? `Cari: "${activeFilters.searchTerm}"`
          : null,
        activeFilters?.jenisAnggota
          ? `Jenis: ${activeFilters.jenisAnggota}`
          : null,
        activeFilters?.rt ? `RT: ${activeFilters.rt}` : null,
        activeFilters?.rw ? `RW: ${activeFilters.rw}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      if (filterText) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Filter: ${filterText}`, pageWidth / 2, 28, {
          align: "center",
        });
        doc.setTextColor(0, 0, 0);
      }

      const months = [
        { key: "bulan_januari", label: "Jan" },
        { key: "bulan_februari", label: "Feb" },
        { key: "bulan_maret", label: "Mar" },
        { key: "bulan_april", label: "Apr" },
        { key: "bulan_mei", label: "Mei" },
        { key: "bulan_juni", label: "Jun" },
        { key: "bulan_juli", label: "Jul" },
        { key: "bulan_agustus", label: "Ags" },
        { key: "bulan_september", label: "Sep" },
        { key: "bulan_oktober", label: "Okt" },
        { key: "bulan_november", label: "Nov" },
        { key: "bulan_desember", label: "Des" },
      ];

      const monthColumns = months.map((m) => m.label);

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

      const sortedMembers = [...members].sort((a, b) => {
        const extractNumber = (noAnggota: string) => {
          const match = noAnggota.match(/^(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        };
        const numA = extractNumber(a.no_anggota);
        const numB = extractNumber(b.no_anggota);

        if (numA !== numB) {
          return numA - numB;
        }

        return (
          getRelationRank(a.hubungan_keluarga) -
          getRelationRank(b.hubungan_keluarga)
        );
      });

      const tableData = sortedMembers.map((member, index) => {
        const memberDues = getDuesForMember(member.id!, yearFilter);

        const monthPayments = months.map((month) => {
          const value = memberDues?.[month.key as keyof KartuBulanan] as
            | number
            | undefined;
          return value && value > 0 ? `${value.toLocaleString()}` : "-";
        });

        return [
          index + 1,
          member.no_anggota,
          member.nama_lengkap,
          member.hubungan_keluarga,
          member.jenis_anggota,
          member.tanggal_keanggotaan,
          `${member.alamat} RT ${member.rt} / RW ${member.rw}`,
          member.pendaftaran > 0
            ? `${member.pendaftaran.toLocaleString()}`
            : "-",
          ...monthPayments,
        ];
      });

      const headers = [
        "No",
        "No Anggota",
        "Nama Anggota",
        "Hub. Kel",
        "Jenis",
        "Tgl",
        "Alamat",
        "Daftar",
        ...monthColumns,
      ];

      autoTable(doc, {
        startY: 35,
        head: [headers],
        body: tableData,
        styles: {
          fontSize: 6,
          cellPadding: 1,
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          valign: "middle",
          fontSize: 5.5,
        },
        columnStyles: {
          0: { cellWidth: 7, halign: "center" }, // No
          1: { cellWidth: 23, halign: "center" }, // No Anggota
          2: { cellWidth: 32 }, // Nama Anggota
          3: { cellWidth: 16 }, // Hubungan Keluarga
          4: { cellWidth: 14 }, // Jenis Anggota
          5: { cellWidth: 16 }, // Tgl Keanggotaan
          6: { cellWidth: 42 }, // Alamat
          7: { cellWidth: 18, halign: "right" }, // Pendaftaran
          ...Object.fromEntries(
            Array.from({ length: 12 }, (_, i) => [
              8 + i,
              { cellWidth: 9, halign: "center", fontSize: 5.5 }, // Bulan columns (Jan, Feb, ...)
            ]),
          ),
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        didDrawPage: (data) => {
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          const date = new Date().toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
          doc.text(`Dicetak: ${date}`, pageWidth / 2, pageHeight - 10, {
            align: "center",
          });
          doc.text(
            `Total: ${members.length} anggota`,
            pageWidth / 2,
            pageHeight - 6,
            { align: "center" },
          );
        },
      });

      const fileName = `Anggota_Pemulasaraan_${yearFilter}${activeFilters?.jenisAnggota ? `_${activeFilters.jenisAnggota}` : ""}${activeFilters?.rt ? `_RT${activeFilters.rt}` : ""}${activeFilters?.rw ? `_RW${activeFilters.rw}` : ""}.pdf`;
      doc.save(fileName);

      onClose();
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Gagal mengekspor PDF. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="w-5 h-5 text-emerald-600" />
            Export Kartu Iuran PDF
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <Filter className="w-4 h-4 text-emerald-600" />
            <p className="text-xs text-emerald-700 font-medium">
              Filter data yang akan diekspor
            </p>
          </div>

          {activeFilters &&
            (activeFilters.jenisAnggota ||
              activeFilters.rt ||
              activeFilters.rw ||
              activeFilters.searchTerm) && (
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600">
                  Filter aktif:
                </span>
                {activeFilters.searchTerm && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                    Cari: "{activeFilters.searchTerm}"
                  </span>
                )}
                {activeFilters.jenisAnggota && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                    {activeFilters.jenisAnggota}
                  </span>
                )}
                {activeFilters.rt && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                    RT {activeFilters.rt}
                  </span>
                )}
                {activeFilters.rw && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md">
                    RW {activeFilters.rw}
                  </span>
                )}
              </div>
            )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Tahun
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none bg-white"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-600">
              <span className="font-bold">Data yang akan diekspor:</span>{" "}
              {members.length} anggota
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExporting}
            className="h-11 sm:h-10"
          >
            Batal
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || members.length === 0}
            className="h-11 sm:h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-w-[140px]"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengekspor...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
