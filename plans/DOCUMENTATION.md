# Alikhlas2026 - Dokumentasi Proyek

## Deskripsi Singkat

Website resmi **Masjid Al-Ikhlas Kayuringin Jaya, Bekasi Selatan**. Platform manajemen masjid yang menyediakan informasi jadwal shalat, kajian rutin, laporan keuangan transparan, dan sistem donasi.

---

## Tech Stack

| Technology | Version | Keterangan |
|------------|---------|------------|
| Next.js | 16.1.2 | React Framework dengan App Router |
| React | 19.2.3 | UI Library |
| TypeScript | 5 | Type Safety |
| Tailwind CSS | 4 | Utility-first CSS Framework |
| Supabase JS | 2.90.1 | Backend as a Service (Database & Auth) |
| Framer Motion | 12.26.2 | Animation Library |
| Lucide React | 0.562.0 | Icon Library |

---

## Struktur Proyek

```
alikhlas2026/
├── app/                          # Next.js App Router
│   ├── layout.tsx                 # Root layout dengan Inter + JetBrains Mono fonts
│   ├── page.tsx                   # Halaman utama (Home)
│   └── globals.css                # Global styles & Tailwind v4 theme + utility classes
├── components/                    # React Components
│   ├── Header.tsx                 # Navigasi dengan mobile menu
│   ├── Hero.tsx                   # Banner + Jadwal Shalat (Aladhan API)
│   ├── RunningText.tsx            # Teks berjalan dari Supabase
│   ├── FeaturedSections.tsx        # Carousel Ustadz & Program + CRUD
│   ├── InfoSections.tsx           # Pengumuman & Laporan Keuangan + CRUD
│   ├── WeeklyKajianSchedule.tsx   # Jadwal Kajian Mingguan + CRUD
│   ├── DonationSection.tsx         # Sistem Donasi (Transfer/QRIS/Tunai)
│   ├── DonaturTetap.tsx           # Tracking Donatur Tetap dengan pagination
│   ├── Footer.tsx                  # Footer dengan info kontak
│   ├── MosqueIcon.tsx              # Icon Masjid SVG
│   ├── PrayerTimes.tsx             # Component Jadwal Shalat (legacy)
│   ├── FinancialReport.tsx          # Component Laporan Keuangan (legacy)
│   ├── EventSlider.tsx             # Component Event Slider (legacy)
│   └── ui/
│       └── Button.tsx              # UI Button Component
├── lib/
│   └── supabase.ts                # Supabase Client Configuration
├── public/                        # Static Assets
│   ├── alikhlas_luar.png
│   ├── alikhlas-malam.png
│   └── qrisalikhlas.jpg          # QR Code untuk donasi
├── plans/
│   ├── DOCUMENTATION.md             # Dokumentasi proyek
│   └── DESIGN_SYSTEM.md            # Design System guidelines
├── RULES.md                      # Kontrak pengembangan (WAJIB dibaca)
├── package.json                   # Dependencies & Scripts
├── next.config.ts                 # Next.js Configuration
├── tsconfig.json                  # TypeScript Configuration
└── README.md                     # Getting Started Guide
```

---

## Database Schema

### Tabel-tabel Utama

| Nama Tabel | Deskripsi |
|-------------|-----------|
| `running_text` | Teks berjalan untuk pengumuman |
| `featured_ustadz` | Daftar ustadz yang ditampilkan di carousel |
| `program_unggulan` | Program unggulan masjid |
| `announcements` | Pengumuman publik |
| `laporan_keuangan` | Laporan keuangan mingguan/bulanan |
| `kajian` | Jadwal kajian rutin per pekan |
| `donatur_tetap` | Data donatur tetap |
| `donatur_tetap_iuran` | Kontribusi bulanan donatur tetap |

### Storage Buckets

| Bucket | Deskripsi |
|--------|-----------|
| `featured` | Menyimpan gambar untuk carousel (ustadz & program) |

