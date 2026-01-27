"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  Clock,
  FileText,
  History,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { format, differenceInHours, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { LeaveType, LeaveRequest, LeaveBalance } from "@/types/leave";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const MOCK_USER_ID = 1; // Temporary mock until auth is integrated

export default function LeaveManagementClient() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    leaveTypeId: 1, // Default to Cuti Tahunan (ID: 1)
    employeeName: "",
    jabatan: "",
    alamatKaryawan: "",
    reason: "",
    startAt: "",
    endAt: "",
    durationDays: "",
    replacementName: "",
    addressDuringLeave: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [typesRes, requestsRes, balanceRes] = await Promise.all([
        (supabase.from("leave_types") as any).select("*").order("id"),
        (supabase
          .from("leave_requests") as any)
          .select("*, leave_types(*)")
          .eq("user_id", MOCK_USER_ID)
          .order("created_at", { ascending: false }),
        (supabase
          .from("leave_balances") as any)
          .select("*")
          .eq("user_id", MOCK_USER_ID)
          .eq("year", new Date().getFullYear())
          .single(),
      ]);

      if (typesRes.data) setLeaveTypes(typesRes.data);
      if (requestsRes.data) setRequests(requestsRes.data);

      if (balanceRes.data) {
        setBalance(balanceRes.data);
      } else {
        // Initialize balance if not exists
        const newBalance = {
          user_id: MOCK_USER_ID,
          year: new Date().getFullYear(),
          total_quota_hours: 576, // 24 days * 24h
          used_hours: 0,
          remaining_hours: 576,
        };
        const { data } = await (supabase
          .from("leave_balances") as any)
          .insert(newBalance)
          .select()
          .single();
        if (data) setBalance(data);
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (
      !formData.employeeName ||
      !formData.jabatan ||
      !formData.reason ||
      !formData.startAt ||
      !formData.endAt ||
      !formData.durationDays
    ) {
      return "Mohon lengkapi kolom wajib (Nama, Jabatan, Tanggal, Durasi, dan Alasan)";
    }

    const days = Number(formData.durationDays);
    if (isNaN(days) || days <= 0) {
      return "Durasi harus berupa angka positif";
    }

    const selectedType = leaveTypes.find((t) => t.id === formData.leaveTypeId);
    if (
      selectedType?.is_deductible &&
      balance &&
      days * 24 > balance.remaining_hours
    ) {
      return "Durasi cuti melebihi sisa kuota Anda";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: submitError } = await (supabase
        .from("leave_requests") as any)
        .insert({
          user_id: MOCK_USER_ID,
          leave_type_id: formData.leaveTypeId,
          employee_name: formData.employeeName,
          jabatan: formData.jabatan,
          alamat_karyawan: formData.alamatKaryawan,
          reason: formData.reason,
          start_at: formData.startAt,
          end_at: formData.endAt,
          duration_days: Number(formData.durationDays),
          duration_hours: Number(formData.durationDays) * 24,
          replacement_name: formData.replacementName,
          address_during_leave: formData.addressDuringLeave,
          status: "diajukan",
        });

      if (submitError) throw submitError;

      setFormData({
        leaveTypeId: 1,
        employeeName: "",
        jabatan: "",
        alamatKaryawan: "",
        reason: "",
        startAt: "",
        endAt: "",
        durationDays: "",
        replacementName: "",
        addressDuringLeave: "",
      });
      setIsDialogOpen(false);
      fetchData();
      alert("Pengajuan cuti berhasil dikirim!");
    } catch (error) {
      console.error("Error submitting leave request:", error);
      alert("Gagal mengirim pengajuan cuti");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disetujui":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
            Disetujui
          </Badge>
        );
      case "ditolak":
        return (
          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200">
            Ditolak
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
            Diajukan
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-medium">Memuat data cuti...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Total Kuota Tahunan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">24 Hari</div>
            <p className="text-xs text-slate-400 mt-1">
              Tahun {new Date().getFullYear()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Cuti Digunakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {(balance ? balance.used_hours / 24 : 0).toFixed(1)} Hari
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {balance ? balance.used_hours : 0} Jam
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-emerald-50/30 border-emerald-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 uppercase tracking-wider">
              Sisa Kuota
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {(balance ? balance.remaining_hours / 24 : 0).toFixed(1)} Hari
            </div>
            <p className="text-xs text-emerald-600/70 mt-1">
              {balance ? balance.remaining_hours : 0} Jam Tersisa
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Formulir Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href="/Form Cuti.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Unduh Form Cuti
            </a>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Format PDF
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions & History */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-200 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Riwayat Pengajuan</CardTitle>
            <CardDescription>Daftar pengajuan cuti Anda</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full gap-2">
                <Plus className="w-4 h-4" />
                Ajukan Cuti
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Form Pengajuan Cuti</DialogTitle>
                  <DialogDescription>
                    Lengkapi data di bawah ini untuk mengajukan permohonan cuti.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6 text-sm">
                  {/* Recipient Section */}
                  <div className="space-y-1 text-slate-600 font-medium">
                    <p>Kepada Yth,</p>
                    <p className="text-slate-900 font-bold">
                      Ketua DKM Bapak Adnan Brawijaya
                    </p>
                    <p>Di Tempat</p>
                  </div>

                  <div className="space-y-4">
                    <p className="font-medium">
                      Dengan Hormat, Yang bertanda tangan dibawah ini :
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-slate-200">
                      <div className="grid gap-1.5">
                        <Label htmlFor="employeeName">Nama</Label>
                        <Input
                          id="employeeName"
                          placeholder="Nama Lengkap"
                          className="border-slate-200"
                          value={formData.employeeName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              employeeName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="jabatan">Jabatan</Label>
                        <Input
                          id="jabatan"
                          placeholder="Jabatan"
                          className="border-slate-200"
                          value={formData.jabatan}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              jabatan: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-1.5 md:col-span-2">
                        <Label htmlFor="alamatKaryawan">Alamat</Label>
                        <Input
                          id="alamatKaryawan"
                          placeholder="Alamat Lengkap"
                          className="border-slate-200"
                          value={formData.alamatKaryawan}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              alamatKaryawan: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap items-center gap-2 leading-relaxed">
                        <span>
                          Dengan ini mohon kiranya kami dapat diberikan
                          kesempatan menggunakan hak
                        </span>
                        <span className="font-bold text-slate-900 underline decoration-slate-200 underline-offset-4">
                          cuti
                        </span>
                        <span>saya mulai tanggal</span>
                        <Input
                          type="date"
                          className="w-40 h-9 border-slate-200"
                          value={formData.startAt}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              startAt: e.target.value,
                            })
                          }
                        />
                        <span>s.d tanggal</span>
                        <Input
                          type="date"
                          className="w-40 h-9 border-slate-200"
                          value={formData.endAt}
                          onChange={(e) =>
                            setFormData({ ...formData, endAt: e.target.value })
                          }
                        />
                        <span>selama</span>
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            placeholder="0"
                            className="w-16 h-9 text-center border-slate-200"
                            value={formData.durationDays}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                durationDays: e.target.value,
                              })
                            }
                          />
                          <span>hari,</span>
                        </div>
                        <span>yang akan kami pergunakan untuk</span>
                        <Input
                          placeholder="..."
                          className="flex-1 min-w-[200px] h-9 border-slate-200"
                          value={formData.reason}
                          onChange={(e) =>
                            setFormData({ ...formData, reason: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 leading-relaxed">
                        <span>
                          Adapun sebagai pengganti selama saya cuti adalah
                        </span>
                        <Input
                          placeholder="Nama pengganti"
                          className="w-64 h-9 border-slate-200"
                          value={formData.replacementName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              replacementName: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 leading-relaxed">
                        <span>Dan alamat kami selama cuti di</span>
                        <Input
                          placeholder="Alamat selama cuti"
                          className="flex-1 min-w-[300px] h-9 border-slate-200"
                          value={formData.addressDuringLeave}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              addressDuringLeave: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <p className="pt-2">
                      Atas terkabulnya permohonan ini kami ucapkan terima kasih.
                    </p>

                    <div className="pt-6 flex flex-col items-end gap-1">
                      <p>
                        Bekasi,{" "}
                        {format(new Date(), "dd MMMM yyyy", {
                          locale: localeId,
                        })}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-10 pt-4 text-center">
                      <div className="space-y-16">
                        <p className="font-medium">Mengetujui,</p>
                        <div className="space-y-0.5">
                          <p className="font-bold underline text-slate-900">
                            Adnan Brawijaya
                          </p>
                          <p className="text-xs text-slate-500 uppercase tracking-wider">
                            Ketua
                          </p>
                        </div>
                      </div>
                      <div className="space-y-16">
                        <p className="font-medium">Yang mengajukan,</p>
                        <div className="space-y-0.5">
                          <p className="font-bold underline text-slate-900">
                            {formData.employeeName || "................."}
                          </p>
                          <p className="text-xs text-slate-500 uppercase tracking-wider invisible">
                            Staff
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Pengajuan"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <History className="w-12 h-12 text-slate-200 mb-3" />
              <h3 className="text-slate-900 font-bold">Belum ada pengajuan</h3>
              <p className="text-slate-500 text-sm max-w-[250px] mt-1">
                Pengajuan cuti Anda akan muncul di sini setelah dikirim.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 sm:p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          request.status === "disetujui"
                            ? "bg-emerald-50 text-emerald-600"
                            : request.status === "ditolak"
                              ? "bg-rose-50 text-rose-600"
                              : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {request.status === "disetujui" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : request.status === "ditolak" ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900">
                            {request.leave_types?.name || "Jenis Cuti"}
                          </h4>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-1">
                          {request.reason}
                        </p>
                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(parseISO(request.start_at), "dd MMM yyyy", {
                              locale: localeId,
                            })}
                          </div>
                          <ArrowRight className="w-3 h-3" />
                          <div className="flex items-center gap-1">
                            {format(parseISO(request.end_at), "dd MMM yyyy", {
                              locale: localeId,
                            })}
                          </div>
                        </div>
                        {(request.replacement_name ||
                          request.address_during_leave) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                            {request.replacement_name && (
                              <p className="text-[10px] text-slate-500">
                                <span className="font-bold uppercase tracking-tighter mr-1">
                                  Pengganti:
                                </span>
                                {request.replacement_name}
                              </p>
                            )}
                            {request.address_during_leave && (
                              <p className="text-[10px] text-slate-500">
                                <span className="font-bold uppercase tracking-tighter mr-1">
                                  Lokasi:
                                </span>
                                {request.address_during_leave}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 shrink-0">
                      <div className="text-lg font-bold text-slate-900">
                        {request.duration_days ||
                          (request.duration_hours / 24).toFixed(0)}{" "}
                        Hari
                      </div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {request.duration_hours} Jam
                      </div>
                    </div>
                  </div>
                  {request.admin_note && (
                    <div className="mt-4 p-3 bg-slate-100 rounded-lg border border-slate-200 flex gap-2 items-start">
                      <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Catatan Admin
                        </p>
                        <p className="text-xs text-slate-700">
                          {request.admin_note}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-emerald-100 bg-emerald-50/20 shadow-none">
        <CardContent className="p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-900">
              Ketentuan Cuti
            </h4>
            <ul className="text-xs text-emerald-700 space-y-1 list-disc ml-4">
              <li>Lengkapi seluruh kolom pada form surat permohonan cuti.</li>
              <li>Kuota cuti tahunan diberikan sebanyak 24 hari per tahun.</li>
              <li>
                Pengajuan cuti yang memotong kuota akan otomatis mengurangi sisa
                kuota setelah disetujui admin.
              </li>
              <li>
                Pastikan mengajukan cuti minimal 3 hari sebelum tanggal mulai.
              </li>
              <li>
                Wajib melampirkan{" "}
                <a
                  href="/Form Cuti.pdf"
                  target="_blank"
                  className="font-bold underline hover:text-emerald-800"
                >
                  Form Cuti fisik
                </a>{" "}
                yang telah ditandatangani jika diminta oleh admin.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
