"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Download, Loader2 } from "lucide-react";

export default function FinancialReport() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      console.log("Fetching latest financial report from database...");

      // Ambil data laporan terbaru yang sudah dipublikasikan
      const { data, error } = await supabase
        .from("laporan_keuangan")
        .select("url_file_pdf")
        .eq("dipublikasikan", true)
        .order("tahun", { ascending: false })
        .order("bulan", { ascending: false })
        .order("minggu_ke", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Database Error:", error);
        throw new Error(`Gagal mengambil data laporan: ${error.message}`);
      }

      if (!data?.url_file_pdf) {
        throw new Error(
          "File PDF laporan belum tersedia atau belum di-upload.",
        );
      }

      console.log("PDF URL found:", data.url_file_pdf);

      // Buka URL di tab baru
      window.open(data.url_file_pdf, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      console.error("Error opening report:", err);
      alert(err.message || "Terjadi kesalahan saat membuka laporan.");
    } finally {
      setIsDownloading(false);
    }
  };

  const transactions = [
    {
      date: "12 Jan 2026",
      desc: "Kotak Amal Jumat",
      type: "in",
      amount: "Rp 3.500.000",
    },
    {
      date: "10 Jan 2026",
      desc: "Hamba Allah (Transfer)",
      type: "in",
      amount: "Rp 1.000.000",
    },
    {
      date: "09 Jan 2026",
      desc: "Biaya Kebersihan & Maintenance",
      type: "out",
      amount: "Rp 750.000",
    },
    {
      date: "08 Jan 2026",
      desc: "Konsumsi Kajian Rutin",
      type: "out",
      amount: "Rp 300.000",
    },
    {
      date: "05 Jan 2026",
      desc: "Infaq Parkir",
      type: "in",
      amount: "Rp 450.000",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Laporan <span className="text-primary">Keuangan</span>
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Transparansi dana umat. Laporan pemasukan dan pengeluaran masjid
            yang diperbarui setiap pekan.
          </p>
        </div>
        <div className="flex justify-center mb-10">
          <div className="bg-emerald-50 px-6 py-4 rounded-md border border-emerald-100">
            <span className="block text-xs font-semibold text-emerald-600 tracking-wider mb-1">
              Total Saldo Kas
            </span>
            <span className="block text-3xl font-bold text-emerald-700">
              Rp 48.250.000
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-slate-200 text-xs font-semibold text-gray-500 tracking-wider">
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4 text-center">Jenis</th>
                  <th className="px-6 py-4 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((t, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {t.date}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {t.desc}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.type === "in"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {t.type === "in" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold text-right whitespace-nowrap ${
                        t.type === "in" ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {t.type === "in" ? "+" : "-"} {t.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-slate-200 flex justify-center md:justify-end">
            <button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 text-primary text-sm font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-all h-11 sm:h-auto px-4 sm:px-0"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memuat...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Lihat Laporan Lengkap
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
