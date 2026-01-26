"use client";

import {
  GraduationCap,
  HeartHandshake,
  Users,
  Briefcase,
  Building2,
  BookOpen,
  HandCoins,
  Home,
  Users2,
  Settings2,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Loader2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { MosqueIcon } from "@/components/MosqueIcon";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

// Icon mapping for Lucide
const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  HeartHandshake,
  Users,
  Briefcase,
  Building2,
  BookOpen,
  HandCoins,
  Home,
  Users2,
};

interface Member {
  id?: string;
  name: string;
  role?: string;
  initials?: string;
}

interface SubSection {
  id?: string;
  title: string;
  members: Member[];
}

interface TeamCard {
  id?: string;
  title: string;
  subtitle: string;
  icon: string | React.ElementType;
  color: string;
  coordinator?: Member;
  coordinator_name?: string;
  coordinator_role?: string;
  subSections: SubSection[];
  highlightMode?: boolean;
  highlight_mode?: boolean;
  order_index?: number;
}

const organizationData = {
  title: "Struktur Organisasi",
  subtitle: "Masjid Al-Ikhlas RT.001/RW.017 & 026 Kayuringinjaya",
  documentNumber: "Nomor: 008/DKM-AL-IKHLAS/05/2024",
};

const colorConfig = {
  green: {
    bg: "bg-white",
    text: "text-green-600",
    iconBg: "bg-green-50",
    iconText: "text-green-600",
    border: "border-[#f3f4f6]",
    decorative: "bg-green-500/5",
    coordinatorBg: "bg-[#F5F7F5]",
    badge: "bg-green-600",
  },
  yellow: {
    bg: "bg-white",
    text: "text-yellow-700",
    iconBg: "bg-yellow-50",
    iconText: "text-yellow-700",
    border: "border-[#f3f4f6]",
    decorative: "bg-yellow-400/5",
    coordinatorBg: "bg-[#FEFBF5]",
    badge: "bg-yellow-600",
  },
  blue: {
    bg: "bg-white",
    text: "text-blue-600",
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    border: "border-[#f3f4f6]",
    decorative: "bg-blue-500/5",
    coordinatorBg: "bg-[#F0F5FF]",
    badge: "bg-blue-600",
  },
  purple: {
    bg: "bg-white",
    text: "text-purple-600",
    iconBg: "bg-purple-50",
    iconText: "text-purple-600",
    border: "border-[#f3f4f6]",
    decorative: "bg-purple-500/5",
    coordinatorBg: "bg-[#F5F3FF]",
    badge: "bg-purple-600",
  },
  red: {
    bg: "bg-white",
    text: "text-red-600",
    iconBg: "bg-red-50",
    iconText: "text-red-600",
    border: "border-[#f3f4f6]",
    decorative: "bg-red-500/5",
    coordinatorBg: "bg-[#FEF2F2]",
    badge: "bg-red-600",
  },
  indigo: {
    bg: "bg-white",
    text: "text-indigo-600",
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
    border: "border-[#f3f4f6]",
    decorative: "bg-indigo-500/5",
    coordinatorBg: "bg-[#EEF2FF]",
    badge: "bg-indigo-600",
  },
  teal: {
    bg: "bg-white",
    text: "text-teal-600",
    iconBg: "bg-teal-50",
    iconText: "text-teal-600",
    border: "border-[#f3f4f6]",
    decorative: "bg-teal-500/5",
    coordinatorBg: "bg-[#F0FDFA]",
    badge: "bg-teal-600",
  },
  orange: {
    bg: "bg-white",
    text: "text-orange-600",
    iconBg: "bg-orange-50",
    iconText: "text-orange-600",
    border: "border-[#f3f4f6]",
    decorative: "bg-orange-500/5",
    coordinatorBg: "bg-[#FFF7ED]",
    badge: "bg-orange-600",
  },
  pink: {
    bg: "bg-white",
    text: "text-pink-600",
    iconBg: "bg-pink-50",
    iconText: "text-pink-600",
    border: "border-[#f3f4f6]",
    decorative: "bg-pink-500/5",
    coordinatorBg: "bg-[#FDF2F8]",
    badge: "bg-pink-600",
  },
};

