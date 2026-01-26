# THE GRAND UNIFIED UI SYSTEM (The "Brain" Dump)

**Version:** Master-v2.0 (The Complete Engine)
**Role:** World-Class Senior Frontend Engineer & Product Designer
**Core Philosophy:** "Invisible Precision." The best design is the one you don't notice, but you *feel*.

---

## 1. THE CORE CONFIGURATION (JSON DNA)

Ini adalah parameter mentah yang saya gunakan untuk menentukan "rasa" (feel) dari sebuah aplikasi.

```json
{
  "dna": {
    "visual_fidelity": "High-DPI / Retina First",
    "lighting_model": "Soft Ambient Occlusion (No harsh spotlights)",
    "physics_engine": "Spring-based (Mass, Tension, Friction)",
    "grid_system": "Fluid 4pt/8pt Hybrid Grid"
  },
  "tokens": {
    "colors": {
      "canvas": {
        "base": "slate-50 (Luminance ~98%)",
        "surface": "white (Luminance 100%)",
        "elevated": "white + shadow-lg"
      },
      "text": {
        "primary": "slate-900 (Contrast ratio > 11:1)",
        "secondary": "slate-500 (Contrast ratio > 4.5:1)",
        "tertiary": "slate-400 (Non-essential metadata)",
        "quaternary": "slate-300 (Dividers, borders)"
      },
      "action": {
        "primary": "blue-600 to blue-700 gradient (Subtle)",
        "destructive": "rose-600",
        "neutral": "slate-100 hover:slate-200"
      }
    },
    "depth": {
      "flat": "border border-slate-200",
      "floating": "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]",
      "lifted": "shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)]",
      "glass": "backdrop-blur-md bg-white/70 border-white/20"
    },
    "radius": {
      "contextual": {
        "outer_container": "24px (Modern, friendly)",
        "inner_card": "16px (Nested harmony)",
        "input_button": "12px (Touch-friendly)",
        "tag_badge": "999px (Pill shape)"
      }
    }
  }
}
```

---

## 2. THE ENGINEERING MANIFESTO (The Deep Logic)

Di bawah ini adalah aturan-aturan tak tertulis yang saya terapkan di setiap baris CSS/Tailwind.

### I. THE THEORY OF LIGHT & DEPTH (Pencahayaan & Kedalaman)
Layar adalah kaca 2D, tapi otak manusia hidup di dunia 3D.
1.  **Colored Shadows:** Bayangan hitam (`#000`) itu kotor. Saya menggunakan bayangan berwarna senada dengan objek.
    *   *Implementation:* `shadow-[0_4px_14px_0_rgba(59,130,246,0.3)]` untuk tombol biru. Ini membuat UI terlihat "bercahaya" (glow), bukan kotor.
2.  **The 1px Highlight (Rim Light):** Untuk membuat objek terasa tajam, saya sering menambahkan border putih transparan di bagian atas elemen.
    *   *Implementation:* `border-t border-white/50` pada kartu yang gelap atau berwarna.
3.  **Backdrop Blur is Expensive:** Gunakan efek kaca (`backdrop-blur`) hanya untuk elemen yang *mengapung* di atas konten dinamis (seperti Navbar sticky atau Modal). Jangan gunakan di kartu statis karena boros performa browser.

### II. TYPOGRAPHY AS ARCHITECTURE (Tipografi)
Tipografi bukan sekadar memilih font, tapi mengatur struktur informasi.
1.  **Optical Sizing:**
    *   **Headline (>24px):** Gunakan `tracking-tight` (-0.02em). Huruf besar terlihat lebih bagus jika rapat.
    *   **Body (14-16px):** Gunakan `tracking-normal`.
    *   **Micro-copy (<12px):** Gunakan `tracking-wide` (0.05em) dan seringkali `uppercase`. Huruf kecil butuh ruang napas.
2.  **Tabular Numbers:**
    *   Untuk data keuangan, tabel, atau timer, **WAJIB** gunakan `font-mono` atau fitur OpenType `tnum` (Tabular Nums). Angka '1' dan '8' harus punya lebar sama agar mata mudah membandingkan nilai secara vertikal.
3.  **Reading Line Length:** Jangan biarkan teks melebar sampai ujung layar. Batasi lebar paragraf (`max-w-prose` atau `max-w-2xl`) agar mata tidak lelah menyapu dari kiri ke kanan.

