# Sistem Manajemen Pemulasaraan Al-Ikhlas

Sistem manajemen pemulasaraan untuk Al-Ikhlas dengan fitur kelola anggota keluarga, tracking iuran bulanan, dan laporan keuangan.

## Fitur

- **Manajemen Anggota Keluarga**
  - Kelola data anggota dengan sistem keluarga (Kepala Keluarga, Istri, Anak)
  - Filter berdasarkan jenis anggota, RT, RW
  - Pencarian berdasarkan nama atau nomor anggota

- **Tracking Iuran Bulanan**
  - Input dan update iuran bulanan (Januari - Desember)
  - Status pembayaran real-time per bulan
  - Filter berdasarkan tahun

- **Laporan & Export**
  - Export ke PDF dengan format landscape
  - Daftar anggota lengkap dengan detail pembayaran iuran
  - Nama dokumen: "DAFTAR ANGGOTA PEMULASARAAN AL-IKHLAS"

- **UI/UX**
  - Desain modern ala Google AI Studio / Developer Tool UI
  - Responsif untuk mobile dan desktop
  - Filter sejajar dalam satu baris yang rapi

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **PDF Generation**: jsPDF + jsPDF-autotable
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase project configured
- Environment variables set (`.env.local`)

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
alikhlas2026/
├── app/
│   └── pemulasaraan/          # Pemulasaraan module
├── components/
│   ├── pemulasaraan/
│   │   ├── MemberList.tsx     # Member list with filters
│   │   ├── FamilyCard.tsx     # Family card component
│   │   ├── MemberDialog.tsx   # Add/Edit member dialog
│   │   ├── ExportDuesDialog.tsx # Export to PDF dialog
│   │   └── Laporan.tsx        # Reports view
│   └── ui/                    # Reusable UI components
├── hooks/
│   └── pemulasaraan/
│       ├── useMembers.ts      # Members data hook
│       ├── useDues.ts         # Dues data hook
│       └── useFamilies.ts     # Families data hook
├── lib/
│   └── supabase/
│       └── client.ts          # Supabase client
└── types/
    └── membership.ts          # TypeScript types
```

## Database Schema

### Members Table

- `id`: Primary key
- `no_anggota`: Nomor anggota (format: `2/PEM/XXX`)
- `nama_lengkap`: Nama lengkap
- `jenis_anggota`: Jenis anggota (Anggota Umum, dll)
- `hubungan_keluarga`: Hubungan dalam keluarga (Kepala Keluarga, Istri, Anak, Cucu)
- `tanggal_keanggotaan`: Tanggal bergabung
- `pendaftaran`: Biaya pendaftaran
- `alamat`: Alamat lengkap
- `rt`: RT
- `rw`: RW

### Kartu Bulanan Table

- `id`: Primary key
- `kartu_id`: ID kartu
- `id_anggota`: ID anggota (foreign key)
- `no_anggota`: Nomor anggota
- `tahun`: Tahun
- `bulan_januari` s/d `bulan_desember`: Iuran bulanan

## Design System

Project menggunakan Google AI Studio / Developer Tool UI style:
- Clean, flat design dengan border halus
- Shadow minimal
- Font: Inter (UI) + JetBrains Mono (code/logs)
- Layout: AppShell dengan responsive design

Lihat [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) untuk detail lengkap.

## Development Notes

### Urutan Anggota

Urutan default:
1. Berdasarkan nomor anggota (angka di awal)
2. Dalam keluarga: Kepala Keluarga → Istri → Anak → Cucu

### Export PDF

- Landscape orientation untuk 20 kolom (8 kolom utama + 12 bulan)
- Header: "DAFTAR ANGGOTA PEMULASARAAN AL-IKHLAS"
- Subtitle: "Tahun {year}"
- Format nominal: Tanpa teks "Rp", hanya angka dengan pemisah ribuan

### Filter State

- Filter di MemberList.tsx sinkron dengan ExportDuesDialog.tsx
- Data yang ditampilkan sama antara tabel dan export PDF

## License

Private - Al-Ikhlas Pemulasaraan
