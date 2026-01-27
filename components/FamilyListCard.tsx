import { useState } from "react";
import {
    Keluarga,
    Anggota,
    KartuBulanan,
} from "@/types/membership";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toTitleCase } from "@/lib/utils";
import {
    Users,
    MapPin,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

interface FamilyListCardProps {
    keluarga: Keluarga;
    members: Anggota[];
    kartuList: KartuBulanan[];
}

const MONTHS = [
    { key: "bulan_januari", label: "Jan" },
    { key: "bulan_februari", label: "Feb" },
    { key: "bulan_maret", label: "Mar" },
    { key: "bulan_april", label: "Apr" },
    { key: "bulan_mei", label: "Mei" },
    { key: "bulan_juni", label: "Jun" },
    { key: "bulan_juli", label: "Jul" },
    { key: "bulan_agustus", label: "Agu" },
    { key: "bulan_september", label: "Sep" },
    { key: "bulan_oktober", label: "Okt" },
    { key: "bulan_november", label: "Nov" },
    { key: "bulan_desember", label: "Des" },
];

export function FamilyListCard({
    keluarga,
    members,
    kartuList,
}: FamilyListCardProps) {
    const [expandedMembers, setExpandedMembers] = useState<
        Set<string>
    >(new Set());

    const formatCurrency = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined) return "-";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // const formatDate = (dateString: string) => {
    //   return new Date(dateString).toLocaleDateString("id-ID", {
    //     day: "numeric",
    //     month: "long",
    //     year: "numeric",
    //   });
    // };

    const toggleMember = (
        noAnggota: string,
        jenisAnggota: string,
    ) => {
        // Hanya anggota Umum yang bisa di-expand (punya kartu bulanan)
        if (jenisAnggota !== "Umum") return;

        const newExpanded = new Set(expandedMembers);
        if (newExpanded.has(noAnggota)) {
            newExpanded.delete(noAnggota);
        } else {
            newExpanded.add(noAnggota);
        }
        setExpandedMembers(newExpanded);
    };

    const getBadgeColor = (jenisAnggota: string) => {
        switch (jenisAnggota) {
            case "Tetap":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "Tetap Tambahan":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "Umum":
                return "bg-orange-100 text-orange-700 border-orange-200";
            default:
                return "bg-gray-100 text-gray-700 border-slate-200";
        }
    };

    return (
        <Card className="border-2 border-slate-200 bg-white shadow-xl rounded-lg overflow-hidden">
            {/* Family Header - Compact for Mobile */}
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 p-3 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="flex items-center gap-2 mb-1 text-base sm:text-lg">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            <span className="truncate">
                                KL {keluarga.no_anggota.split("-")[1]}
                            </span>
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-emerald-100 mb-1">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">
                                RT {keluarga.rt}/RW {keluarga.rw}
                            </span>
                        </div>
                        <p className="text-xs text-emerald-100 truncate">
                            {keluarga.alamat}
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <Badge
                            variant="secondary"
                            className="bg-white text-emerald-700 text-xs px-2 py-0"
                        >
                            {members.length} Orang
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-3 sm:pt-6 sm:px-6 sm:pb-6">
                {/* Members List */}
                <div className="space-y-2">
                    {members.map((member) => {
                        const isExpanded = expandedMembers.has(
                            member.no_anggota,
                        );
                        const memberKartu = kartuList.filter(
                            (k) => k.no_anggota === member.no_anggota,
                        );

                        return (
                            <div key={member.no_anggota}>
                                {/* Member Row - Compact for Mobile */}
                                <button
                                    onClick={() =>
                                        toggleMember(
                                            member.no_anggota,
                                            member.jenis_anggota,
                                        )
                                    }
                                    className={`w-full text-left bg-gray-50 rounded-lg p-2 sm:p-4 transition-all border-2 border-slate-200 ${member.jenis_anggota === "Umum"
                                        ? "hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer"
                                        : "cursor-default"
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            {/* Name and Badges in one compact line */}
                                            <div className="flex items-center gap-1 mb-1 flex-wrap">
                                                <span className="text-sm sm:text-base text-gray-900 font-medium truncate">
                                                    {toTitleCase(member.nama_lengkap)}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] sm:text-xs px-1 py-0 ${getBadgeColor(member.jenis_anggota)}`}
                                                >
                                                    {member.jenis_anggota}
                                                </Badge>
                                            </div>

                                            {/* Hubungan and Payment Info - More compact */}
                                            <div className="flex items-center gap-2 text-[11px] sm:text-sm text-gray-600">
                                                <span className="text-emerald-700">
                                                    {member.hubungan_keluarga}
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                {member.jenis_anggota === "Umum" ? (
                                                    <span className="text-emerald-600">
                                                        {formatCurrency(
                                                            member.biaya_anggota ?? undefined,
                                                        )}
                                                        /bln
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-700">
                                                        {formatCurrency(
                                                            member.biaya_anggota ?? undefined,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right side - Chevron only for Umum */}
                                        {member.jenis_anggota === "Umum" && (
                                            <div className="flex items-center">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </button>

                                {/* Expanded Payment Cards - Compact for Mobile */}
                                {isExpanded &&
                                    member.jenis_anggota === "Umum" && (
                                        <div className="mt-2 ml-0 sm:ml-4 space-y-2">
                                            {memberKartu.length === 0 ? (
                                                <div className="text-center py-3 text-xs sm:text-sm text-gray-500 bg-gray-50 rounded-lg border-2 border-slate-200">
                                                    Belum ada kartu iuran
                                                </div>
                                            ) : (
                                                memberKartu.map((kartu) => {
                                                    const getPaymentCount = () => {
                                                        return MONTHS.filter(
                                                            (month) =>
                                                                kartu[
                                                                month.key as keyof KartuBulanan
                                                                ],
                                                        ).length;
                                                    };

                                                    const totalPaid = getPaymentCount();
                                                    const percentage =
                                                        (totalPaid / 12) * 100;

                                                    return (
                                                        <div
                                                            key={kartu.kartu_id}
                                                            className="border-2 border-emerald-300 rounded-lg p-2 sm:p-4 bg-gradient-to-br from-emerald-50 to-white shadow-md"
                                                        >
                                                            {/* Year and Progress - Compact */}
                                                            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs sm:text-sm text-gray-900">
                                                                        Tahun {kartu.tahun}
                                                                    </span>
                                                                    <Badge
                                                                        variant={
                                                                            percentage === 100
                                                                                ? "default"
                                                                                : percentage >= 50
                                                                                    ? "secondary"
                                                                                    : "destructive"
                                                                        }
                                                                        className="text-[10px] sm:text-xs px-1 py-0"
                                                                    >
                                                                        {totalPaid}/12
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-20 sm:w-24 bg-gray-200 rounded-full h-1.5 sm:h-2 border border-slate-200">
                                                                        <div
                                                                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                                                                            style={{
                                                                                width: `${percentage}%`,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-[10px] sm:text-xs text-emerald-700 min-w-[2rem] text-right">
                                                                        {percentage.toFixed(0)}%
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Months Grid - More Compact */}
                                                            <div className="grid grid-cols-6 sm:grid-cols-12 gap-1 sm:gap-2">
                                                                {MONTHS.map((month) => {
                                                                    const isPaid =
                                                                        kartu[
                                                                        month.key as keyof KartuBulanan
                                                                        ];
                                                                    return (
                                                                        <div
                                                                            key={month.key}
                                                                            className={`flex flex-col items-center justify-center p-1 sm:p-2 rounded-lg border-2 transition-all ${isPaid
                                                                                ? "bg-emerald-100 border-emerald-400 shadow-sm"
                                                                                : "bg-white border-slate-200"
                                                                                }`}
                                                                        >
                                                                            {isPaid ? (
                                                                                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600" />
                                                                            ) : (
                                                                                <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                                                                            )}
                                                                            <span
                                                                                className={`text-[9px] sm:text-[10px] mt-0.5 ${isPaid
                                                                                    ? "text-emerald-700"
                                                                                    : "text-gray-500"
                                                                                    }`}
                                                                            >
                                                                                {month.label}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