---

## Design System

Website ini menggunakan **Material You / Google AI Studio Design System** dengan prinsip-prinsip berikut:

### 1. Clean Canvas Protocol
- Background utama: `slate-50`
- Surface: `white`
- Tidak ada pure white background pada elemen utama

### 2. Typography Hierarchy
- **Labels**: `text-label` class (small, muted, uppercase)
  - `text-[10px] font-black uppercase tracking-widest text-slate-400`
- **Data**: `text-data` class (large, dark)
  - `text-sm md:text-base font-bold text-slate-900`
- **Monospace**: `text-mono` class (untuk numbers/code)
  - `font-mono font-bold`

### 3. Inside-Out Border Theory
- Border utama: `border-slate-100` (thin)
- Border hover: `border-emerald-200`
- Shadow minimal: `shadow-sm`
- Ring pada focus: `focus:ring-1 focus:ring-emerald-500/20`

### 4. Interactive Tactility
- Hover states: `hover:shadow-md`, `hover:border-emerald-200`
- Active states: `active:scale-95`
- Transitions: `transition-all duration-200`
- 200ms transition duration untuk semua interaktif

### 5. Border Radius Guidelines
- **Tombol/Toggle**: `rounded-full`
- **Card/Container**: `rounded-md`
- **Input/Select**: `rounded-md`
- **Badge/Tag**: `rounded-full`

### 5. Reductionism
- Padding konsisten: `p-4`, `p-6`, `p-8`
- Gap konsisten: `gap-2`, `gap-3`, `gap-4`
- Spacing vertical: `space-y-4`, `space-y-6`, `space-y-8`

### Font Configuration
- **UI Text**: Inter (Google Fonts)
- **Code/Numbers**: JetBrains Mono (Google Fonts)

---

## Fitur Utama

### 1. Jadwal Shalat
- **Sumber**: Aladhan API
- **Lokasi**: Bekasi, Indonesia
- **Fitur**:
  - Tampilkan 5 waktu shalat (Subuh, Dzuhur, Ashar, Maghrib, Isya)
  - Countdown ke shalat berikutnya
  - Tanggal Hijriah
  - Update real-time setiap detik
  - Icon per waktu shalat (Sunrise, Sun, SunMedium, Sunset, Moon)

### 2. Running Text (Teks Berjalan)
- **Sumber**: Supabase (`running_text` table)
- **Fitur**:
  - Filter: hanya tampilkan yang `aktif = true`
  - Animasi marquee infinite loop
  - Update otomatis dari database

### 3. Featured Sections (Carousel)
**Kajian Rutin** (`featured_ustadz`):
- Tampilkan foto & nama ustadz
- Navigasi previous/next
- CRUD: Tambah, Edit, Hapus
- Upload gambar ke Supabase Storage
- Section title centered, text-3xl, no icon

**Program Unggulan** (`program_unggulan`):
- Tampilkan foto & judul program
- Navigasi previous/next
- CRUD: Tambah, Edit, Hapus
- Upload gambar ke Supabase Storage
- Section title centered, text-3xl, no icon

### 4. Jadwal Kajian Mingguan
- **Sumber**: Supabase (`kajian` table)
- **Fitur**:
  - Filter per pekan (1-5)
  - Tampilkan hari, waktu, ustadz, kitab
  - CRUD: Tambah, Edit, Hapus
  - Grid layout 2 kolom (4 kajian per pekan)
  - Section title "Jadwal Kajian" centered, text-3xl, no icon

### 5. Pengumuman Terbaru
- **Sumber**: Supabase (`announcements` table)
- **Fitur**:
  - Tampilkan 2 pengumuman terbaru
  - Sort by tanggal (descending)
  - CRUD: Tambah, Edit, Hapus
  - Support gambar URL
  - Section title "Pengumuman Terbaru" centered, text-3xl, no icon

