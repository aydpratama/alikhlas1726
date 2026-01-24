"use client";

import {
  GraduationCap,
  HeartHandshake,
  Users,
  Briefcase,
  Building2,
  BookOpen,
  HandCoins,
  Heart,
  Home,
  Users2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { MosqueIcon } from "@/components/MosqueIcon";

interface Member {
  name: string;
  role?: string;
  initials?: string;
}

interface SubSection {
  title: string;
  members: Member[];
}

interface TeamCard {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  coordinator?: Member;
  subSections: SubSection[];
  highlightMode?: boolean;
}

const organizationData = {
  title: "Struktur Organisasi",
  subtitle: "Masjid Al-Ikhlas RT.001/RW.017 & 026 Kayuringinjaya",
  documentNumber: "Nomor: 008/DKM-AL-IKHLAS/05/2024",
};

const teams: TeamCard[] = [
  {
    title: "Penasihat",
    subtitle: "Advisors",
    icon: Users,
    color: "blue",
    highlightMode: true,
    subSections: [
      {
        title: "Ketua RW 17",
        members: [{ name: "Ketua RW 17" }],
      },
      {
        title: "Ketua RW 26",
        members: [{ name: "Ketua RW 26" }],
      },
      {
        title: "Penasihat",
        members: [{ name: "DR. Mardishaf Ramli" }],
      },
    ],
  },
  {
    title: "Pembina",
    subtitle: "Supervisors",
    icon: Building2,
    color: "purple",
    highlightMode: true,
    subSections: [
      {
        title: "Pembina",
        members: [
          { name: "Mulyadi Ruslin" },
          { name: "Suyitno" },
          { name: "Heri Wahyudi" },
        ],
      },
    ],
  },
  {
    title: "Pimpinan Utama",
    subtitle: "Main Leadership",
    icon: Briefcase,
    color: "red",
    highlightMode: true,
    subSections: [
      {
        title: "Ketua",
        members: [{ name: "Adnan Brawijaya" }],
      },
      {
        title: "Sekertaris Umum",
        members: [{ name: "Kamiso" }],
      },
      {
        title: "Bendahara Umum",
        members: [{ name: "Sepyan Uhyandi" }],
      },
      {
        title: "Korbid Ibadah",
        members: [{ name: "Karimul A'la" }],
      },
      {
        title: "Korbid Jama'ah",
        members: [{ name: "Budiyono" }],
      },
    ],
  },
  {
    title: "Sekretaris Umum",
    subtitle: "General Secretariat",
    icon: BookOpen,
    color: "indigo",
    coordinator: { name: "Kamiso", role: "Ketua Korbid" },
    subSections: [
      {
        title: "Sekretaris",
        members: [
          { name: "Devi Irmawan" },
          { name: "Hafidz" },
          { name: "Teguh" },
        ],
      },
      {
        title: "Rumah Tangga",
        members: [{ name: "Setiawan" }, { name: "Sudiat" }],
      },
      {
        title: "Pemulasaraan",
        members: [{ name: "Imam Mahmudi" }],
      },
    ],
  },
  {
    title: "Tim Pemulasaraan",
    subtitle: "Funeral Service Team",
    icon: HeartHandshake,
    color: "green",
    coordinator: { name: "Kamiso", role: "Koordinator" },
    subSections: [
      {
        title: "Bidang",
        members: [{ name: "Imam Mahmudi" }],
      },
      {
        title: "Sekretaris",
        members: [{ name: "Edi Prawoko" }],
      },
      {
        title: "Bendahara",
        members: [{ name: "Sudiat" }],
      },
      {
        title: "Anggota Tim Laki-Laki",
        members: [
          { name: "M. Amin" },
          { name: "Mahmud" },
          { name: "Eko R" },
          { name: "Joko Sriyanto" },
          { name: "Giyanto" },
        ],
      },
      {
        title: "Anggota Tim Perempuan",
        members: [
          { name: "Enung" },
          { name: "Muslimah" },
          { name: "Rahayu Reni" },
          { name: "Ratih Heri" },
        ],
      },
    ],
  },
  {
    title: "Bendahara Umum",
    subtitle: "General Treasury",
    icon: HandCoins,
    color: "yellow",
    coordinator: { name: "Sepyan Uhyandi", role: "Ketua Korbid" },
    subSections: [
      {
        title: "Bendahara",
        members: [{ name: "Wagiono" }],
      },
      {
        title: "Sosial",
        members: [{ name: "Bu Acha R Suksenda" }],
      },
    ],
  },
  {
    title: "Korbid Ibadah/Dakwah",
    subtitle: "Worship & Da'wah Division",
    icon: Home,
    color: "teal",
    coordinator: { name: "Karimul A'la", role: "Ketua Korbid" },
    subSections: [
      {
        title: "Ibadah Reguler",
        members: [{ name: "Zainal A" }],
      },
      {
        title: "Ramadhan",
        members: [{ name: "Nanang" }],
      },
      {
        title: "Qurban",
        members: [{ name: "Endang Suranata" }],
      },
      {
        title: "MTKI",
        members: [{ name: "Hj Enung Sepyan" }],
      },
      {
        title: "MTKA",
        members: [{ name: "qhofar" }, { name: "Yudi" }],
      },
    ],
  },
  {
    title: "Korbid Jama'ah",
    subtitle: "Congregation Division",
    icon: Users2,
    color: "orange",
    coordinator: { name: "Budiyono", role: "Ketua Korbid" },
    subSections: [
      {
        title: "PHBI",
        members: [{ name: "Haris Priyono" }],
      },
      {
        title: "IRMA",
        members: [{ name: "Faiz" }],
      },
      {
        title: "ZIS",
        members: [{ name: "Eko Rahmadi" }],
      },
      {
        title: "TPQ",
        members: [{ name: "Hapidin" }, { name: "Anis" }],
      },
    ],
  },
  {
    title: "Tim Guru",
    subtitle: "Teacher Team",
    icon: GraduationCap,
    color: "pink",
    subSections: [
      {
        title: "Tim Guru TPQ - Kepala",
        members: [{ name: "Anis" }],
      },
      {
        title: "Anggota",
        members: [{ name: "Yuyun" }, { name: "Nisa" }, { name: "Halimah" }],
      },
    ],
  },
];

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

function TeamCard({ team }: { team: TeamCard }) {
  const config = colorConfig[team.color as keyof typeof colorConfig];
  const Icon = team.icon;

  return (
    <div
      className={`${config.bg} rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] p-5 border ${config.border} relative overflow-hidden group`}
    >
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 ${config.decorative} rounded-full blur-2xl group-hover:${config.text}/10 transition-colors duration-500`}
      ></div>

      <div className="flex flex-col items-center gap-3 mb-6 relative z-10 text-center">
        <div className={`${config.iconBg} p-2 rounded-xl ${config.iconText}`}>
          <Icon className="w-5 h-5" />
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

      <div className="relative z-10 space-y-4">
        {team.subSections.map((subSection, idx) => (
          <div key={idx}>
            {subSection.title && <SectionDivider text={subSection.title} />}
            <div className="space-y-3">
              {subSection.members.map((member, memberIdx) =>
                team.highlightMode ? (
                  <CoordinatorHighlight
                    key={memberIdx}
                    member={{ ...member, role: subSection.title }}
                    config={config}
                    showBadge={false}
                    centered={false}
                  />
                ) : (
                  <MemberListItem key={memberIdx} member={member} />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InfoPage() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, idx) => (
            <TeamCard key={idx} team={team} />
          ))}
        </div>
      </div>
    </div>
  );
}
