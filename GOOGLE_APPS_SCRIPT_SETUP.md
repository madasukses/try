# Setup Lengkap — Tryout CPNS (Google Apps Script + Vercel)

App ini bisa langsung dicoba tanpa setup apa pun (pakai 10 soal contoh
bawaan). Panduan ini untuk menyambungkan ke Google Sheet asli lewat Google
Apps Script — **menggantikan Sheety** yang bermasalah.

## 1. Google Sheet yang dibutuhkan

Sheet dengan 3 tab (nama harus persis huruf kecil): `soal`, `peserta`, `hasil`.
Kalau sudah pernah dibuat sebelumnya (dari setup Sheety), **pakai saja Sheet
yang sama** — tidak perlu bikin baru, datanya sudah benar.

- Tab `soal`: id, kode, kategori, soal, pilihanA, pilihanB, pilihanC, pilihanD, pilihanE, kunci
- Tab `peserta`: nama, noWa, waktuMulai (kosongkan baris data, cuma header)
- Tab `hasil`: nama, noWa, paket, skor, benar, salah, kosong, waktuSelesai, detailJawaban (kosongkan baris data, cuma header)

## 2. Pasang Apps Script di Sheet

1. Buka Google Sheet-nya.
2. Menu **Extensions → Apps Script** (kalau bahasa Indonesia: **Extensions → Apps Script** juga, menunya tetap bahasa Inggris).
3. Akan terbuka tab baru berisi editor kode, ada file `Code.gs` kosong (atau ada isi `function myFunction() {}`).
4. **Hapus semua isi editor**, ganti dengan isi file `google-apps-script/Code.gs` yang ada di folder project ini (copy-paste semuanya).
5. Klik ikon **Save** (gambar disket) di toolbar, atau Ctrl+S.

## 3. Deploy sebagai Web App

1. Klik tombol biru **Deploy** (pojok kanan atas) → **New deployment**.
2. Klik ikon gerigi ⚙️ di sebelah "Select type" → pilih **Web app**.
3. Isi:
   - Description: bebas, misal "API Tryout CPNS"
   - Execute as: **Me (email Anda)**
   - Who has access: **Anyone**
4. Klik **Deploy**.
5. Akan muncul minta izin ("Authorize access") — klik **Authorize access**, pilih akun Google Anda, kalau muncul peringatan "Google hasn't verified this app" klik **Advanced** → **Go to (nama project) (unsafe)** → **Allow**. Ini aman, karena scriptnya punya Anda sendiri.
6. Setelah selesai, akan muncul **Web app URL**, formatnya:
   ```
   https://script.google.com/macros/s/AKfycb........................../exec
   ```
   Copy URL ini.

> **Kalau nanti edit ulang kode Code.gs**, harus bikin deployment baru lagi (Deploy → Manage deployments → pilih deployment → ikon pensil → Version: New version → Deploy) supaya perubahan kepakai. URL-nya biasanya tetap sama kalau pakai "Manage deployments", tidak perlu ganti di Vercel lagi.

## 4. Sambungkan ke app

1. Salin `.env.local.example` menjadi `.env.local`.
2. Isi:
   ```
   NEXT_PUBLIC_GAS_URL=https://script.google.com/macros/s/AKfycb.........../exec
   ```
3. Jalankan `npm run dev` lalu buka `http://localhost:3000` — soal sekarang diambil dari Google Sheet asli.

## 5. Deploy ke Vercel

1. Push/upload project ke GitHub seperti biasa.
2. Di [vercel.com/new](https://vercel.com/new), import repo tersebut.
3. Tambahkan Environment Variable:
   - Key: `NEXT_PUBLIC_GAS_URL`
   - Value: URL Web App dari langkah 3.
4. Deploy.

Kalau project sudah pernah di-deploy sebelumnya (pakai Sheety): buka project di Vercel → **Settings → Environment Variables** → hapus `NEXT_PUBLIC_SHEETY_BASE_URL` yang lama (opsional, boleh dibiarkan juga tidak masalah karena sudah tidak dipakai kode) → tambahkan `NEXT_PUBLIC_GAS_URL` yang baru → lalu **redeploy** (Deployments → titik tiga pada deployment terbaru → Redeploy).

## 6. Kelola soal & lihat hasil sehari-hari

- **Tambah/edit soal**: langsung edit tab `soal` di Google Sheet — tidak perlu redeploy apa pun, perubahan langsung kepakai peserta berikutnya (Apps Script selalu baca data terbaru, tidak ada cache seperti Sheety).
- **Lihat hasil peserta**: buka tab `hasil` di Sheet.
- **Tambah paket baru**: tambah baris di tab `soal` dengan `kode` baru (SOAL3, SOAL4, dst) — otomatis muncul sebagai paket baru di halaman Pilih Paket.

## Kalau nanti bermasalah lagi

- Buka langsung URL Web App-nya di browser + `?sheet=soal` di belakangnya, contoh:
  `https://script.google.com/macros/s/AKfycb.../exec?sheet=soal`
  Kalau muncul data JSON berisi soal, berarti Apps Script-nya sudah benar — masalah ada di Vercel (env var belum diisi/belum redeploy). Kalau muncul error atau kosong, masalah ada di Apps Script/Sheet-nya.
