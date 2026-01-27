"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/Toast";
import { toTitleCase } from "@/lib/utils";

interface RegistrationApprovalProps {
  isAdminProp?: boolean;
  isAdminLoadingProp?: boolean;
  onDataChange?: () => void;
}

export function RegistrationApproval({
  isAdminProp,
  isAdminLoadingProp,
  onDataChange,
}: RegistrationApprovalProps) {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("pendaftaran_pemulasaraan")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setRegistrations(data);
    } catch (e) {
      console.error("Error fetching registrations:", e);
      toast.error("Gagal memuat data pendaftaran");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdminProp) {
      fetchRegistrations();
    }
  }, [isAdminProp]);

  const getRelationRank = (rel?: string) => {
    const r = (rel || "").trim().toLowerCase();
    if (r === "kepala keluarga" || r.includes("kepala")) return 1;
    if (r === "istri") return 2;
    if (r === "anak") return 3;
    if (r === "cucu") return 4;
    return 99;
  };

  const handleApprove = async (membersToApprove: any[]) => {
    const sortedMembersToApprove = [...membersToApprove].sort((a, b) => {
      return getRelationRank(a.hubungan_keluarga) - getRelationRank(b.hubungan_keluarga);
    });

    const familyName =
      toTitleCase(sortedMembersToApprove[0].nama_kepala_keluarga || sortedMembersToApprove[0].nama_lengkap);
    if (
      !confirm(
        `Setujui pendaftaran untuk keluarga ${familyName} (${sortedMembersToApprove.length} orang)?`,
      )
    )
      return;

    setIsLoading(true);
    try {
      // 1. Get the latest membership number for the year
      const { data: latestMembers, error: fetchError } = await (supabase
        .from("anggota_pemulasaraan") as any)
        .select("no_anggota")
        .order("id", { ascending: false })
        .limit(200);

      if (fetchError) throw fetchError;

      let nextNum = 1;
      const yearStr = new Date().getFullYear().toString();
      const yearMembers =
        (latestMembers as any[])?.filter((m: any) =>
          m.no_anggota?.endsWith(`/PEM/${yearStr}`),
        ) || [];

      if (yearMembers.length > 0) {
        const numbers = yearMembers
          .map((m: any) => parseInt(m.no_anggota.split("/")[0]))
          .filter((n: any) => !isNaN(n));
        if (numbers.length > 0) {
          nextNum = Math.max(...numbers) + 1;
        }
      }

      // 2. Process each member
      for (let i = 0; i < sortedMembersToApprove.length; i++) {
        const reg = sortedMembersToApprove[i];
        const newNoAnggota = `${nextNum}/PEM/${yearStr}`; // Removed suffix

        // Insert into anggota_pemulasaraan
        const { data: newMember, error: insertError } = await (supabase
          .from("anggota_pemulasaraan") as any)
          .insert({
            no_anggota: newNoAnggota,
            nama_lengkap: reg.nama_lengkap,
            hubungan_keluarga: reg.hubungan_keluarga,
            jenis_anggota: reg.jenis_anggota,
            tanggal_keanggotaan: new Date().toISOString().split("T")[0],
            alamat: reg.alamat,
            rt: reg.rt,
            rw: reg.rw,
            no_telepon: reg.no_telepon,
            email: reg.email,
            pendaftaran: reg.biaya_pendaftaran || 0,
            status: "Aktif",
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Update pendaftaran_pemulasaraan status
        const { error: updateError } = await (supabase
          .from("pendaftaran_pemulasaraan") as any)
          .update({
            status: "approved",
            no_anggota_assigned: newNoAnggota,
            id_anggota_created: (newMember as any).id,
            diproses_pada: new Date().toISOString(),
          })
          .eq("id", reg.id);

        if (updateError) throw updateError;
      }

      toast.success(`Keluarga ${familyName} berhasil disetujui`);
      fetchRegistrations();
      if (onDataChange) onDataChange();
    } catch (e: any) {
      console.error("Error approving registration:", e);
      toast.error(e.message || "Gagal menyetujui pendaftaran");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (members: any[]) => {
    const familyName =
      members[0].nama_kepala_keluarga || members[0].nama_lengkap;
    if (!confirm(`Tolak pendaftaran untuk keluarga ${familyName}?`)) return;

    setIsLoading(true);
    try {
      const memberIds = members.map((m) => m.id);
      const { error } = await (supabase
        .from("pendaftaran_pemulasaraan") as any)
        .update({
          status: "rejected",
          diproses_pada: new Date().toISOString(),
        })
        .in("id", memberIds);

      if (error) throw error;

      toast.success(`Pendaftaran keluarga ${familyName} telah ditolak`);
      fetchRegistrations();
      if (onDataChange) onDataChange();
    } catch (e: any) {
      console.error("Error rejecting registration:", e);
      toast.error("Gagal menolak pendaftaran");
    } finally {
      setIsLoading(false);
    }
  };

  // Group registrations by nama_kepala_keluarga
  const groupedRegistrations = registrations.reduce(
    (acc: { [key: string]: any[] }, reg: any) => {
      const key = reg.nama_kepala_keluarga || "Tanpa Kepala Keluarga";
      if (!acc[key]) acc[key] = [];
      acc[key].push(reg);
      return acc;
    },
    {},
  );

  // Sort members within each group
  Object.keys(groupedRegistrations).forEach((key) => {
    groupedRegistrations[key].sort((a, b) => {
      return getRelationRank(a.hubungan_keluarga) - getRelationRank(b.hubungan_keluarga);
    });
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-slate-900">
          Menunggu Persetujuan
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRegistrations}
          disabled={isLoading}
          className="h-10 sm:h-8 text-slate-500 hover:text-emerald-600"
        >
          Refresh
        </Button>
      </div>

      {registrations.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-slate-200 rounded-2xl bg-slate-50/50 border-dashed">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs font-medium">
                Memuat data pendaftaran...
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="font-bold">Tidak ada pendaftaran baru</p>
              <p className="text-[10px]">Semua permohonan telah diproses.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {Object.entries(groupedRegistrations).map(
            ([kepalaKeluarga, members]: [string, any[]]) => (
              <div
                key={kepalaKeluarga}
                className="border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden transition-all hover:border-slate-200"
              >
                {/* Header Card: Info Keluarga */}
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                        Kepala Keluarga
                      </p>
                      <h4 className="font-bold text-slate-900 leading-none">
                        {kepalaKeluarga}
                      </h4>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                      Alamat
                    </p>
                    <p className="text-xs font-medium text-slate-600 leading-none">
                      RT {members[0].rt}/RW {members[0].rw} •{" "}
                      {members[0].alamat}
                    </p>
                  </div>
                </div>

                {/* List Anggota */}
                <div className="divide-y divide-slate-200">
                  {members.map((reg) => (
                    <div
                      key={reg.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800">
                            {toTitleCase(reg.nama_lengkap)}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase h-4 px-1 border-slate-200 text-slate-500"
                          >
                            {reg.hubungan_keluarga}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="text-[10px] text-slate-500 font-medium">
                            Kontak:{" "}
                            <span className="text-slate-700">
                              {reg.no_telepon || "-"}
                            </span>
                          </p>
                          <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                          <Badge
                            variant="secondary"
                            className="bg-emerald-50 text-emerald-700 border-none text-[9px] h-4 px-1.5 font-bold"
                          >
                            {reg.jenis_anggota}
                          </Badge>
                          <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                          <p className="text-[10px] font-bold text-emerald-600">
                            Rp {reg.biaya_pendaftaran?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Footer: Bulk Actions */}
                <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-2">
                  <p className="text-[10px] font-medium text-slate-400">
                    Total:{" "}
                    <span className="text-slate-900 font-bold">
                      {members.length} Anggota
                    </span>{" "}
                    • Estimasi Biaya:{" "}
                    <span className="text-emerald-600 font-bold">
                      Rp{" "}
                      {members
                        .reduce((sum, m) => sum + (m.biaya_pendaftaran || 0), 0)
                        .toLocaleString()}
                    </span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isLoading}
                      className="h-11 sm:h-8 text-[11px] font-bold text-rose-500 border-rose-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      onClick={() => handleReject(members)}
                    >
                      <X className="w-3 h-3 mr-1" /> Tolak Keluarga
                    </Button>
                    <Button
                      size="sm"
                      disabled={isLoading}
                      className="h-11 sm:h-8 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm px-4"
                      onClick={() => handleApprove(members)}
                    >
                      <Check className="w-3 h-3 mr-1" /> Terima Semua
                    </Button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

// Ensure Button component is available or default to html button
