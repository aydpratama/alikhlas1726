import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Member, KartuBulanan } from "@/types/membership";

interface ExportOptions {
    members: Member[];
    dues: KartuBulanan[];
    year: number;
    activeFilters?: {
        jenisAnggota?: string;
        status?: string;
        rt?: string;
        rw?: string;
        searchTerm?: string;
    };
}

const MONTHS = [
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

const getRelationRank = (rel?: string) => {
    const r = (rel || "").trim().toLowerCase();
    if (r === "kepala keluarga" || r.includes("kepala")) return 1;
    if (r === "istri") return 2;
    if (r === "anak") return 3;
    if (r === "cucu") return 4;
    return 99;
};

const getDuesForMember = (memberId: number, year: number, dues: KartuBulanan[]) => {
    return dues.find(
        (d) =>
            Number(d.id_anggota) === Number(memberId) &&
            Number(d.tahun) === Number(year),
    );
};

export const exportMembersToPDF = async ({ members, dues, year, activeFilters }: ExportOptions) => {
    try {
        const doc = new jsPDF({ orientation: "landscape" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("DAFTAR ANGGOTA PEMULASARAAN AL-IKHLAS", pageWidth / 2, 15, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`Tahun ${year}`, pageWidth / 2, 22, { align: "center" });

        const filterText = [
            activeFilters?.searchTerm ? `Cari: "${activeFilters.searchTerm}"` : null,
            activeFilters?.jenisAnggota ? `Jenis: ${activeFilters.jenisAnggota}` : null,
            activeFilters?.status ? `Status: ${activeFilters.status}` : null,
            activeFilters?.rt ? `RT: ${activeFilters.rt}` : null,
            activeFilters?.rw ? `RW: ${activeFilters.rw}` : null,
        ].filter(Boolean).join(" | ");

        if (filterText) {
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Filter: ${filterText}`, pageWidth / 2, 28, { align: "center" });
            doc.setTextColor(0, 0, 0);
        }

        const sortedMembers = [...members].sort((a, b) => {
            const extractNumber = (noAnggota: string) => {
                const match = noAnggota.match(/^(\d+)/);
                return match ? parseInt(match[1], 10) : 0;
            };
            const numA = extractNumber(a.no_anggota);
            const numB = extractNumber(b.no_anggota);
            if (numA !== numB) return numA - numB;
            return getRelationRank(a.hubungan_keluarga) - getRelationRank(b.hubungan_keluarga);
        });

        const tableData = sortedMembers.map((member, index) => {
            const memberDues = getDuesForMember(member.id!, year, dues);
            const monthPayments = MONTHS.map((month) => {
                const value = memberDues?.[month.key as keyof KartuBulanan] as number | undefined;
                return value && value > 0 ? `${value.toLocaleString()}` : "-";
            });

            return [
                index + 1,
                member.no_anggota,
                member.nama_lengkap,
                member.hubungan_keluarga,
                member.status || "Aktif",
                member.tanggal_keanggotaan,
                `${member.alamat} RT ${member.rt} / RW ${member.rw}`,
                member.pendaftaran > 0 ? `${member.pendaftaran.toLocaleString()}` : "-",
                ...monthPayments,
            ];
        });

        const headers = ["No", "No Anggota", "Nama Anggota", "Hub. Kel", "Status", "Tgl", "Alamat", "Daftar", ...MONTHS.map(m => m.label)];

        autoTable(doc, {
            startY: 35,
            head: [headers],
            body: tableData,
            styles: { fontSize: 6, cellPadding: 1, overflow: "linebreak", valign: "middle" },
            headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold", halign: "center", valign: "middle", fontSize: 5.5 },
            columnStyles: {
                0: { cellWidth: 7, halign: "center" },
                1: { cellWidth: 23, halign: "center" },
                2: { cellWidth: 32 },
                3: { cellWidth: 16 },
                4: { cellWidth: 14 },
                5: { cellWidth: 16 },
                6: { cellWidth: 42 },
                7: { cellWidth: 18, halign: "right" },
                ...Object.fromEntries(Array.from({ length: 12 }, (_, i) => [8 + i, { cellWidth: 9, halign: "center", fontSize: 5.5 }])),
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            didDrawPage: (data) => {
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                const dateString = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
                doc.text(`Dicetak: ${dateString}`, pageWidth / 2, pageHeight - 10, { align: "center" });
                doc.text(`Total: ${members.length} anggota`, pageWidth / 2, pageHeight - 6, { align: "center" });
            },
        });

        const fileName = `Anggota_Pemulasaraan_${year}${activeFilters?.jenisAnggota ? `_${activeFilters.jenisAnggota.replace(/\s+/g, '_')}` : ""}${activeFilters?.rt ? `_RT${activeFilters.rt}` : ""}${activeFilters?.rw ? `_RW${activeFilters.rw}` : ""}.pdf`;
        doc.save(fileName);
    } catch (error) {
        console.error("Error exporting PDF:", error);
        throw error;
    }
};

export const exportMembersToExcel = async ({ members, dues, year, activeFilters }: ExportOptions) => {
    try {
        const MONTH_LABELS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const filterText = [
            activeFilters?.searchTerm ? `Cari: "${activeFilters.searchTerm}"` : null,
            activeFilters?.jenisAnggota ? `Jenis: ${activeFilters.jenisAnggota}` : null,
            activeFilters?.status ? `Status: ${activeFilters.status}` : null,
            activeFilters?.rt ? `RT: ${activeFilters.rt}` : null,
            activeFilters?.rw ? `RW: ${activeFilters.rw}` : null,
        ].filter(Boolean).join(" | ");

        const headerData = [
            ["DAFTAR ANGGOTA PEMULASARAAN AL-IKHLAS"],
            [`Tahun ${year}`],
            [filterText ? `Filter: ${filterText}` : ""],
            [],
        ];

        const tableHeaders = ["No", "No Anggota", "Nama Anggota", "Hub. Kel", "Status", "Tgl Keanggotaan", "Alamat", "Biaya Daftar", ...MONTH_LABELS_EN];

        const sortedMembers = [...members].sort((a, b) => {
            const extractNumber = (noAnggota: string) => {
                const match = noAnggota.match(/^(\d+)/);
                return match ? parseInt(match[1], 10) : 0;
            };
            const numA = extractNumber(a.no_anggota);
            const numB = extractNumber(b.no_anggota);
            if (numA !== numB) return numA - numB;
            return getRelationRank(a.hubungan_keluarga) - getRelationRank(b.hubungan_keluarga);
        });

        const rows = sortedMembers.map((member, index) => {
            const memberDues = getDuesForMember(member.id!, year, dues);
            const monthPayments = MONTHS.map((month) => {
                const value = memberDues?.[month.key as keyof KartuBulanan];
                return value && Number(value) > 0 ? Number(value) : 0;
            });

            return [
                index + 1,
                member.no_anggota,
                member.nama_lengkap,
                member.hubungan_keluarga,
                member.status || "Aktif",
                member.tanggal_keanggotaan,
                `${member.alamat} RT ${member.rt} / RW ${member.rw}`,
                member.pendaftaran || 0,
                ...monthPayments,
            ];
        });

        const worksheet = XLSX.utils.aoa_to_sheet([...headerData, tableHeaders, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Anggota Pemulasaraan");

        const fileName = `Anggota_Pemulasaraan_${year}.xlsx`;
        XLSX.writeFile(workbook, fileName);
    } catch (error) {
        console.error("Error exporting Excel:", error);
        throw error;
    }
};