### 6. Laporan Keuangan
- **Sumber**: Supabase (`laporan_keuangan` table)
- **Fitur**:
  - Tampilkan laporan terbaru (bulan, tahun, minggu)
  - Hitung saldo akhir otomatis
  - CRUD: Tambah, Edit, Hapus
  - Format currency IDR
  - Section title "Laporan Keuangan" centered, text-3xl, no icon

### 7. Donatur Tetap
- **Sumber**: Supabase (`donatur_tetap` + `donatur_tetap_iuran`)
- **Fitur**:
  - Tracking kontribusi bulanan (12 kolom)
  - Filter per tahun (2025, 2026)
  - Search nama donatur
  - Pagination: 5 items per halaman dengan Previous/Next controls
  - Expand/collapse detail per bulan
  - Real-time updates via Supabase Realtime
  - Total kolektif per tahun
  - Persentase keaktifan
  - Section title "Donatur Tetap" centered, text-3xl
  - Table header: emerald-600 background dengan white text (Material You style)
  - Donor card colors: emerald untuk paid months

### 8. Sistem Donasi
**Transfer Bank**:
- Bank BRI: 162301000279569
- A/N: Masjid Al Ikhlas 1726
- Copy to clipboard functionality

**QRIS**:
- Gambar QR Code: `/qrisalikhlas.jpg`
- Support: GoPay, OVO, DANA, ShopeePay, LinkAja, BCA Mobile

**Donasi Tunai**:
- Kotak Amal (24 jam)
- Kepada Pengurus (dengan kwitansi)

### 9. Navigasi
**Desktop**:
- Menu dengan animated pill indicator (`rounded-full`)
- Active state dengan smooth transition
- Border: `border-slate-100`
- Hover: `hover:shadow-md`

**Mobile**:
- Hamburger menu dengan morphing icon (`rounded-full`)
- Staggered animation untuk menu items
- Full-screen overlay
- Menu items: `rounded-full`

---

## Section Title Guidelines

Semua section title mengikuti pattern yang sama:

```tsx
<div className="text-center">
  <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
    Section <span className="text-emerald-600">Title</span>
  </h3>
</div>
```

**Rules**:
- Title case (bukan uppercase)
- Font size: `text-3xl`
- Centered: `text-center`
- No icons
- Highlight word dengan `text-emerald-600`

**Daftar Section Titles**:
- "Kajian Rutin"
- "Program Unggulan"
- "Jadwal Kajian"
- "Laporan Keuangan"
- "Pengumuman Terbaru"
- "Donatur Tetap"

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Rules Pengembangan (WAJIB)

### 0) WORK MODE
- Kerjakan **hanya** task yang diminta pada stage saat ini
- **DILARANG** lompat ke stage berikutnya
- **DILARANG** refactor besar / rename massal
- Semua perubahan harus **patch kecil** dan **file-by-file**
- Maksimal **10 file berubah** per stage

### 1) BEFORE YOU CODE
Sebelum edit file, output dulu:
1. Ringkasan masalah/tujuan stage
2. Daftar file yang akan disentuh (dengan alasan)
3. Risiko utama + cara mitigasi
4. Checklist verifikasi (cara test manual)

### 2) NEXT.JS APP ROUTER RULES
- Semua file di `/app` default **Server Component**
- **DILARANG** memanggil hook client di Server Component
- Jika butuh hook client:
  - Tambahkan `"use client"` pada komponen khusus, atau
  - Buat komponen `XxxClient.tsx` lalu render dari `page.tsx`
- Akses `window/localStorage` wajib `"use client"`

### 3) DATA & SECURITY RULES
- Default: **client-first Supabase + RLS**
- Jangan bikin server actions yang butuh session cookies
- Enforce security via RLS untuk data user
- Jangan hardcode secret di client

