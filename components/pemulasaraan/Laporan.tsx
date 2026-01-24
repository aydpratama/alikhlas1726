import { useMemo, useState } from "react";
import { FamilyMember } from "@/components/FamilyCard";
import { KartuBulanan } from "@/types/membership";
import { Download, Filter, TrendingUp, Users, Wallet, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReportViewProps {
    year: number;
    duesData: KartuBulanan[];
    members: FamilyMember[];
}

const MONTHS = [
    { key: "bulan_januari", label: "Jan" },
    { key: "bulan_februari", label: "Feb" },
    { key: "bulan_maret", label: "Mar" },
    { key: "bulan_april", label: "Apr" },
    { key: "bulan_mei", label: "Mei" },
    { key: "bulan_juni", label: "Jun" },
    { key: "bulan_juli", label: "Jul" },
    { key: "bulan_agustus", label: "Agt" },
    { key: "bulan_september", label: "Sep" },
    { key: "bulan_oktober", label: "Okt" },
    { key: "bulan_november", label: "Nov" },
    { key: "bulan_desember", label: "Des" },
];

export function ReportView({ year, members, duesData }: ReportViewProps) {
    const [selectedRW, setSelectedRW] = useState("Semua");
    const [activeTab, setActiveTab] = useState<"summary" | "Tetap" | "Tetap Tambahan" | "Umum">("summary");

    const duesMap = useMemo(() => {
        const map = new Map<number, KartuBulanan>();
        duesData.forEach(d => {
            map.set(d.id_anggota, d);
        });
        return map;
    }, [duesData]);

    const { groupedData, grandTotals } = useMemo(() => {
        const data: Record<string, {
            rw: string;
            rt: string;
            countTetap: number;
            countTambahan: number;
            countUmum: number;
            pendaftaranUmum: number;
            pendaftaranTetap: number;
            pendaftaranTambahan: number;
            monthlyUmum: number[];
            totalUmum: number;
            totalTetap: number;
            totalTambahan: number;
            grandTotal: number;
        }> = {};

        const totals = {
            countTetap: 0,
            countTambahan: 0,
            countUmum: 0,
            pendaftaranUmum: 0,
            pendaftaranTetap: 0,
            pendaftaranTambahan: 0,
            monthlyUmum: Array(12).fill(0),
            totalUmum: 0,
            totalTetap: 0,
            totalTambahan: 0,
            amount: 0
        };

        members.forEach(m => {
            if (selectedRW !== "Semua" && String(m.rw) !== selectedRW) return;

            const rw = String(m.rw || "-");
            const rt = String(m.rt || "-");
            const key = `${rw}-${rt}`;

            if (!data[key]) {
                data[key] = {
                    rw, rt,
                    countTetap: 0, countTambahan: 0, countUmum: 0,
                    pendaftaranUmum: 0, pendaftaranTetap: 0, pendaftaranTambahan: 0,
                    monthlyUmum: Array(12).fill(0),
                    totalUmum: 0, totalTetap: 0, totalTambahan: 0,
                    grandTotal: 0
                };
            }

            const pendaftaranValue = Number(m.pendaftaran) || 0;

            if (m.jenis_anggota === 'Tetap') {
                data[key].countTetap++;
                data[key].pendaftaranTetap += pendaftaranValue;
                data[key].totalTetap += pendaftaranValue;
                totals.countTetap++;
                totals.pendaftaranTetap += pendaftaranValue;
                totals.totalTetap += pendaftaranValue;
            } else if (m.jenis_anggota === 'Tetap Tambahan') {
                data[key].countTambahan++;
                data[key].pendaftaranTambahan += pendaftaranValue;
                data[key].totalTambahan += pendaftaranValue;
                totals.countTambahan++;
                totals.pendaftaranTambahan += pendaftaranValue;
                totals.totalTambahan += pendaftaranValue;
            } else if (m.jenis_anggota === 'Umum') {
                data[key].countUmum++;
                data[key].pendaftaranUmum += pendaftaranValue;
                data[key].totalUmum += pendaftaranValue;
                totals.countUmum++;
                totals.pendaftaranUmum += pendaftaranValue;
                totals.totalUmum += pendaftaranValue;

                // Sum Monthly Dues for Umum
                const due = m.id ? duesMap.get(m.id) : undefined;
                if (due) {
                    MONTHS.forEach((month, idx) => {
                        const val = Number(due[month.key as keyof KartuBulanan]) || 0;
                        if (val > 0) {
                            data[key].monthlyUmum[idx] += val;
                            data[key].totalUmum += val;
                            totals.monthlyUmum[idx] += val;
                            totals.totalUmum += val;
                        }
                    });
                }
            }

            data[key].grandTotal = data[key].totalUmum + data[key].totalTetap + data[key].totalTambahan;
        });

        totals.amount = totals.totalUmum + totals.totalTetap + totals.totalTambahan;

        const sorted = Object.values(data).sort((a, b) => {
            const rwCompare = a.rw.localeCompare(b.rw, undefined, { numeric: true });
            if (rwCompare !== 0) return rwCompare;
            return a.rt.localeCompare(b.rt, undefined, { numeric: true });
        });

        return { groupedData: sorted, grandTotals: totals };
    }, [members, duesMap, selectedRW]);

    const formatCurrency = (val: number) => {
        if (val === 0) return "-";
        return new Intl.NumberFormat('id-ID').format(val);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Design Enhanced Header */}
            <div className="flex flex-col xl:flex-row justify-between xl:items-end gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Laporan Keuangan</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-3xl tracking-tight">Tahun {year}</h3>
                    <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                        Rekapitulasi lengkap data iuran pemulasaraan per RT/RW. Gunakan filter di sebelah kanan untuk mempersempit jangkauan data.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        {[
                            { id: "summary", label: "Ringkasan" },
                            { id: "Umum", label: "Umum" },
                            { id: "Tetap", label: "Tetap" },
                            { id: "Tetap Tambahan", label: "Tmbh" }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === tab.id
                                    ? "bg-emerald-600 text-white shadow-md"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

                    <div className="flex items-center gap-3 px-2">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Filter className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Filter RW</span>
                        </div>
                        <select
                            value={selectedRW}
                            onChange={(e) => setSelectedRW(e.target.value)}
                            className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer font-medium text-slate-700 shadow-sm"
                        >
                            <option value="Semua">Semua RW</option>
                            <option value="8">RW 08</option>
                            <option value="17">RW 17</option>
                            <option value="26">RW 26</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Modern Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CardStat
                    title="Total Penerimaan"
                    value={`Rp ${formatCurrency(grandTotals.amount)}`}
                    icon={<Wallet className="w-5 h-5 text-emerald-600" />}
                    trend="Akumulasi Tahun Ini"
                    color="emerald"
                />
                <CardStat
                    title="Total Anggota"
                    value={(grandTotals.countTetap + grandTotals.countTambahan + grandTotals.countUmum).toString()}
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                    trend="Aktif & Terdaftar"
                    color="blue"
                />
                <CardStat
                    title="Anggota Umum"
                    value={grandTotals.countUmum.toString()}
                    icon={<Users className="w-5 h-5 text-amber-600" />}
                    trend={`${Math.round((grandTotals.countUmum / (grandTotals.countTetap + grandTotals.countTambahan + grandTotals.countUmum || 1)) * 100)}% dari Total`}
                    color="amber"
                />
                <CardStat
                    title="Estimasi Bulanan"
                    value={`Rp ${formatCurrency(grandTotals.monthlyUmum.reduce((a, b) => a + b, 0) / 12)}`}
                    icon={<Calendar className="w-5 h-5 text-purple-600" />}
                    trend="Rata-rata / Bulan"
                    color="purple"
                />
            </div>

            {/* Enhanced Data Table */}
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto max-h-[700px] overflow-y-auto relative custom-scrollbar">
                    <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
                        <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 z-20 shadow-sm uppercase tracking-wider text-[10px]">
                            {activeTab === "summary" ? (
                                <tr>
                                    <th className="px-4 py-4 text-center sticky left-0 bg-slate-50 z-30 border-b border-slate-200">RW</th>
                                    <th className="px-4 py-4 text-center sticky left-[calc(3rem)] bg-slate-50 z-30 border-b border-r border-slate-200">RT</th>
                                    <th className="px-6 py-4 text-right border-b border-slate-200">Pend. Umum</th>
                                    <th className="px-6 py-4 text-right border-b border-slate-200">Iuran Bulanan</th>
                                    <th className="px-6 py-4 text-right border-b border-slate-200">Total Tetap</th>
                                    <th className="px-6 py-4 text-right border-b border-slate-200">Total Tambahan</th>
                                    <th className="px-6 py-4 text-right bg-emerald-50 text-emerald-800 border-b border-emerald-100 sticky right-0 z-30 shadow-l-sm">GRAND TOTAL</th>
                                </tr>
                            ) : activeTab === "Umum" ? (
                                <tr>
                                    <th className="px-4 py-4 text-center sticky left-0 bg-slate-50 z-30 border-b border-slate-200">RW</th>
                                    <th className="px-4 py-4 text-center sticky left-[calc(3rem)] bg-slate-50 z-30 border-b border-r border-slate-200">RT</th>
                                    <th className="px-6 py-4 text-right border-b border-slate-200">Pendaftaran</th>
                                    {MONTHS.map(m => (
                                        <th key={m.key} className="px-3 py-4 text-right border-b border-slate-200">{m.label}</th>
                                    ))}
                                    <th className="px-6 py-4 text-right bg-emerald-50 text-emerald-800 border-b border-emerald-100 sticky right-0 z-30 shadow-l-sm">TOTAL</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-4 py-4 text-center sticky left-0 bg-slate-50 z-30 border-b border-slate-200 w-20">RW</th>
                                    <th className="px-4 py-4 text-center sticky left-20 bg-slate-50 z-30 border-b border-r border-slate-200 w-20">RT</th>
                                    <th className="px-6 py-4 text-right border-b border-slate-200">Jumlah Anggota</th>
                                    <th className="px-6 py-4 text-right bg-emerald-50 text-emerald-800 border-b border-emerald-100 sticky right-0 z-30 shadow-l-sm">TOTAL NOMINAL</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {groupedData.length === 0 ? (
                                <tr>
                                    <td colSpan={20} className="px-10 py-16 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                                                <Filter className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <p className="font-medium text-sm">Tidak ada data ditemukan untuk filter ini</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : groupedData.map((row, idx) => (
                                <tr key={`${row.rw}-${row.rt}`} className="hover:bg-slate-50/80 transition-colors group">
                                    {activeTab === "summary" ? (
                                        <>
                                            <td className="px-4 py-3 text-center font-bold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10">{row.rw}</td>
                                            <td className="px-4 py-3 text-center font-bold text-slate-700 sticky left-[calc(3rem)] bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 group-hover:border-slate-200">{row.rt}</td>
                                            <td className="px-6 py-3 text-right text-slate-600 tabular-nums">{formatCurrency(row.pendaftaranUmum)}</td>
                                            <td className="px-6 py-3 text-right text-emerald-600 font-medium tabular-nums bg-emerald-50/30">
                                                {formatCurrency(row.monthlyUmum.reduce((a, b) => a + b, 0))}
                                            </td>
                                            <td className="px-6 py-3 text-right text-slate-600 tabular-nums">{formatCurrency(row.totalTetap)}</td>
                                            <td className="px-6 py-3 text-right text-slate-600 tabular-nums">{formatCurrency(row.totalTambahan)}</td>
                                            <td className="px-6 py-3 text-right font-bold bg-emerald-50/50 text-emerald-700 sticky right-0 z-10 group-hover:bg-emerald-100/50 tabular-nums shadow-l-sm">
                                                {formatCurrency(row.grandTotal)}
                                            </td>
                                        </>
                                    ) : activeTab === "Umum" ? (
                                        <>
                                            <td className="px-4 py-3 text-center font-bold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10">{row.rw}</td>
                                            <td className="px-4 py-3 text-center font-bold text-slate-700 sticky left-[calc(3rem)] bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 group-hover:border-slate-200">{row.rt}</td>
                                            <td className="px-6 py-3 text-right text-slate-600 tabular-nums">{formatCurrency(row.pendaftaranUmum)}</td>
                                            {row.monthlyUmum.map((val, midx) => (
                                                <td key={midx} className={`px-3 py-3 text-right tabular-nums ${val > 0 ? 'text-emerald-600 font-medium bg-emerald-50/30' : 'text-slate-300'}`}>
                                                    {formatCurrency(val)}
                                                </td>
                                            ))}
                                            <td className="px-6 py-3 text-right font-bold bg-emerald-50/50 text-emerald-700 sticky right-0 z-10 group-hover:bg-emerald-100/50 tabular-nums shadow-l-sm">
                                                {formatCurrency(row.totalUmum)}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-4 py-3 text-center font-bold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10">{row.rw}</td>
                                            <td className="px-4 py-3 text-center font-bold text-slate-700 sticky left-20 bg-white group-hover:bg-slate-50 z-10 border-r border-slate-100 group-hover:border-slate-200">{row.rt}</td>
                                            <td className="px-6 py-3 text-right text-slate-600 tabular-nums text-sm">
                                                <Badge variant="outline" className="font-normal text-slate-600 border-slate-200">
                                                    {activeTab === "Tetap" ? row.countTetap : row.countTambahan} Orang
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-right font-bold bg-emerald-50/50 text-emerald-700 sticky right-0 z-10 group-hover:bg-emerald-100/50 tabular-nums shadow-l-sm">
                                                {formatCurrency(activeTab === "Tetap" ? row.totalTetap : row.totalTambahan)}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-900 text-white font-bold sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            {groupedData.length > 0 && (
                                <>
                                    {activeTab === "summary" ? (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-4 text-center sticky left-0 bg-slate-900 z-30 border-r border-slate-800 text-[10px] uppercase tracking-wider">TOTAL SELURUH</td>
                                            <td className="px-6 py-4 text-right tabular-nums">{formatCurrency(grandTotals.pendaftaranUmum)}</td>
                                            <td className="px-6 py-4 text-right text-emerald-300 tabular-nums">{formatCurrency(grandTotals.monthlyUmum.reduce((a, b) => a + b, 0))}</td>
                                            <td className="px-6 py-4 text-right tabular-nums">{formatCurrency(grandTotals.totalTetap)}</td>
                                            <td className="px-6 py-4 text-right tabular-nums">{formatCurrency(grandTotals.totalTambahan)}</td>
                                            <td className="px-6 py-4 text-right bg-emerald-600 sticky right-0 z-30 shadow-l-md tabular-nums text-sm">{formatCurrency(grandTotals.amount)}</td>
                                        </tr>
                                    ) : activeTab === "Umum" ? (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-4 text-center sticky left-0 bg-slate-900 z-30 border-r border-slate-800 text-[10px] uppercase tracking-wider">TOTAL UMUM</td>
                                            <td className="px-6 py-4 text-right tabular-nums">{formatCurrency(grandTotals.pendaftaranUmum)}</td>
                                            {grandTotals.monthlyUmum.map((val, idx) => (
                                                <td key={idx} className="px-3 py-4 text-right text-emerald-300 tabular-nums">{formatCurrency(val)}</td>
                                            ))}
                                            <td className="px-6 py-4 text-right bg-emerald-600 sticky right-0 z-30 shadow-l-md tabular-nums text-sm">{formatCurrency(grandTotals.totalUmum)}</td>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="px-4 py-4 text-center sticky left-0 bg-slate-900 z-30 border-r border-slate-800 text-[10px] uppercase tracking-wider">TOTAL {activeTab.toUpperCase()}</td>
                                            <td className="px-6 py-4 text-right text-slate-300 tabular-nums italic">
                                                {activeTab === "Tetap" ? grandTotals.countTetap : grandTotals.countTambahan} Anggota Total
                                            </td>
                                            <td className="px-6 py-4 text-right bg-emerald-600 sticky right-0 z-30 shadow-l-md tabular-nums text-sm">
                                                {formatCurrency(activeTab === "Tetap" ? grandTotals.totalTetap : grandTotals.totalTambahan)}
                                            </td>
                                        </tr>
                                    )}
                                </>
                            )}
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
                <div className="bg-amber-100 p-1.5 rounded-full text-amber-600 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                    <h5 className="text-sm font-bold text-amber-900 mb-1">Catatan Laporan</h5>
                    <p className="text-xs text-amber-700 leading-relaxed">
                        Laporan ini digenerate secara otomatis dari data transaksi harian. Pastikan seluruh input data anggota dan pembayaran telah diverifikasi sebelum mencetak laporan ini untuk kebutuhan rapat atau audit. Nominal ditampilkan dalam mata uang Rupiah penuh.
                    </p>
                </div>
            </div>
        </div>
    );
}

function CardStat({ title, value, icon, trend, color }: { title: string, value: string, icon: React.ReactNode, trend: string, color: string }) {
    const colorClasses = {
        emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
        blue: "bg-blue-50 border-blue-100 text-blue-700",
        amber: "bg-amber-50 border-amber-100 text-amber-700",
        purple: "bg-purple-50 border-purple-100 text-purple-700",
    };

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-16 h-16 opacity-10 rounded-bl-full transition-transform group-hover:scale-110 ${colorClasses[color as keyof typeof colorClasses].replace('bg-', 'bg-')}`}></div>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
                    <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
                </div>
                <div className={`p-2 rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : color === 'amber' ? 'bg-amber-500' : 'bg-purple-500'}`}></span>
                {trend}
            </div>
        </div>
    );
}