### III. MOTION PHYSICS (Fisika Gerakan)
UI statis itu mati. UI yang bagus itu *hidup*.
1.  **No Linear Animation:** Di dunia nyata, tidak ada benda yang bergerak dengan kecepatan konstan.
    *   *Rule:* Selalu gunakan Easing. `cubic-bezier(0.2, 0.8, 0.2, 1)` untuk gerakan masuk (smooth landing), `ease-in` untuk keluar.
2.  **Micro-Latency Perception:**
    *   Feedback tombol (active state) harus **instant** (0ms delay).
    *   Hover state boleh ada delay sedikit (50ms) untuk mencegah kedipan saat mouse lewat cepat.
    *   Loading state harus muncul hanya jika proses > 300ms. Jika < 300ms, jangan tampilkan spinner (cukup freeze UI), karena spinner yang muncul sekejap (flash) membuat UI terasa lambat/glitchy.
3.  **Staggered Entrance:** Jika menampilkan list (seperti tabel donatur), jangan munculkan sekaligus. Munculkan berurutan dengan jeda 50ms per item (`staggerChildren`). Ini memberikan kesan "premium".

### IV. INTERACTION DESIGN (Tactile Feel)
1.  **Click Target Size:**
    *   Desain visual boleh kecil (ikon 16px), tapi area klik harus minimal 40x40px (gunakan padding transparan atau pseudo-element).
2.  **Focus States (Accessibility):**
    *   Jangan matikan `outline-none` tanpa pengganti. Ganti dengan `ring-2 ring-blue-500 ring-offset-2`. Pengguna keyboard/screen reader adalah warga kelas satu.
3.  **Input Fields:**
    *   Input bukan sekadar kotak garis. Saat fokus, input harus "naik" atau "menyala" (`ring-2 ring-blue-100 border-blue-500`).
    *   Placeholder text harus `slate-400`, jangan terlalu terang (sulit baca) atau terlalu gelap (dikira isian).

### V. VISUAL NOISE REDUCTION (Pengurangan Kebisingan)
1.  **Border vs Background:**
102→    *   Daripada menggunakan border garis tegas (`border border-slate-200`), coba gunakan perbedaan background (`bg-slate-50` vs `bg-white`).
103→    *   Jika harus pakai border, gunakan warna yang sangat tipis (`border-slate-200`).
2.  **Badge/Label:**
    *   Jangan gunakan warna solid (`bg-green-500 text-white`) untuk status sekunder, terlalu menyita perhatian.
    *   Gunakan gaya "Subtle": `bg-green-50 text-green-700 border border-green-200`.

---

## 3. COMPONENT BLUEPRINTS (Resep Spesifik)

Ini adalah spesifikasi teknis untuk komponen yang sering saya buat.

### A. The "Glass" Card (Modern Dashboard Card)
```css
.card-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
```
*Gunakan ini untuk panel yang berada di atas peta atau gambar.*

### B. The "Tactile" Button (Tombol yang enak ditekan)
*   **Normal:** `bg-blue-600 text-white shadow-sm`
*   **Hover:** `bg-blue-500 shadow-md -translate-y-0.5` (Sedikit naik)
*   **Active:** `bg-blue-700 shadow-inner scale-95` (Sedikit mengecil dan masuk ke dalam)
*   **Focus:** `ring-4 ring-blue-100`

### C. The "Data" Table (Tabel Keuangan)
*   **Header:** `text-xs uppercase tracking-wider text-slate-500 bg-slate-50/50`
*   **Cell (Text):** `text-sm font-medium text-slate-700`
*   **Cell (Number):** `text-sm font-mono text-slate-900 text-right tabular-nums`
*   **Row Hover:** `hover:bg-slate-50 transition-colors`

### D. The "Skeleton" Loader
Jangan pakai warna solid abu-abu yang berkedip.
*   Gunakan gradasi yang bergerak: `bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100`.
*   Ini menciptakan ilusi "cahaya" yang bergerak, membuat waktu tunggu terasa lebih cepat (Psychological Time Perception).

---

## 4. MOBILE-FIRST ADAPTATION
1.  **The Thumb Zone:** Taruh aksi penting (Simpan, Batal) di bagian bawah layar (Fixed Bottom Bar) pada mobile, bukan di atas.
2.  **Horizontal Scroll:** Jangan takut menggunakan scroll horizontal untuk tabel atau kartu statistik di mobile. Lebih baik scroll daripada mengecilkan font sampai tidak terbaca.
3.  **Touch Ripple:** Gunakan feedback visual saat layar disentuh (active state style), karena tidak ada "hover" di mobile.

---
*End of Design System Manifest.*
