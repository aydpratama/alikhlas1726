import { useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { FamilyMember } from "@/components/FamilyCard";
import { toTitleCase } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface MemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FamilyMember, "id">) => Promise<void>;
  editingMember: FamilyMember | null;
}

export function MemberDialog({
  isOpen,
  onClose,
  onSubmit,
  editingMember,
}: MemberDialogProps) {
  const [formData, setFormData] = useState<any>({
    no_anggota: "",
    nama_lengkap: "",
    hubungan_keluarga: "Kepala Keluarga",
    jenis_anggota: "Umum",
    tanggal_keanggotaan: new Date().toISOString().split("T")[0],
    alamat: "",
    rt: 1 as number | string,
    rw: 8 as number | string,
    pendaftaran: "" as number | string,
    status: "Aktif",
    no_telepon: "",
  });

  useEffect(() => {
    const fetchNextNo = async () => {
      if (isOpen && !editingMember) {
        const { data, error } = await (supabase
          .from("anggota_pemulasaraan") as any)
          .select("no_anggota");

        const year = new Date().getFullYear();
        let nextNo = `001/PEM/${year}`;

        if (!error && data && (data as any[]).length > 0) {
          const nums = (data as any[])
            .map((d: any) => {
              const basePart = d.no_anggota.split(".")[0];
              const parts = basePart.split("/");
              return parts.length >= 1 ? parseInt(parts[0]) : 0;
            })
            .filter((n) => !isNaN(n));

          const maxNum = nums.length > 0 ? Math.max(...nums) : 0;
          nextNo = `${maxNum + 1}/PEM/${year}`;
        }

        setFormData((prev: any) => ({
          ...prev,
          no_anggota: nextNo,
          nama_lengkap: "",
          hubungan_keluarga: "Kepala Keluarga",
          jenis_anggota: "Umum",
          tanggal_keanggotaan: new Date().toISOString().split("T")[0],
          alamat: "",
          rt: 1 as number | string,
          rw: 8 as number | string,
          pendaftaran: "" as number | string,
          status: "Aktif",
          no_telepon: "",
        }));
      } else if (isOpen && editingMember) {
        setFormData({
          no_anggota: editingMember.no_anggota || "",
          nama_lengkap: editingMember.nama_lengkap || "",
          hubungan_keluarga:
            editingMember.hubungan_keluarga || "Kepala Keluarga",
          jenis_anggota: editingMember.jenis_anggota || "Umum",
          tanggal_keanggotaan:
            editingMember.tanggal_keanggotaan ||
            new Date().toISOString().split("T")[0],
          alamat: editingMember.alamat || "",
          rt: editingMember.rt || 1,
          rw: editingMember.rw || 8,
          pendaftaran: editingMember.pendaftaran || 0,
          status: editingMember.status || "Aktif",
          no_telepon: editingMember.no_telepon || "",
        });
      }
    };

    fetchNextNo();
  }, [editingMember, isOpen]);

  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const submissionData = {
      ...formData,
      rt: typeof formData.rt === "string" ? parseInt(formData.rt) || 0 : formData.rt,
      rw: typeof formData.rw === "string" ? parseInt(formData.rw) || 0 : formData.rw,
      pendaftaran: typeof formData.pendaftaran === "string" ? parseInt(formData.pendaftaran) || 0 : formData.pendaftaran,
    };

    try {
      await onSubmit(submissionData as Omit<FamilyMember, "id">);
      onClose();
    } catch (error) {
      console.error("Error saving member:", error);
      alert("Gagal menyimpan data anggota");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-base font-semibold text-gray-900">
            {editingMember ? "Edit Anggota" : "Tambah Anggota"}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Anggota *
              </label>
              <input
                type="text"
                value={formData.no_anggota}
                onChange={(e) =>
                  setFormData({ ...formData, no_anggota: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.nama_lengkap}
                onChange={(e) =>
                  setFormData({ ...formData, nama_lengkap: toTitleCase(e.target.value) })
                }
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              />
            </div>
          </div>
          {/* ... other fields ... */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hubungan Keluarga
              </label>
              <select
                value={formData.hubungan_keluarga}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hubungan_keluarga: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              >
                <option value="Kepala Keluarga">Kepala Keluarga</option>
                <option value="Istri">Istri</option>
                <option value="Anak">Anak</option>
                <option value="Anggota">Anggota</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Anggota
              </label>
              <select
                value={formData.jenis_anggota}
                onChange={(e) =>
                  setFormData({ ...formData, jenis_anggota: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              >
                <option value="Tetap">Tetap</option>
                <option value="Tetap Tambahan">Tetap Tambahan</option>
                <option value="Umum">Umum</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <input
              type="text"
              value={formData.alamat}
              onChange={(e) =>
                setFormData({ ...formData, alamat: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RT
              </label>
              <input
                type="number"
                value={formData.rt}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rt: e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RW
              </label>
              <input
                type="number"
                value={formData.rw}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rw: e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pendaftaran
              </label>
              <input
                type="number"
                value={formData.pendaftaran}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pendaftaran: e.target.value === "" ? "" : parseInt(e.target.value) || 0,
                  })
                }
                min="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Keanggotaan
              </label>
              <input
                type="date"
                value={formData.tanggal_keanggotaan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tanggal_keanggotaan: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              >
                <option value="Aktif">Aktif</option>
                <option value="Pindah">Pindah</option>
                <option value="Meninggal dunia">Meninggal dunia</option>
                <option value="Mengundurkan diri">Mengundurkan diri</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Telepon
            </label>
            <input
              type="text"
              value={formData.no_telepon}
              onChange={(e) =>
                setFormData({ ...formData, no_telepon: e.target.value })
              }
              placeholder="Contoh: 08123456789"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 px-4 border border-slate-200 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={isSaving}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 h-11 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                "Menyimpan..."
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {editingMember ? "Update" : "Simpan"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
