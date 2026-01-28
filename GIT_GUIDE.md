# Panduan Git Al-Ikhlas 2026

Dokumen ini berisi panduan cara mengelola kode menggunakan Git, mulai dari pembuatan fitur baru hingga proses deploy ke *production*.

---

## 1. Konsep Dasar Branching
- **`main`**: Branch utama yang selalu stabil. Kode di branch ini adalah yang tampil di website publik.
- **`experiment`** (atau nama fitur lain): Branch tempat Anda mencoba fitur baru tanpa merusak kode utama.

---

## 2. Cara Membuat & Pindah Branch

### Pindah ke Branch `experiment` (atau buat jika belum ada)
Jika branch belum ada:
```powershell
git checkout -b experiment
```
Jika branch sudah ada:
```powershell
git checkout experiment
```

### Kembali ke Branch `main`
```powershell
git checkout main
```

---

## 3. Cara Menyimpan Perubahan (Commit)

Lakukan ini setiap kali Anda selesai mengubah kode:

1. Tandai file yang diubah:
   ```powershell
   git add .
   ```
2. Beri catatan perubahan:
   ```powershell
   git commit -m "Catatan: Menambahkan fitur X"
   ```

---

## 4. Cara Menggabungkan Kode (Merge)

Jika Anda sudah selesai mencoba di branch `experiment` dan ingin memasukkannya ke `main`:

1. Pindah ke branch tujuan (`main`):
   ```powershell
   git checkout main
   ```
2. Tarik kode terbaru dari server (opsional tapi disarankan):
   ```powershell
   git pull origin main
   ```
3. Gabungkan branch `experiment` ke `main`:
   ```powershell
   git merge experiment
   ```

---

## 5. Cara Kirim ke GitHub (Push)

Agar orang lain bisa melihat atau untuk keperluan deploy:

### Push branch saat ini:
```powershell
git push origin [nama-branch]
```
Contoh: `git push origin main` atau `git push origin experiment`.

---

## 6. Pertanyaan: Apakah Push ke GitHub Otomatis Deploy?

**JAWABAN: YA.**

Karena projek ini menggunakan folder `.vercel`, sistem biasanya sudah terhubung dengan **Vercel**. 
- Setiap kali Anda melakukan `git push origin main`, Vercel akan otomatis mendeteksi perubahan tersebut dan memulai proses **Build & Deploy**.
- Dalam waktu 1-3 menit setelah push, website Anda akan diperbarui secara otomatis.
- **Saran:** Jangan push langsung ke `main` jika kode belum yakin stabil. Gunakan branch `experiment` dulu untuk testing.

---

## Ringkasan Workflow Cepat:
1. `git checkout experiment` (pindah ke eksperimen)
2. *Edit kode...*
3. `git add .`
4. `git commit -m "update fitur"`
5. `git push origin experiment` (simpan ke cloud github sebagai cadangan)
6. `git checkout main` (pindah ke main jika sudah siap publish)
7. `git merge experiment` (gabungkan)
8. `git push origin main` (OTOMATIS DEPLOY/TERBIT)