### 4) UI KIT DEFAULT
- Style: **Google AI Studio / Developer Tool UI**
- Material You / Flat, clean, border halus, shadow minimal
- Font: Inter (UI) + JetBrains Mono (code/logs)
- Layout: AppShell + SplitPane

### 5) MCP / DOCS
- Gunakan **Context7** untuk verifikasi dependency
- Gunakan **Supabase MCP** untuk schema/RLS/seed

### 6) OUTPUT FORMAT
- Berikan patch/edits yang jelas (file path + perubahan)
- Setelah patch: tulis "How to verify"
- Jangan menulis tutorial panjang; fokus eksekusi

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm/yarn/pnpm/bun

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

### Build for Production

```bash
npm run build
npm start
```

---

## API External

### Aladhan API
- **Endpoint**: `https://api.aladhan.com/v1/timingsByCity`
- **Parameters**:
  - `city`: Bekasi
  - `country`: Indonesia
  - `method`: 2 (Islamic Society of North America)

---

## CSS Utility Classes

### Typography Classes
- `.text-label`: Label text (small, muted, uppercase)
- `.text-data`: Data text (large, dark, bold)
- `.text-mono`: Monospace text (untuk numbers/code)

### Transition Classes
- `.transition-200`: 200ms transition duration
- `.transition-300`: 300ms transition duration

---

## Kontribusi

1. Baca [`RULES.md`](RULES.md:1) terlebih dahulu
2. Baca [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md:1) untuk design guidelines
3. Ikuti aturan pengembangan yang sudah ditetapkan
4. Pastikan semua perubahan teruji sebelum commit
5. Max 10 file berubah per stage

### Riwayat Perubahan Terbaru

**2026-01-22**: Pengembangan Halaman Tentang & Refactor Donatur Tetap
- Halaman "Tentang": Integrasi konten lengkap (Sejarah, Visi/Misi, Fasilitas, Kontak) dengan desain modern dan animasi Framer Motion.
- Pembersihan Komponen: Penghapusan `ImageWithFallback` dan perbaikan integrasi `Header`.
- Donatur Tetap UX: Update selector tahun dari tombol pill menjadi dropdown material-style.
- Refactor Komponen: Ekstraksi `DonaturTetapCard` dari `donasidandonatur.tsx` untuk modularitas dan modernisasi UI donatur tetap.

**2026-01-19**: Update border-radius system
- Tombol/Toggle: `rounded-full`
- Card/Container: `rounded-md`
- Input/Select: `rounded-md`
- Badge/Tag: `rounded-full`

**2026-01-19**: Carousel improvements
- Auto-scroll: 5 detik (sebelumnya 2 detik)
- Pagination dots di bawah gambar (sebelumnya panah navigasi)
- Smooth slide animation dengan spring

**2026-01-19**: Section titles update
- Title case (bukan uppercase)
- Font size: `text-3xl`
- Centered: `text-center`
- No icons
- Highlight word dengan `text-emerald-600`

**2026-01-19**: DonaturTetap improvements
- Pagination: 5 items per halaman
- Material You table header (emerald-600 dengan white text)
- Donor card colors: emerald untuk paid months
- Mobile grid: 6 kolom (2 baris x 6 kolom)

**2026-01-19**: Design System application
- Clean Canvas Protocol (slate-50 background, white surfaces)
- Typography Hierarchy (labels vs data)
- Inside-Out Border Theory (thin borders, rings)
- Interactive Tactility (hover, active states)
- Reductionism (proper padding and gaps)
- Font: Inter (UI) + JetBrains Mono (code/logs)

---

## Kontak

- **Email**: masjid.alikhlas1726@gmail.com
- **Telepon**: 0813-8937-0881
- **Alamat**: Jl. Utama Raya RT.002/RW.026, Kayuringinjaya, Bekasi Selatan, Kota Bekasi, Jawa Barat 17144

---

## License

© 2026 Masjid Al-Ikhlas. Semua hak dilindungi.