function getAvatarColor(name: string): { bg: string; text: string } {
  const colors = [
    { bg: "bg-gray-200", text: "text-gray-500" },
    { bg: "bg-pink-50", text: "text-pink-600" },
    { bg: "bg-indigo-50", text: "text-indigo-600" },
    { bg: "bg-teal-50", text: "text-teal-600" },
    { bg: "bg-green-50", text: "text-green-600" },
    { bg: "bg-blue-50", text: "text-blue-600" },
    { bg: "bg-purple-50", text: "text-purple-600" },
    { bg: "bg-orange-50", text: "text-orange-600" },
  ];

  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function MemberAvatar({
  member,
  size = "default",
}: {
  member: Member;
  size?: "default" | "large";
}) {
  const colors = getAvatarColor(member.name);
  const initials =
    member.initials ||
    member.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const sizeClasses = size === "large" ? "h-16 w-16" : "h-10 w-10";

  return (
    <div
      className={`${colors.bg} ${colors.text} ${sizeClasses} rounded-full flex items-center justify-center font-bold text-sm shrink-0`}
    >
      {initials}
    </div>
  );
}

function CoordinatorHighlight({
  member,
  config,
  showBadge = true,
  centered = false,
}: {
  member: Member;
  config: any;
  showBadge?: boolean;
  centered?: boolean;
}) {
  return (
    <div
      className={`${config.coordinatorBg} rounded-xl p-4 border border-[#f3f4f6] ${centered ? "flex flex-col items-center text-center" : "flex items-center"} gap-4 transition-transform active:scale-[0.99]`}
    >
      <MemberAvatar member={member} />
      <div className={`${centered ? "" : "flex-1 min-w-0"} leading-tight`}>
        <div
          className={`${centered ? "flex flex-col items-center" : "flex justify-between items-start"}`}
        >
          <div>
            {showBadge && (
              <span
                className={`${config.badge} text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mb-1`}
              >
                {member.role}
              </span>
            )}
            <h4 className="text-gray-900 text-base font-bold truncate">
              {member.name}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberListItem({ member }: { member: Member }) {
  return (
    <div className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors group/item">
      <div className="flex items-center gap-3 overflow-hidden">
        <MemberAvatar member={member} />
        <p className="text-gray-800 text-sm font-medium truncate">
          {member.name}
        </p>
      </div>
    </div>
  );
}

function SectionDivider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="h-px flex-1 bg-gray-200"></span>
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {text}
      </span>
      <span className="h-px flex-1 bg-gray-200"></span>
    </div>
  );
}

function TeamCard({
  team,
  isManageMode,
  onEdit,
}: {
  team: TeamCard;
  isManageMode?: boolean;
  onEdit?: (team: TeamCard) => void;
}) {
  const config =
    colorConfig[team.color as keyof typeof colorConfig] || colorConfig.blue;
  const Icon =
    typeof team.icon === "string" ? iconMap[team.icon] || Users : team.icon;

  return (
    <div
      className={`${config.bg} rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-5 border ${config.border} relative overflow-hidden group h-full flex flex-col`}
    >
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 ${config.decorative} rounded-full blur-2xl group-hover:${config.text}/10 transition-colors duration-500`}
      ></div>

      <div className="flex flex-col items-center gap-3 mb-6 relative z-10 text-center">
        <div className="flex justify-between w-full items-start">
          <div className="w-10" /> {/* Spacer */}
          <div className={`${config.iconBg} p-2 rounded-xl ${config.iconText}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="w-10 flex justify-end">
            {isManageMode && onEdit && (
              <button
                onClick={() => onEdit(team)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="leading-tight">
          <h3 className="text-lg font-bold text-gray-900">{team.title}</h3>
          <p className={`text-xs ${config.text} font-medium`}>
            {team.subtitle}
          </p>
        </div>
      </div>

      {team.coordinator && (
        <div className="relative z-10 mb-6">
          <CoordinatorHighlight member={team.coordinator} config={config} />
        </div>
      )}

      <div className="relative z-10 space-y-4 flex-1">
        {team.subSections?.map((subSection, idx) => (
          <div key={subSection.id || idx}>
            {subSection.title && <SectionDivider text={subSection.title} />}
            <div className="space-y-3">
              {subSection.members?.map((member, memberIdx) =>
                team.highlightMode ? (
                  <CoordinatorHighlight
                    key={member.id || memberIdx}
                    member={{ ...member, role: subSection.title }}
                    config={config}
                    showBadge={false}
                    centered={false}
                  />
                ) : (
                  <MemberListItem
                    key={member.id || memberIdx}
                    member={member}
                  />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManageModal({
  team,
  teamsCount,
  onClose,
  onSave,
}: {
  team: TeamCard | null;
  teamsCount: number;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState<any>(
    team || {
      title: "",
      subtitle: "",
      icon: "Users",
      color: "blue",
      highlight_mode: false,
      coordinator_name: "",
      coordinator_role: "",
      subSections: [],
    },
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    try {
      setIsSaving(true);

      // Prepare clean team data
      const teamData = {
        title: formData.title,
        subtitle: formData.subtitle,
        icon: formData.icon,
        color: formData.color,
        highlight_mode: formData.highlight_mode || false,
        coordinator_name: formData.coordinator_name,
        coordinator_role: formData.coordinator_role,
        order_index: team?.order_index ?? teamsCount,
      };

      let teamId = team?.id;

      // 1. Save Team
      if (teamId) {
        const { error: teamError } = await supabase
          .from("org_teams")
          .update(teamData)
          .eq("id", teamId);
        if (teamError) throw teamError;
      } else {
        const { data, error: teamError } = await supabase
          .from("org_teams")
          .insert(teamData)
          .select()
          .single();
        if (teamError) throw teamError;
        teamId = data.id;
      }

      // 2. Save Subsections & Members
      if (teamId) {
        // First, get all subsection IDs for this team to delete members
        const { data: oldSubsections } = await supabase
          .from("org_subsections")
          .select("id")
          .eq("team_id", teamId);

        if (oldSubsections && oldSubsections.length > 0) {
          const ssIds = oldSubsections.map((s) => s.id);
          // Delete members first to avoid FK constraint issues
          const { error: mDelError } = await supabase
            .from("org_members")
            .delete()
            .in("subsection_id", ssIds);
          if (mDelError) {
            console.error("Error deleting old members:", mDelError);
            throw mDelError;
          }
        }

        // Now delete subsections
        const { error: ssDelError } = await supabase
          .from("org_subsections")
          .delete()
          .eq("team_id", teamId);

        if (ssDelError) {
          console.error("Error deleting old subsections:", ssDelError);
          throw ssDelError;
        }

        for (let i = 0; i < (formData.subSections || []).length; i++) {
          const ss = formData.subSections[i];
          const { data: ssData, error: ssError } = await supabase
            .from("org_subsections")
            .insert({
              team_id: teamId,
              title: ss.title,
              order_index: i,
            })
            .select()
            .single();

          if (ssError) throw ssError;

          if (ssData && ss.members?.length > 0) {
            const membersToInsert = ss.members
              .filter((m: any) => m.name.trim() !== "")
              .map((m: any, mIdx: number) => ({
                subsection_id: ssData.id,
                name: m.name,
                order_index: mIdx,
              }));

            if (membersToInsert.length > 0) {
              const { error: mError } = await supabase
                .from("org_members")
                .insert(membersToInsert);
              if (mError) throw mError;
            }
          }
        }
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving team:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        error: error,
      });
      alert(`Gagal menyimpan data: ${error.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  }

  function addSubSection() {
    setFormData({
      ...formData,
      subSections: [...formData.subSections, { title: "", members: [] }],
    });
  }

  function removeSubSection(idx: number) {
    const newSS = [...formData.subSections];
    newSS.splice(idx, 1);
    setFormData({ ...formData, subSections: newSS });
  }

  function addMember(ssIdx: number) {
    const newSS = [...formData.subSections];
    newSS[ssIdx].members = [...newSS[ssIdx].members, { name: "" }];
    setFormData({ ...formData, subSections: newSS });
  }

  function removeMember(ssIdx: number, mIdx: number) {
    const newSS = [...formData.subSections];
    newSS[ssIdx].members.splice(mIdx, 1);
    setFormData({ ...formData, subSections: newSS });
  }

  function updateMember(ssIdx: number, mIdx: number, name: string) {
    const newSS = [...formData.subSections];
    newSS[ssIdx].members[mIdx].name = name;
    setFormData({ ...formData, subSections: newSS });
  }

  function updateSubSectionTitle(ssIdx: number, title: string) {
    const newSS = [...formData.subSections];
    newSS[ssIdx].title = title;
    setFormData({ ...formData, subSections: newSS });
  }

  async function handleDelete() {
    if (!team?.id || !confirm("Hapus tim ini?")) return;
    try {
      setIsSaving(true);
      await supabase.from("org_teams").delete().eq("id", team.id);
      onSave();
      onClose();
    } catch (error) {
      console.error("Error deleting team:", error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900">
            {team ? "Edit Tim" : "Tambah Tim Baru"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
              Informasi Dasar
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nama Tim (ID)
                </label>
                <input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Penasihat"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Subtitle (EN)
                </label>
                <input
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Advisors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Warna
                </label>
                <select
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.keys(colorConfig).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.keys(iconMap).map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                id="highlight_mode"
                checked={formData.highlight_mode}
                onChange={(e) =>
                  setFormData({ ...formData, highlight_mode: e.target.checked })
                }
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="highlight_mode"
                className="text-sm font-medium text-gray-700"
              >
                Highlight Mode (Gunakan card besar untuk anggota)
              </label>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4">
              Koordinator (Opsional)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Nama Koordinator
                </label>
                <input
                  value={formData.coordinator_name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinator_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Jabatan Koordinator
                </label>
                <input
                  value={formData.coordinator_role || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coordinator_role: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider">
                Subseksi & Anggota
              </h4>
              <button
                onClick={addSubSection}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Tambah Subseksi
              </button>
            </div>

            <div className="space-y-6">
              {formData.subSections.map((ss: any, ssIdx: number) => (
                <div
                  key={ssIdx}
                  className="bg-gray-50 rounded-2xl p-4 border border-slate-200 relative group/ss"
                >
                  <button
                    onClick={() => removeSubSection(ssIdx)}
                    className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover/ss:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="mb-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                      Judul Subseksi
                    </label>
                    <input
                      value={ss.title}
                      onChange={(e) =>
                        updateSubSectionTitle(ssIdx, e.target.value)
                      }
                      className="w-full bg-transparent border-b border-slate-200 py-1 font-bold text-gray-800 focus:border-blue-500 outline-none"
                      placeholder="Contoh: Sekretaris"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                      Daftar Anggota
                    </label>
                    {ss.members?.map((m: any, mIdx: number) => (
                      <div key={mIdx} className="flex gap-2 items-center">
                        <input
                          value={m.name}
                          onChange={(e) =>
                            updateMember(ssIdx, mIdx, e.target.value)
                          }
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Nama Anggota"
                        />
                        <button
                          onClick={() => removeMember(ssIdx, mIdx)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addMember(ssIdx)}
                      className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Tambah Anggota
                    </button>
                  </div>
                </div>
              ))}

              {formData.subSections.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-gray-400 text-sm">Belum ada subseksi.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-slate-200 flex justify-between gap-3">
          {team && (
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="px-6 py-2 bg-white text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 bg-white text-gray-600 border border-slate-200 rounded-xl font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InfoPage() {
  const [teams, setTeams] = useState<TeamCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManageMode, setIsManageMode] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamCard | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  function handleToggleManage() {
    if (isManageMode) {
      setIsManageMode(false);
      return;
    }

    if (isAuthorized) {
      setIsManageMode(true);
      return;
    }

    const pass = window.prompt("Masukkan kata sandi pengurus:");
    if (pass === "alikhlas2026") {
      setIsAuthorized(true);
      setIsManageMode(true);
    } else if (pass !== null) {
      alert("Kata sandi salah!");
    }
  }

  async function fetchData() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("org_teams")
        .select(
          `
          *,
          subSections:org_subsections(
            *,
            members:org_members(*)
          )
        `,
        )
        .order("order_index");

      if (error) throw error;

      const sortedData =
        data?.map((team: any) => ({
          ...team,
          highlightMode: team.highlight_mode,
          coordinator: team.coordinator_name
            ? {
                name: team.coordinator_name,
                role: team.coordinator_role,
              }
            : undefined,
          subSections: team.subSections
            ?.sort(
              (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0),
            )
            .map((ss: any) => ({
              ...ss,
              members: ss.members?.sort(
                (a: any, b: any) => (a.order_index || 0) - (b.order_index || 0),
              ),
            })),
        })) || [];

      setTeams(sortedData);
    } catch (error) {
      console.error("Error fetching org data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfc]">
      <Header />
      <div className="relative w-full h-64 md:h-96 overflow-hidden">
        <img
          src="/alikhlas_luar.png"
          alt="Masjid Al-Ikhlas"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

        {/* Manage Toggle */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleToggleManage}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-lg ${
              isManageMode
                ? "bg-blue-600 text-white"
                : "bg-white/90 backdrop-blur text-gray-700 hover:bg-white"
            }`}
          >
            <Settings2
              className={`w-4 h-4 ${isManageMode ? "animate-spin-slow" : ""}`}
            />
            {isManageMode ? "Keluar Kelola" : "Kelola Struktur"}
          </button>
          {isManageMode && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Tambah Tim
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 py-8 w-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-sm">
            <MosqueIcon className="w-10 h-10" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
            {organizationData.title}
          </h1>
          <p className="text-gray-600 text-lg">{organizationData.subtitle}</p>
          <p className="text-gray-400 text-sm mt-2 font-mono">
            {organizationData.documentNumber}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <p className="text-gray-500 font-medium">Memuat data struktur...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isManageMode={isManageMode}
                onEdit={(t) => setEditingTeam(t)}
              />
            ))}
          </div>
        )}
      </div>

      {(editingTeam || showAddModal) && (
        <ManageModal
          team={editingTeam}
          teamsCount={teams.length}
          onClose={() => {
            setEditingTeam(null);
            setShowAddModal(false);
          }}
          onSave={fetchData}
        />
      )}
    </div>
  );
}
